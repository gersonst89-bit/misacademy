<?php
namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateMaterialRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'id_modulo' => 'sometimes|required|exists:modulos,id_modulo',
            'nombre' => 'sometimes|required|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:20480', // 20MB máximo, opcional en update
            'estado' => 'sometimes|required|in:Publicado,Archivado',
        ];
    }
}