<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Material;
use App\Models\Modulo;

class MaterialPolicy
{
    // Permitir todo al admin
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
    }

    // Listar/ver materiales: acceso público y autenticado
    public function viewAny(?Usuario $user)
    {
        return true;
    }

    public function view(?Usuario $user, Material $material)
    {
        // Público: solo materiales publicados
        if (!$user) {
            return $material->estado === 'Publicado';
        }
        // Estudiante/invitado: solo publicados
        if ($user->rol && in_array(strtolower($user->rol->nombre_rol), ['estudiante', 'invitado'])) {
            return $material->estado === 'Publicado';
        }
        // Docente: solo materiales de sus módulos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $modulo = $material->modulo;
            return $modulo && $modulo->curso && $modulo->curso->id_docente === $user->id_usuario;
        }
        return false;
    }

    // Crear material: admin o docente dueño del módulo
    public function create(Usuario $user, Material $material)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $modulo = $material->modulo;
            return $modulo && $modulo->curso && $modulo->curso->id_docente === $user->id_usuario;
        }
        return false;
    }

    // Actualizar material: admin o docente dueño del módulo
    public function update(Usuario $user, Material $material)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $modulo = $material->modulo;
            return $modulo && $modulo->curso && $modulo->curso->id_docente === $user->id_usuario;
        }
        return false;
    }

    // Eliminar material: admin o docente dueño del módulo
    public function delete(Usuario $user, Material $material)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $modulo = $material->modulo;
            return $modulo && $modulo->curso && $modulo->curso->id_docente === $user->id_usuario;
        }
        return false;
    }
}
