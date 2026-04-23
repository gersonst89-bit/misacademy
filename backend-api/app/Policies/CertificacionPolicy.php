<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Certificacion;

class CertificacionPolicy
{
    // Ver todas las certificaciones (solo admin)
    public function viewAny(Usuario $user)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
    }
    // Solo administradores pueden crear y eliminar certificaciones
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
    }

    // El usuario puede ver solo sus certificaciones
    public function view(Usuario $user, Certificacion $certificacion)
    {
        return $user->id_usuario === $certificacion->id_usuario;
    }


    public function create(Usuario $user)
    {
        return true;
    }

    public function update(Usuario $user, Certificacion $certificacion)
    {
        return true;
    }

    public function delete(Usuario $user, Certificacion $certificacion)
    {
        return true;
    }
}
