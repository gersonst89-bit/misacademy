<html>
<body>
    <h2>Nuevo mensaje de contacto</h2>
    <p><strong>Nombre:</strong> {{ ($data['nombre'] ?? '') . ' ' . ($data['apellido'] ?? '') }}</p>
    <p><strong>Email:</strong> {{ $data['email'] ?? '' }}</p>
    <p><strong>Teléfono:</strong> {{ $data['telefono'] ?? '' }}</p>
    <p><strong>Mensaje:</strong></p>
    <p>{{ $data['mensaje'] ?? '' }}</p>
</body>
</html>
