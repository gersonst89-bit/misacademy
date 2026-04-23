<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuthenticationLog;

class AuthLogController extends Controller
{
    // Listar logs de autenticación (paginado, con filtros opcionales)
    public function index(Request $request)
    {
        $query = AuthenticationLog::query();

        if ($request->filled('user_id')) {
            $query->where('authenticatable_id', $request->input('user_id'));
        }
        if ($request->filled('success')) {
            $query->where('login_successful', $request->input('success'));
        }
        if ($request->filled('ip')) {
            $query->where('ip_address', $request->input('ip'));
        }
        if ($request->filled('fecha_inicio')) {
            $query->where('login_at', '>=', $request->input('fecha_inicio'));
        }
        if ($request->filled('fecha_fin')) {
            $query->where('login_at', '<=', $request->input('fecha_fin'));
        }

        $logs = $query->orderByDesc('login_at')->paginate(50);

        return response()->json($logs);
    }
}