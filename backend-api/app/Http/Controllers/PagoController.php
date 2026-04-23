<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Http\Requests\PagoRequest;
use Illuminate\Http\Request;
use App\Models\PagoAuditoria;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Mail\PagoRegistradoMail;
use App\Mail\PagoEstadoMail;
use App\Mail\ComprobanteUsuarioMail;
use App\Mail\BoletaFacturaMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Validation\ValidationException;
use Exception;

class PagoController extends Controller
{
    // Generar enlace de WhatsApp para comprobante de pago
    public function enlaceWhatsapp($id)
    {
        $pago = Pago::findOrFail($id);
        // Solo el usuario dueño del pago puede generar el enlace
        if ($pago->id_usuario !== Auth::id()) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }
        $numeroSoporte = '51935511631'; // Número de WhatsApp de soporte (sin + ni espacios)
        $mensaje = urlencode("Hola, mi número de transacción es {$pago->id_pago}. Por favor validar mi pago.");
        $url = "https://wa.me/{$numeroSoporte}?text={$mensaje}";
        return response()->json([
            'whatsapp_url' => $url,
            'status' => 'success'
        ]);
    }

    public function historialCompras()
    {
        $pagos = Pago::where('id_usuario', Auth::id())
            ->where('estado', 'Completado')
            ->with(['detalles.curso'])
            ->orderByDesc('fecha_pago')
            ->get();

        $compras = [];
        foreach ($pagos as $pago) {
            foreach ($pago->detalles as $detalle) {
                $curso = $detalle->curso;
                $compras[] = [
                    'id_pago' => $pago->id_pago,
                    'fecha_pago' => $pago->fecha_pago,
                    'precio' => $detalle->total,
                    'curso' => [
                        'id_curso' => $curso->id_curso,
                        'nombre' => $curso->nombre,
                        'descripcion' => $curso->descripcion,
                        'imagen' => $curso->imagen ?? null,
                    ]
                ];
            }
        }
        return response()->json([
            'compras' => $compras,
            'status' => 'success'
        ]);
    }

    // RF001: Selección de método de pago y registro
    public function store(PagoRequest $request)
    {
        $validated = $request->validated();

        // Validar que el tipo de pago exista
        $tipoPago = DB::table('tipos_pagos')
            ->where('id_tipo_pago', $validated['id_tipo_pago'])
            ->first();
        if (!$tipoPago) {
            return response()->json([
                'mensaje' => 'El tipo de pago seleccionado no existe.',
                'status' => 'error'
            ], 422);
        }


        // Obtener el carrito del usuario
        $carrito = \App\Models\CarritoCompra::with('items')->where('id_usuario', Auth::id())->where('estado', 'Activo')->first();
        if (!$carrito || $carrito->items->count() === 0) {
            return response()->json(['mensaje' => 'El carrito está vacío.'], 422);
        }

        // Calcular el monto total desde el carrito
        $montoTotal = $carrito->items->sum('precio');

        try {
            $imagenPath = null;
            
            // Procesar imagen de comprobante si se envió
            if ($request->hasFile('imagen_comprobante')) {
                $file = $request->file('imagen_comprobante');
                $fileName = time() . '_comprobante_' . $file->getClientOriginalName();
                $file->move(public_path('comprobantes'), $fileName);
                $imagenPath = 'comprobantes/' . $fileName;
            }
            
            $pago = Pago::create([
                'id_usuario' => Auth::id(),
                'id_tipo_pago' => $validated['id_tipo_pago'],
                'monto' => $montoTotal,
                'fecha_pago' => now(),
                'estado' => 'Pendiente',
                'detalles_transaccion' => $validated['detalles_transaccion'] ?? null,
                'imagen_comprobante' => $imagenPath,
            ]);

            // Guardar detalle de cada curso pagado y vaciar el carrito
            $carrito = \App\Models\CarritoCompra::with('items')->where('id_usuario', Auth::id())->where('estado', 'Activo')->first();
            if ($carrito && $carrito->items->count() > 0) {
                foreach ($carrito->items as $item) {
                    \App\Models\DetallePago::create([
                        'id_pago' => $pago->id_pago,
                        'id_curso' => $item->id_curso,
                        'precio_unitario' => $item->precio,
                        'descuento' => 0,
                        'total' => $item->precio
                    ]);
                }
                $carrito->items()->delete(); // Vaciar carrito
            }

            // RF004: Generar comprobante digital
            $comprobante = [
                'numero_transaccion' => $pago->id_pago,
                'concepto' => $validated['concepto'],
                'monto' => $pago->monto,
                'fecha' => $pago->fecha_pago,
                'estado' => $pago->estado,
            ];

            // RF005: Notificación automática al usuario
            if ($pago->usuario && $pago->usuario->email) {
                Mail::to($pago->usuario->email)->send(new PagoRegistradoMail($pago, $comprobante));
            }
            
            // Enviar comprobante al admin si hay imagen
            if ($imagenPath) {
                $adminEmail = env('ADMIN_EMAIL', 'jhanpoolmonroy15@gmail.com');
                Mail::to($adminEmail)->send(new ComprobanteUsuarioMail($pago, $imagenPath));
            }

            return response()->json([
                'mensaje' => 'Pago registrado correctamente',
                'comprobante' => $comprobante,
                'status' => 'success'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (Exception $e) {
            Log::error('Error al registrar pago: ' . $e->getMessage());
            return response()->json([
                'mensaje' => 'Error interno al registrar el pago',
                'status' => 'error'
            ], 500);
        }
    }

    // RF003: Historial de pagos del usuario
    public function historial()
    {
        $pagos = Pago::where('id_usuario', Auth::id())
            ->orderByDesc('fecha_pago')
            ->get();

        return response()->json([
            'historial' => $pagos,
            'status' => 'success'
        ]);
    }

    // RF005: Panel de control de transacciones (Admin)
    public function index(Request $request)
    {
        $query = Pago::with(['usuario', 'tipoPago']);
        if ($request->filled('usuario')) {
            $query->where('id_usuario', $request->usuario);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('fecha')) {
            $query->whereDate('fecha_pago', $request->fecha);
        }
        $pagos = $query->orderByDesc('fecha_pago')->get();
        return response()->json([
            'pagos' => $pagos,
            'status' => 'success'
        ]);
    }

    // RF005: Actualización de estado (Admin)
    public function actualizarEstado(\App\Http\Requests\Admin\UpdatePagoEstadoRequest $request, $id)
    {
        $pago = Pago::findOrFail($id);
        $estadoAnterior = $pago->estado;
        $estadoNuevo = $request->input('estado');
        // Validar transición de estado
        $transicionesValidas = [
            'Pendiente' => ['Completado', 'Fallido', 'Reembolsado'],
            'Completado' => ['Reembolsado'],
            'Fallido' => [],
            'Reembolsado' => []
        ];
        if (!in_array($estadoNuevo, $transicionesValidas[$estadoAnterior])) {
            return response()->json([
                'mensaje' => "Transición de estado no permitida: $estadoAnterior → $estadoNuevo",
                'status' => 'error'
            ], 422);
        }
        $pago->estado = $estadoNuevo;
        $pago->save();
        // Log crítico de cambio de estado
        Log::channel('payments')->info('Estado de pago actualizado', [
            'pago_id' => $pago->id_pago,
            'usuario_afectado' => $pago->id_usuario,
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $estadoNuevo,
            'monto' => $pago->monto,
            'admin_id' => Auth::user() ? Auth::user()->id_usuario : null,
            'ip' => request()->ip()
        ]);

        if ($estadoNuevo === 'Completado') {
            foreach ($pago->detalles as $detalle) {
                $idCurso = $detalle->id_curso;
                $idUsuario = $pago->id_usuario;
                $yaInscrito = \App\Models\Inscripcion::where('id_usuario', $idUsuario)
                    ->where('id_curso', $idCurso)
                    ->exists();
                if (!$yaInscrito) {
                    \App\Models\Inscripcion::create([
                        'id_usuario' => $idUsuario,
                        'id_curso' => $idCurso,
                        'fecha_inscripcion' => now(),
                        'estado' => 'Activo',
                        'progreso_total' => 0,
                        'fecha_completado' => null
                    ]);
                }
            }
            
            // Generar boleta/factura PDF
            try {
                $tipoDocumento = $request->input('tipo_documento', 'Boleta'); // Boleta o Factura
                $data = [
                    'pago' => $pago,
                    'usuario' => $pago->usuario,
                    'detalles' => $pago->detalles,
                    'tipoDocumento' => $tipoDocumento
                ];
                
                $pdf = Pdf::loadView('pdf.boleta-factura', $data);
                $fileName = $tipoDocumento . '_' . $pago->id_pago . '.pdf';
                $pdfPath = storage_path('app/boletas/' . $fileName);
                
                // Crear directorio si no existe
                if (!file_exists(storage_path('app/boletas'))) {
                    mkdir(storage_path('app/boletas'), 0755, true);
                }
                
                $pdf->save($pdfPath);
                
                // Enviar PDF al usuario
                if ($pago->usuario && $pago->usuario->email) {
                    Mail::to($pago->usuario->email)->send(new BoletaFacturaMail($pago, $pdfPath, $tipoDocumento));
                }
                
                // Eliminar imagen de comprobante después de procesar
                if ($pago->imagen_comprobante && file_exists(public_path($pago->imagen_comprobante))) {
                    unlink(public_path($pago->imagen_comprobante));
                    $pago->imagen_comprobante = null;
                    $pago->save();
                }
                
            } catch (\Exception $e) {
                Log::error('Error al generar boleta/factura: ' . $e->getMessage());
            }
        }

        // Notificación automática al usuario por cambio de estado
        if ($pago->usuario && $pago->usuario->email) {
            Mail::to($pago->usuario->email)->send(new PagoEstadoMail($pago, $estadoAnterior, $estadoNuevo));
        }
        return response()->json([
            'mensaje' => 'Estado actualizado',
            'pago' => $pago,
            'status' => 'success'
        ]);
    }
}
