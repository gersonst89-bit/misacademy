<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    // Listar auditorías (paginado, con filtros opcionales)
    public function index(Request $request)
    {
        $query = Audit::with('user.rol');

        if ($request->filled('model')) {
            $query->where('auditable_type', $request->input('model'));
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }
        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }
        if ($request->filled('fecha_inicio')) {
            $query->where('created_at', '>=', $request->input('fecha_inicio'));
        }
        if ($request->filled('fecha_fin')) {
            $query->where('created_at', '<=', $request->input('fecha_fin'));
        }

        $auditorias = $query->orderByDesc('created_at')->paginate(50);

        // Mapea para mostrar nombre, email y rol del usuario
        $auditorias->getCollection()->transform(function ($audit) {
            return [
                'id' => $audit->id,
                'event' => $audit->event,
                'model' => $audit->auditable_type,
                'model_id' => $audit->auditable_id,
                'user_id' => $audit->user_id,
                'user_name' => $audit->user ? $audit->user->nombre : null,
                'user_email' => $audit->user ? $audit->user->email : null,
                'user_rol' => ($audit->user && $audit->user->rol) ? $audit->user->rol->nombre_rol : null,
                'old_values' => $audit->old_values,
                'new_values' => $audit->new_values,
                'url' => $audit->url,
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
                'created_at' => $audit->created_at,
            ];
        });

        return response()->json($auditorias);
    }
}