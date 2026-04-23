<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\OpcionRespuesta;
use App\Models\Inscripcion;

class OpcionRespuestaPolicy
{
    // Admin bypass
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
        return null;
    }

    // Listar opciones: solo usuarios autenticados
    public function viewAny(Usuario $user)
    {
        return $user && $user->rol;
    }

    // Ver opción específica
    public function view(Usuario $user, OpcionRespuesta $opcion)
    {
        // No autenticado: sin acceso
        if (!$user) {
            return false;
        }
        
        // Docente: solo opciones de preguntas de evaluaciones de sus cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $pregunta = $opcion->pregunta;
            if (!$pregunta) return false;
            
            $evaluacion = $pregunta->evaluacion;
            return $evaluacion && $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        
        // Estudiante: solo opciones de preguntas de evaluaciones de cursos con inscripción "Activo" y pago completado
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            $pregunta = $opcion->pregunta;
            if (!$pregunta) return false;
            
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

    // Crear opción: admin o docente
    public function create(Usuario $user)
    {
        return $user->rol && in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente']);
    }

    // Actualizar opción: admin o docente dueño de la pregunta
    public function update(Usuario $user, OpcionRespuesta $opcion)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $pregunta = $opcion->pregunta;
            if (!$pregunta) return false;
            
            $evaluacion = $pregunta->evaluacion;
            return $evaluacion && $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        return false;
    }

    // Eliminar opción: admin o docente dueño de la pregunta
    public function delete(Usuario $user, OpcionRespuesta $opcion)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $pregunta = $opcion->pregunta;
            if (!$pregunta) return false;
            
            $evaluacion = $pregunta->evaluacion;
            return $evaluacion && $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        return false;
    }
}
