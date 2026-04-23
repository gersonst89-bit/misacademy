<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('authentication_log', function (Blueprint $table) {
            $table->id();
            $table->string('authenticatable_type');
            $table->unsignedBigInteger('authenticatable_id');
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('login_at')->nullable();
            $table->timestamp('logout_at')->nullable();
            $table->boolean('login_successful')->default(true);
            $table->string('failure_reason')->nullable();
            $table->timestamps();
            
            $table->index(['authenticatable_id', 'authenticatable_type']);
            $table->index('login_successful');
            $table->index('login_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('authentication_log');
    }
};