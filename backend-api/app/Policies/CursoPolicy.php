<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Curso;
use Illuminate\Support\Facades\Log;


class CursoPolicy
{
    // Permitir todo al admin
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
    }

    // Listado de cursos: acceso público y autenticado
    public function viewAny(?Usuario $user)
    {
        // Permitir acceso público (sin autenticación)
        if (!$user) return true;
        
        // Si está autenticado, verificar rol
        return $user->rol && in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente', 'estudiante']);
    }

    // Ver detalle de curso: acceso público y autenticado
    public function view(?Usuario $user, Curso $curso)
    {
        // Permitir acceso público (sin autenticación)
        if (!$user) return true;
        
        // Si está autenticado, verificar rol
        return $user->rol && in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente', 'estudiante']);
    }

    // Crear curso: solo admin
    public function create(Usuario $user)
    {
        return $user->rol && strtolower($user->rol->nombre_rol) === 'administrador';
    }

    // Editar curso: admin puede editar cualquiera, docente solo los suyos
    public function update(Usuario $user, Curso $curso)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            Log::info('Policy update ejecutada para usuario: ' . $user->id_usuario);
            return $curso->id_docente === $user->id_usuario;
        }
        return $user->rol && strtolower($user->rol->nombre_rol) === 'administrador';
    }

    // Eliminar curso: solo admin
    public function delete(Usuario $user, Curso $curso)
    {
        return $user->rol && strtolower($user->rol->nombre_rol) === 'administrador';
    }
}