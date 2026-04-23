<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OpcionRespuestaRequest;
use App\Models\OpcionRespuesta;
use Illuminate\Http\Request;

class OpcionRespuestaController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', OpcionRespuesta::class);
        $opciones = OpcionRespuesta::with('pregunta')->paginate(20);
        return response()->json($opciones);
    }

    public function store(OpcionRespuestaRequest $request)
    {
        $this->authorize('create', OpcionRespuesta::class);
        $opcion = OpcionRespuesta::create($request->validated());
        $opcion->load('pregunta');
        return response()->json($opcion, 201);
    }

    public function show(OpcionRespuesta $opcionRespuesta)
    {
        $this->authorize('view', $opcionRespuesta);
        $opcionRespuesta->load('pregunta');
        return response()->json($opcionRespuesta);
    }

    public function update(OpcionRespuestaRequest $request, OpcionRespuesta $opcionRespuesta)
    {
        $this->authorize('update', $opcionRespuesta);
        $opcionRespuesta->update($request->validated());
        $opcionRespuesta->load('pregunta');
        return response()->json($opcionRespuesta);
    }

    public function destroy(OpcionRespuesta $opcionRespuesta)
    {
        $this->authorize('delete', $opcionRespuesta);
        $opcionRespuesta->delete();
        return response()->json(null, 204);
    }
}
