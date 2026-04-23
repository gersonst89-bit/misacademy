<?php

namespace App\Mail;

use App\Models\Reclamacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevoReclamoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reclamacion;

    public function __construct(Reclamacion $reclamacion)
    {
        $this->reclamacion = $reclamacion;
    }

    public function build()
    {
        return $this->subject('Nuevo Reclamo Registrado')
            ->view('emails.nuevo_reclamo');
    }
}
