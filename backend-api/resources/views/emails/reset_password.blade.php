<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Recupera tu contraseña</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px;">
	<div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 32px;">
		<h2 style="color: #2d3748;">Hola {{ $nombre }},</h2>
		<p>Recibimos una solicitud para restablecer tu contraseña.</p>
		<p style="margin: 24px 0; text-align: center;">
			<a href="{{ $url }}" style="background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">Restablecer contraseña</a>
		</p>
		<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
		<p style="color: #888; font-size: 13px; margin-top: 32px;">Gracias,<br>MIS Academy</p>
	</div>
</body>
</html>
