<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CertificacionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $certificacion;
    public $pdfContent;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($certificacion, $pdfContent)
    {
        $this->certificacion = $certificacion;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Tu certificado')->view('emails.certificacion')
            ->attachData($this->pdfContent, 'certificado.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
