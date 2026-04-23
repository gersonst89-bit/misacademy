<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ServiceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Services\Contracts\EncryptionServiceInterface::class,
            \App\Services\EncryptionService::class
        );
        $this->app->bind(
            \App\Services\Contracts\TokenServiceInterface::class,
            \App\Services\TokenService::class
        );
        $this->app->bind(
            \App\Services\Contracts\VideoAuditServiceInterface::class,
            \App\Services\VideoAuditService::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
