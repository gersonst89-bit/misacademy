<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Pregunta;
use App\Models\Inscripcion;

class PreguntaPolicy
{
    // Admin bypass
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
        return null;
    }

    // Listar preguntas: solo usuarios autenticados
    public function viewAny(Usuario $user)
    {
        return $user && $user->rol;
    }

    // Ver pregunta específica
    public function view(Usuario $user, Pregunta $pregunta)
    {
        // No autenticado: sin acceso
        if (!$user) {
            return false;
        }
        
        // Docente: solo preguntas de evaluaciones de sus cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $evaluacion = $pregunta->evaluacion;
            return $evaluacion && $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        
        // Estudiante: solo preguntas de evaluaciones de cursos con inscripción "Activo" y pago completado
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            $evaluacion = $pregunta->evaluacion;
            if (!$evaluacion) return false;
            
            $inscripcionActiva = Inscripcion::where('id_usuario', $user->id_usuario)
                             ->where('id_curso', $evaluacion->id_curso)
                             ->where('estado', 'Activo')
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
        
        return false;
    }

    // Crear pregunta: admin o docente
    public function create(Usuario $user)
    {
        return $user->rol && in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente']);
    }

    // Actualizar pregunta: admin o docente dueño de la evaluación
    public function update(Usuario $user, Pregunta $pregunta)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $evaluacion = $pregunta->evaluacion;
            return $evaluacion && $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        return false;
    }

    // Eliminar pregunta: admin o docente dueño de la evaluación
    public function delete(Usuario $user, Pregunta $pregunta)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $evaluacion = $pregunta->evaluacion;
            return $evaluacion && $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        return false;
    }
}
