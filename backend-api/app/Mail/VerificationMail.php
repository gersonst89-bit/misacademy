<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nombre;
    public $token;

    public function __construct($nombre, $token)
    {
        $this->nombre = $nombre;
        $this->token = $token;
    }

    public function build()
    {
        return $this->subject('Verifica tu cuenta en MIS Academy')
            ->view('emails.verification')
            ->with([
                'nombre' => $this->nombre,
                'token' => $this->token,
            ]);
    }
}
