<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña - MIS Academy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Poppins', system-ui, -apple-system, sans-serif;
            background: linear-gradient(45deg, #0E1C2B 0%, #09111D 50%, #0E1C2B 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #fff;
        }
        .container {
            max-width: 480px;
            width: 100%;
            background: #0b1321;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .logo {
            width: 120px;
            margin: 0 auto 24px;
            display: block;
        }
        h2 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            text-align: center;
            color: #fff;
        }
        .subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            margin-bottom: 32px;
        }
        label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 8px;
            margin-top: 20px;
        }
        label:first-of-type {
            margin-top: 0;
        }
        input {
            width: 100%;
            padding: 14px 16px;
            font-size: 15px;
            font-family: 'Poppins', sans-serif;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: #fff;
            transition: all 0.3s;
        }
        input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }
        input:focus {
            outline: none;
            border-color: #0ea5e9;
            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
            background: rgba(255, 255, 255, 0.08);
        }
        button {
            margin-top: 28px;
            width: 100%;
            padding: 14px;
            background: #0ea5e9;
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
        }
        button:hover:not(:disabled) {
            background: #0284c7;
            transform: translateY(-1px);
            box-shadow: 0 8px 16px rgba(14, 165, 233, 0.3);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        #mensaje {
            margin-top: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
            display: none;
        }
        #mensaje.success {
            display: block;
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        #mensaje.error {
            display: block;
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .back-link {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s;
        }
        .back-link:hover {
            color: #0ea5e9;
        }
    </style>
</head>
<body>
<div class="container">
    <img src="{{ env('APP_URL_BASE') }}/logomatt.png" alt="MIS Academy" class="logo">
    <h2>Restablecer contraseña</h2>
    <p class="subtitle">Ingresa tu nueva contraseña para continuar</p>
    <form id="resetForm">
        <input type="hidden" id="email" name="email">
        <input type="hidden" id="token" name="token">
        <label for="password">Nueva contraseña</label>
        <input type="password" id="password" name="password" placeholder="Mínimo 8 caracteres" required>
        <label for="password_confirmation">Confirmar contraseña</label>
        <input type="password" id="password_confirmation" name="password_confirmation" placeholder="Repite tu contraseña" required>
        <button type="submit">Restablecer contraseña</button>
    </form>
    <div id="mensaje"></div>
    <a href="{{ env('APP_URL_BASE') }}/login" class="back-link">Volver al inicio de sesión</a>
</div>
<script>
// Extrae parámetros de la URL
function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
}

// Asigna email y token ocultos
document.getElementById('email').value = getParam('email');
document.getElementById('token').value = getParam('token');

document.getElementById('resetForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const token = document.getElementById('token').value;
    const password = document.getElementById('password').value;
    const password_confirmation = document.getElementById('password_confirmation').value;
    const mensaje = document.getElementById('mensaje');
    const submitButton = this.querySelector('button[type="submit"]');
    mensaje.textContent = '';
    mensaje.className = '';

    if (!email || !token) {
        mensaje.textContent = 'El enlace de recuperación no es válido o está incompleto.';
        mensaje.className = 'error';
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Procesando...';

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email,
                token,
                password,
                password_confirmation
            })
        });
        const data = await response.json();
        if (response.ok) {
            mensaje.textContent = data.message || '¡Contraseña restablecida exitosamente! Redirigiendo...';
            mensaje.className = 'success';
            document.getElementById('resetForm').reset();
            window.location.href = '{{ env('APP_URL_BASE') }}';
        } else {
            let errorMsg = 'Ocurrió un error.';
            if (data.errors) {
                errorMsg = Object.values(data.errors).flat().join(' ');
            } else if (data.message) {
                errorMsg = data.message;
            }
            mensaje.textContent = errorMsg;
            mensaje.className = 'error';
            submitButton.disabled = false;
            submitButton.textContent = 'Restablecer contraseña';
        }
    } catch (err) {
        mensaje.textContent = 'Error de conexión. Intenta de nuevo más tarde.';
        mensaje.className = 'error';
        submitButton.disabled = false;
        submitButton.textContent = 'Restablecer contraseña';
    }
});
</script>
</body>
</html>
</div>