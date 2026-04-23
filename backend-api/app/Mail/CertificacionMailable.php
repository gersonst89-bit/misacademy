<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CertificacionMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $certificacion;

    public function __construct($certificacion)
    {
        $this->certificacion = $certificacion;
    }

    public function build()
    {
        return $this->subject('Tu certificado MIS Academy')
            ->view('emails.certificacion')
            ->with(['certificacion' => $this->certificacion]);
    }
}
