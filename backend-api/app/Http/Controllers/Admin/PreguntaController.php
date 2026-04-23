<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PreguntaRequest;
use App\Models\Pregunta;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class PreguntaController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Pregunta::class);
        $preguntas = Pregunta::with('opciones')->paginate(20);
        return response()->json($preguntas);
    }

    public function store(PreguntaRequest $request)
    {
        $this->authorize('create', Pregunta::class);
        $pregunta = Pregunta::create($request->validated());
        $pregunta->load('opciones');
        return response()->json($pregunta, 201);
    }

    public function show(Pregunta $pregunta)
    {
        $this->authorize('view', $pregunta);
        $pregunta->load('opciones');
        return response()->json($pregunta);
    }

    public function update(PreguntaRequest $request, Pregunta $pregunta)
    {
        $this->authorize('update', $pregunta);
        $pregunta->update($request->validated());
        $pregunta->load('opciones');
        return response()->json($pregunta);
    }

    public function destroy(Pregunta $pregunta)
    {
        $this->authorize('delete', $pregunta);
        $pregunta->delete();
        return response()->json(null, 204);
    }
}
