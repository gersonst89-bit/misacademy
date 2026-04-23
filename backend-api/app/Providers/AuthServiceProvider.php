<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Evaluacion;
use App\Policies\EvaluacionPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Evaluacion::class => EvaluacionPolicy::class,
        \App\Models\Pregunta::class => \App\Policies\PreguntaPolicy::class,
        \App\Models\OpcionRespuesta::class => \App\Policies\OpcionRespuestaPolicy::class,
        \App\Models\Curso::class => \App\Policies\CursoPolicy::class,
        \App\Models\Modulo::class => \App\Policies\ModuloPolicy::class,
        \App\Models\Material::class => \App\Policies\MaterialPolicy::class,
        \App\Models\Certificacion::class => \App\Policies\CertificacionPolicy::class,
        \App\Models\IntentoEvaluacion::class => \App\Policies\IntentoEvaluacionPolicy::class,
        \App\Models\Leccion::class => \App\Policies\LeccionPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
