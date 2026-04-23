<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class BoletaFacturaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pago;
    public $pdfPath;
    public $tipoDocumento;

    public function __construct($pago, $pdfPath, $tipoDocumento = 'Boleta')
    {
        $this->pago = $pago;
        $this->pdfPath = $pdfPath;
        $this->tipoDocumento = $tipoDocumento;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->tipoDocumento . ' de Pago - ID: ' . $this->pago->id_pago,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.boleta-factura',
        );
    }

    public function attachments(): array
    {
        if ($this->pdfPath && file_exists($this->pdfPath)) {
            return [
                Attachment::fromPath($this->pdfPath)
                    ->as($this->tipoDocumento . '_' . $this->pago->id_pago . '.pdf')
                    ->withMime('application/pdf'),
            ];
        }
        return [];
    }
}
