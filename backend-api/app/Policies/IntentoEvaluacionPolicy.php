<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\IntentoEvaluacion;
use App\Models\Inscripcion;

class IntentoEvaluacionPolicy
{
    // Admin bypass
    public function before(Usuario $user, $ability)
    {
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'administrador') {
            return true;
        }
        return null;
    }

    // Listar intentos: solo usuarios autenticados
    public function viewAny(Usuario $user)
    {
        return $user && $user->rol;
    }

    // Ver intento específico
    public function view(Usuario $user, IntentoEvaluacion $intento)
    {
        // No autenticado: sin acceso
        if (!$user) {
            return false;
        }
        
        // Docente: solo intentos de evaluaciones de sus cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $evaluacion = $intento->evaluacion;
            return $evaluacion && $evaluacion->curso && $evaluacion->curso->id_docente === $user->id_usuario;
        }
        
        // Estudiante: solo sus propios intentos con inscripción activa y pago completado
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            // Debe ser su propio intento
            if ($intento->id_usuario !== $user->id_usuario) {
                return false;
            }
            
            $evaluacion = $intento->evaluacion;
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

    // Crear intento: estudiante con acceso a la evaluación
    public function create(Usuario $user, IntentoEvaluacion $intento = null)
    {
        if (!$user->rol || strtolower($user->rol->nombre_rol) !== 'estudiante') {
            return false;
        }

        // Si no se proporciona intento, permitir (se validará en el controlador)
        if (!$intento || !$intento->evaluacion) {
            return true;
        }

        $evaluacion = $intento->evaluacion;
        
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

    // Actualizar intento: solo el estudiante propietario puede responder
    public function update(Usuario $user, IntentoEvaluacion $intento)
    {
        if (!$user->rol || strtolower($user->rol->nombre_rol) !== 'estudiante') {
            return false;
        }

        // Solo puede actualizar sus propios intentos
        return $intento->id_usuario === $user->id_usuario && $intento->estado === 'En Progreso';
    }

    // Eliminar intento: solo admin
    public function delete(Usuario $user, IntentoEvaluacion $intento)
    {
        return false; // Los intentos no se eliminan, solo se finalizan
    }
}