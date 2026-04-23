<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class LeccionHeartbeatRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'id_progreso' => 'required|integer|exists:progreso_estudiante,id_progreso',
            'current_time' => 'required|integer',
            'previous_time' => 'required|integer',
        ];
    }
}
