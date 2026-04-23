<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PagoRegistradoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pago;
    public $comprobante;

    public function __construct($pago, $comprobante)
    {
        $this->pago = $pago;
        $this->comprobante = $comprobante;
    }

    public function build()
    {
        return $this->subject('Pago registrado correctamente')
            ->view('emails.pago_registrado');
    }
}
