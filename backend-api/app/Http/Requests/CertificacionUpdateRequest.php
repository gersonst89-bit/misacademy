<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\Certificacion;

class CertificacionUpdateRequest extends BaseApiRequest
{
    public function authorize()
    {
        $id = $this->route('id');
        $certificacion = Certificacion::find($id);
        // Solo permitir edición si es adicional
        return $certificacion && $certificacion->tipo_certificado === 'adicional';
    }

    public function rules()
    {
        return [
            'codigo_certificado' => 'required|string|max:50|unique:certificaciones,codigo_certificado,' . $this->route('id') . ',id_certificacion',
            'nombre_curso' => 'required|string|max:255',
            'nombre_estudiante' => 'required|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'total_horas' => 'required|integer|min:1',
            'email_destinatario' => 'required|email|max:255',
            'tipo_certificado' => 'required|in:adicional',
            'fecha_emision' => 'required|date',
        ];
    }
}
