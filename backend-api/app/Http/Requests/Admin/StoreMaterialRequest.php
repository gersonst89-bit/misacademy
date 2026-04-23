<?php
namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreMaterialRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'id_modulo' => 'required|exists:modulos,id_modulo',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'archivo' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:20480', // 20MB máximo
            'estado' => 'sometimes|in:Publicado,Archivado',
        ];
    }
}