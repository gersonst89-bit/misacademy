<?php

namespace App\Http\Controllers;

use App\Http\Requests\LineaAcademicaRequest;
use App\Services\LineaAcademicaService;
use Illuminate\Http\Request;

class LineaAcademicaController extends Controller
{

    protected $lineaService;
    public function __construct(LineaAcademicaService $lineaService)
    {
        $this->lineaService = $lineaService;
    }

    /**
     * Cambia solo el estado de una línea académica
     */
    public function updateEstado(\App\Http\Requests\UpdateLineaAcademicaEstadoRequest $request, $id)
    {
        $linea = $this->lineaService->detalleLinea($id);
        $linea->estado = $request->input('estado');
        $linea->save();
        return response()->json([
            'message' => 'Estado actualizado correctamente.',
            'linea_id' => $linea->id_linea,
            'estado' => $linea->estado
        ]);
    }

    public function index(Request $request)
    {
        $filters = $request->all();
        $perPage = $request->get('per_page', 15);
        return response()->json($this->lineaService->listarLineas($filters, $perPage));
    }

    public function show($id)
    {
        $linea = $this->lineaService->detalleLinea($id);
        return response()->json($linea);
    }

    public function store(LineaAcademicaRequest $request)
    {
        $data = $request->validated();
        $linea = $this->lineaService->crearLinea($data);
        return response()->json([
            'message' => 'Línea académica creada correctamente.',
            'linea_id' => $linea->id_linea
        ], 201);
    }

    public function update(LineaAcademicaRequest $request, $id)
    {
        $data = $request->validated();
        $linea = $this->lineaService->actualizarLinea($id, $data);
        return response()->json([
            'message' => 'Línea académica actualizada correctamente.',
            'linea_id' => $linea->id_linea
        ]);
    }

    public function destroy($id)
    {
        $this->lineaService->eliminarLinea($id);
        return response()->json(['message' => 'Línea académica eliminada correctamente.']);
    }
}
