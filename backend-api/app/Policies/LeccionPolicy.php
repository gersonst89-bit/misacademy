<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Leccion;
use App\Models\Inscripcion;

class LeccionPolicy
{
    // Admin bypass - admin puede hacer todo
        public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
        return null;
    }

    // Listar lecciones - acceso público para index básico
    public function viewAny(?Usuario $user)
    {
        // Permitir acceso público para ver listado básico
        return true;
    }

    // Ver lección específica - diferenciado por rol
    public function view(?Usuario $user, Leccion $leccion)
    {
        // Sin autenticación: acceso público limitado (solo info básica)
        if (!$user) {
            return $leccion->estado === 'Publicado';
        }

        // Estudiante: necesita inscripción activa + pago completado
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            return $this->estudiantePuedeAcceder($user, $leccion);
        }

        // Docente: solo lecciones de sus propios cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            return $this->esDocenteDelCurso($user, $leccion);
        }

        return false;
    }

    // Crear lección: admin o docente
    public function create(Usuario $user)
    {
        return $user->rol && in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente']);
    }

    // Actualizar lección: admin o docente dueño del curso
    public function update(Usuario $user, Leccion $leccion)
    {
        if (!$user->rol) return false;
        
        $rol = strtolower($user->rol->nombre_rol);
        
        if ($rol === 'docente') {
            return $this->esDocenteDelCurso($user, $leccion);
        }
        
        // Admin puede actualizar cualquier lección (manejado por before())
        return false;
    }

    // Eliminar lección: admin o docente dueño del curso
    public function delete(Usuario $user, Leccion $leccion)
    {
        if (!$user->rol) return false;
        
        $rol = strtolower($user->rol->nombre_rol);
        
        if ($rol === 'docente') {
            return $this->esDocenteDelCurso($user, $leccion);
        }
        
        // Admin puede eliminar cualquier lección (manejado por before())
        return false;
    }

    // === MÉTODOS AUXILIARES PRIVADOS ===

    /**
     * Verifica si el estudiante puede acceder: inscripción activa + pago completado
     */
    private function estudiantePuedeAcceder(Usuario $user, Leccion $leccion): bool
    {
        // Cargar relaciones si no están cargadas
        if (!$leccion->relationLoaded('modulo')) {
            $leccion->load('modulo.curso');
        }

        if (!$leccion->modulo || !$leccion->modulo->curso) {
            return false;
        }

        $idCurso = $leccion->modulo->curso->id_curso;

        // Verificar inscripción activa
        $inscripcionActiva = Inscripcion::where('id_usuario', $user->id_usuario)
                                     ->where('id_curso', $idCurso)
                                     ->whereIn('estado', ['Activo', 'Completado'])
                                     ->exists();

        if (!$inscripcionActiva) {
            return false;
        }

        // Verificar pago completado (verificación manual)
        $pagoCompletado = \App\Models\DetallePago::whereHas('pago', function ($q) use ($user) {
            $q->where('id_usuario', $user->id_usuario)
                ->where('estado', 'Completado');
        })->where('id_curso', $idCurso)->exists();

        return $pagoCompletado;
    }

    /**
     * Verifica si el usuario es docente del curso que contiene esta lección
     */
    private function esDocenteDelCurso(Usuario $user, Leccion $leccion): bool
    {
        // Cargar relaciones si no están cargadas
        if (!$leccion->relationLoaded('modulo')) {
            $leccion->load('modulo.curso');
        }

        return $leccion->modulo 
            && $leccion->modulo->curso 
            && $leccion->modulo->curso->id_docente === $user->id_usuario;
    }
}