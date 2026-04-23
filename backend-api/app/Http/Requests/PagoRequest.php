<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class PagoRequest extends BaseApiRequest
{
    public function authorize()
    {
        return $this->user() != null;
    }

    public function rules()
    {
        return [
            'id_tipo_pago' => 'required|exists:tipos_pagos,id_tipo_pago',
            'concepto' => 'required|string|max:255',
            'detalles_transaccion' => 'nullable|string',
            'imagen_comprobante' => 'nullable|image|mimes:jpeg,jpg,png|max:5120', // 5MB máximo
        ];
    }

    public function messages()
    {
        return [
            'id_tipo_pago.required' => 'El tipo de pago es obligatorio.',
            'id_tipo_pago.exists' => 'El tipo de pago seleccionado no existe.',
            'concepto.required' => 'El concepto es obligatorio.',
            'concepto.max' => 'El concepto no puede superar 255 caracteres.'
        ];
    }
}
