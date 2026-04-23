<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthenticationLog extends Model
{
    protected $table = 'authentication_log';
    
    protected $fillable = [
        'authenticatable_type',
        'authenticatable_id',
        'ip_address',
        'user_agent',
        'login_at',
        'logout_at',
        'login_successful',
        'failure_reason'
    ];

    protected $casts = [
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
        'login_successful' => 'boolean'
    ];

    public function authenticatable()
    {
        return $this->morphTo();
    }
}