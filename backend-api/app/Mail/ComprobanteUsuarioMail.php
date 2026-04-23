<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class ComprobanteUsuarioMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pago;
    public $imagenPath;

    public function __construct($pago, $imagenPath)
    {
        $this->pago = $pago;
        $this->imagenPath = $imagenPath;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nuevo Comprobante de Pago Recibido - ID: ' . $this->pago->id_pago,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.comprobante-usuario',
        );
    }

    public function attachments(): array
    {
        if ($this->imagenPath && file_exists(public_path($this->imagenPath))) {
            return [
                Attachment::fromPath(public_path($this->imagenPath))
                    ->as('comprobante_pago.jpg')
                    ->withMime('image/jpeg'),
            ];
        }
        return [];
    }
}
