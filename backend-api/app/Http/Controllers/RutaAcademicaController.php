<?php

namespace App\Http\Controllers;

use App\Http\Requests\RutaAcademicaRequest;
use App\Http\Requests\AsociarCursosRutaRequest;
use App\Http\Requests\EliminarCursosRutaRequest;
use App\Services\RutaAcademicaService;
use Illuminate\Http\Request;

class RutaAcademicaController extends Controller
{
    /**
     * Eliminar varios cursos de una ruta académica (solo admin)
     * DELETE /api/rutas/{id_ruta}/cursos
     */
    public function eliminarCursos(EliminarCursosRutaRequest $request, $id_ruta)
    {
        $ruta = $this->rutaService->detalleRuta($id_ruta);
        $ids = $request->input('cursos');
        $ruta->cursos()->detach($ids);
        return response()->json([
            'message' => 'Cursos eliminados correctamente de la ruta.',
            'ruta_id' => $ruta->id_ruta,
            'cursos_eliminados' => $ids
        ], 200);
    }
    protected $rutaService;

    /**
     * Asociar varios cursos a una ruta académica (solo admin)
     * POST /api/rutas/{id_ruta}/cursos
     */
    public function agregarCursos(AsociarCursosRutaRequest $request, $id_ruta)
    {
        $ruta = $this->rutaService->detalleRuta($id_ruta);
        $cursos = collect($request->input('cursos'));
        $attachData = [];
        foreach ($cursos as $curso) {
            $attachData[$curso['id_curso']] = [
                'orden' => $curso['orden'] ?? null
            ];
        }
        // Solo agrega, no elimina existentes
        $ruta->cursos()->syncWithoutDetaching($attachData);
        return response()->json([
            'message' => 'Cursos asociados correctamente a la ruta.',
            'ruta_id' => $ruta->id_ruta,
            'cursos_agregados' => $cursos->pluck('id_curso')
        ], 200);
    }

    public function __construct(RutaAcademicaService $rutaService)
    {
        $this->rutaService = $rutaService;
    }

    public function index(Request $request)
    {
        $filters = $request->all();
        $perPage = $request->get('per_page', 15);
        return response()->json($this->rutaService->listarRutas($filters, $perPage));
    }

    public function destacadas()
    {
        return response()->json($this->rutaService->rutasDestacadas());
    }

    public function buscar(Request $request)
    {
        $query = $request->get('q', '');
        $perPage = $request->get('per_page', 15);
        $result = $this->rutaService->buscarRutas($query, $perPage);
        return response()->json([
            'data' => $result->items(),
            'current_page' => $result->currentPage(),
            'last_page' => $result->lastPage(),
            'per_page' => $result->perPage(),
            'total' => $result->total(),
        ]);
    }

    public function show($id)
    {
        $ruta = $this->rutaService->detalleRuta($id);
        return response()->json($ruta);
    }

    public function store(RutaAcademicaRequest $request)
    {
        $data = $request->validated();
        $ruta = $this->rutaService->crearRuta($data);
        return response()->json([
            'message' => 'Ruta creada correctamente.',
            'ruta_id' => $ruta->id_ruta
        ], 201);
    }

    public function update(RutaAcademicaRequest $request, $id)
    {
        $data = $request->validated();
        $ruta = $this->rutaService->actualizarRuta($id, $data);
        return response()->json([
            'message' => 'Ruta actualizada correctamente.',
            'ruta_id' => $ruta->id_ruta
        ]);
    }

    public function destroy($id)
    {
        $this->rutaService->eliminarRuta($id);
        return response()->json(['message' => 'Ruta eliminada correctamente.']);
    }
}
