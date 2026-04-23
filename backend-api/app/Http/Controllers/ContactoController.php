<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactoRequest;
use App\Services\ContactoService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;

class ContactoController extends Controller
{
    protected $contactoService;

    public function __construct(ContactoService $contactoService)
    {
        $this->contactoService = $contactoService;
    }

    public function store(ContactoRequest $request)
    {
        $data = $request->validated();
        $adminEmail = env('ADMIN_EMAIL', 'jhanpoolmonroy15@gmail.com');
        Mail::to($adminEmail)->send(new \App\Mail\ContactoMail($data));
        return response()->json([
            'message' => 'Tu mensaje ha sido enviado correctamente al administrador.'
        ], 200);
    }
}
