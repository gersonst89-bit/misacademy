<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Evaluacion;
use App\Models\Inscripcion;

class EvaluacionPolicy
{
    // Admin bypass
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
        return null;
    }

    // Listar evaluaciones: solo usuarios autenticados
    public function viewAny(Usuario $user)
    {
        return $user && $user->rol;
    }

    // Ver evaluación específica
    public function view(?Usuario $user, Evaluacion $evaluacion)
    {
        // Público: solo evaluaciones publicadas
        if (!$user) {
            return isset($evaluacion->estado) && $evaluacion->estado === 'Publicado';
        }
        
        // Estudiante: evaluaciones de cursos con inscripción activa Y pago completado
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            $inscripcionActiva = Inscripcion::where('id_usuario', $user->id_usuario)
                             ->where('id_curso', $evaluacion->id_curso)
                             ->where('estado', 'Activo')
                             ->exists();
            
            if (!$inscripcionActiva) {
                return false;
            }
            
            // Verificar pago completado
            $pagoCompletado = \App\Models\DetallePago::whereHas('pago', function ($q) use ($user) {
                $q->where('id_usuario', $user->id_usuario)
                    ->where('estado', 'Completado');
            })->where('id_curso', $evaluacion->id_curso)->exists();
            
            return $pagoCompletado;
        }
        
        // Docente: solo evaluaciones de sus cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            return $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        
        return false;
    }

    // Crear evaluación: admin o docente
    public function create(Usuario $user)
    {
        return $user->rol && in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente']);
    }

    // Actualizar evaluación: admin o docente dueño del curso
    public function update(Usuario $user, Evaluacion $evaluacion)
    {
        if (!$user->rol) return false;
        
        $rol = strtolower($user->rol->nombre_rol);
        
        if ($rol === 'docente') {
            return $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        
        // Admin puede actualizar cualquier evaluación (manejado por before())
        return false;
    }

    // Eliminar evaluación: admin o docente dueño del curso
    public function delete(Usuario $user, Evaluacion $evaluacion)
    {
        if (!$user->rol) return false;
        
        $rol = strtolower($user->rol->nombre_rol);
        
        if ($rol === 'docente') {
            return $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        
        // Admin puede eliminar cualquier evaluación (manejado por before())
        return false;
    }

    // Iniciar evaluación: solo estudiantes con acceso válido
    public function iniciar(Usuario $user, Evaluacion $evaluacion)
    {
        if (!$user->rol || strtolower($user->rol->nombre_rol) !== 'estudiante') {
            return false;
        }

        $inscripcionActiva = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
                         ->where('id_curso', $evaluacion->id_curso)
                         ->where('estado', 'Completado')
                         ->exists();
        
        if (!$inscripcionActiva) {
            return false;
        }
        
        // Verificar pago completado
        return \App\Models\DetallePago::whereHas('pago', function ($q) use ($user) {
            $q->where('id_usuario', $user->id_usuario)
                ->where('estado', 'Completado');
        })->where('id_curso', $evaluacion->id_curso)->exists();
    }

    // Responder evaluación: delegar a IntentoEvaluacionPolicy
    public function responder(Usuario $user, Evaluacion $evaluacion)
    {
        return $this->iniciar($user, $evaluacion);
    }
}
