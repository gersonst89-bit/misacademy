<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nuevo Comprobante de Pago</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #4CAF50;">Nuevo Comprobante de Pago Recibido</h2>
        
        <p>Se ha recibido un nuevo comprobante de pago con los siguientes detalles:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>ID Pago:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $pago->id_pago }}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Usuario:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $pago->usuario->nombre ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $pago->usuario->email ?? 'N/A' }}</td>
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
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{ $pago->estado }}</td>
            </tr>
        </table>
        
        <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50;">
            <strong>Nota:</strong> La imagen del comprobante se encuentra adjunta a este correo.
        </p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Este es un correo automático, por favor no responda a este mensaje.
        </p>
    </div>
</body>
</html>
