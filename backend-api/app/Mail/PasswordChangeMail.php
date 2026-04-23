<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordChangeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nombre;
    public $token;
    public $email;

    public function __construct($nombre, $token, $email)
    {
        $this->nombre = $nombre;
        $this->token = $token;
        $this->email = $email;
    }

    public function build()
    {
        $url = url('/reset-password?token=' . $this->token . '&email=' . urlencode($this->email));
        return $this->subject('Solicitud de cambio de contraseña')
            ->view('emails.password-change')
            ->with([
                'nombre' => $this->nombre,
                'url' => $url,
            ]);
    }
}
