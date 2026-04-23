<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verifica tu cuenta</title>
</head>
<body>
    <h2>Hola, {{ $nombre }}!</h2>
    <p>Gracias por registrarte en MIS Academy.</p>
    <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
    <p>
        <a href="{{ url('/api/auth/verify/' . $token) }}">
            Verificar mi cuenta
        </a>
    </p>
    <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
    <br>
    <p>Saludos,<br>MIS Academy</p>
</body>
</html>
