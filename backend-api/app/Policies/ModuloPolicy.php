<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Modulo;

class ModuloPolicy
{
    // Permitir todo al admin
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
    }

    // Listar/ver módulos: acceso público y autenticado
    public function viewAny(?Usuario $user)
    {
        return true;
    }

    public function view(?Usuario $user, Modulo $modulo)
    {
        return true;
    }

    // Crear módulo: admin o docente dueño del curso
    public function create(Usuario $user, Modulo $modulo)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            return $modulo->curso && $modulo->curso->id_docente === $user->id_usuario;
        }
        return false;
    }

    // Editar módulo: admin o docente dueño del curso
    public function update(Usuario $user, Modulo $modulo)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            return $modulo->curso && $modulo->curso->id_docente === $user->id_usuario;
        }
        return false;
    }

    // Eliminar módulo: admin o docente dueño del curso
    public function delete(Usuario $user, Modulo $modulo)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            return $modulo->curso && $modulo->curso->id_docente === $user->id_usuario;
        }
        return false;
    }
}
