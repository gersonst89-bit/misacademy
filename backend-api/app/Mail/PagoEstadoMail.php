<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PagoEstadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pago;
    public $estadoAnterior;
    public $estadoNuevo;

    public function __construct($pago, $estadoAnterior, $estadoNuevo)
    {
        $this->pago = $pago;
        $this->estadoAnterior = $estadoAnterior;
        $this->estadoNuevo = $estadoNuevo;
    }

    public function build()
    {
        return $this->subject('Actualización en el estado de tu pago')
            ->view('emails.pago_estado');
    }
}
