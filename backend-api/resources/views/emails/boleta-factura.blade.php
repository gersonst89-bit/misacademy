<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $tipoDocumento }} de Pago</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #4CAF50;">{{ $tipoDocumento }} de Pago - Pago Completado</h2>
        
        <p>Estimado/a {{ $pago->usuario->nombre ?? 'Cliente' }},</p>
        
        <p>Su pago ha sido <strong>completado exitosamente</strong>. Adjunto encontrará su {{ strtolower($tipoDocumento) }} de pago.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>ID Pago:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $pago->id_pago }}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Monto:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">S/ {{ number_format($pago->monto, 2) }}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Fecha:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $pago->fecha_pago }}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Estado:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><span style="color: #4CAF50; font-weight: bold;">{{ $pago->estado }}</span></td>
            </tr>
        </table>
        
        <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="margin: 0;"><strong>¡Gracias por su compra!</strong></p>
            <p style="margin: 5px 0 0 0;">Ya puede acceder a sus cursos desde su panel de usuario.</p>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Si tiene alguna consulta, no dude en contactarnos.<br>
            Este es un correo automático, por favor no responda a este mensaje.
        </p>
    </div>
</body>
</html>
