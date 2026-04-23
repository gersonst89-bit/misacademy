<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function build()
    {
        $nombreCompleto = ($this->data['nombre'] ?? '') . ' ' . ($this->data['apellido'] ?? '');
        $asunto = ($this->data['asunto'] ?? 'Contacto') . ' | ' . $nombreCompleto;
        if (!empty($this->data['telefono'])) {
            $asunto .= ' | Tel: ' . $this->data['telefono'];
        }
        return $this->subject($asunto)
            ->view('emails.contacto')
            ->with(['data' => $this->data]);
    }
}
