<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReclamacionRequest;
use App\Models\Reclamacion;
use Illuminate\Http\Request;

class ReclamacionController extends Controller
{
    public function store(ReclamacionRequest $request)
    {
        $data = $request->validated();
        $reclamacion = Reclamacion::create($data);

        // Enviar correo al admin
        \Mail::to('jhanpoolmonroy15@gmail.com')->send(new \App\Mail\NuevoReclamoMail($reclamacion));

        return response()->json([
            'message' => 'Reclamación registrada correctamente.',
            'reclamacion' => $reclamacion,
        ], 201);
    }
}
