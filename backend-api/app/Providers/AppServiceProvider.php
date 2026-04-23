<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Binding para el repositorio de autenticación
        $this->app->bind(
            \App\Repositories\Auth\AuthRepositoryInterface::class,
            \App\Repositories\Auth\AuthRepository::class
        );

        // Binding para el repositorio de cursos
        $this->app->bind(
            \App\Repositories\Curso\CursoRepositoryInterface::class,
            \App\Repositories\Curso\CursoRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
