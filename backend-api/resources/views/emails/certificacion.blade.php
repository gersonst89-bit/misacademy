<html>
<body>
    @if($certificacion->tipo_certificado === 'adicional')
        <h2>¡Felicitaciones, {{ $certificacion->nombre_estudiante }}!</h2>
        <p>Has recibido el certificado <strong>manual</strong> por completar el curso: <strong>{{ $certificacion->nombre_curso }}</strong></p>
        <p>Fecha de inicio: {{ $certificacion->fecha_inicio }}</p>
        <p>Fecha de fin: {{ $certificacion->fecha_fin }}</p>
        <p>Total de horas: {{ $certificacion->total_horas }}</p>
        <p>Código de certificado: {{ $certificacion->codigo_certificado }}</p>
        <p>Fecha de emisión: {{ $certificacion->fecha_emision }}</p>
    @else
        <h1>¡Felicidades, {{ $certificacion->usuario->nombre ?? 'Usuario' }}!</h1>
        <p>Has obtenido el certificado <strong>automático</strong> del curso <strong>{{ $certificacion->curso->nombre ?? '' }}</strong>.</p>
        <p>Adjunto encontrarás tu certificado en PDF.</p>
    @endif
    <p>Gracias por confiar en nuestra academia.</p>
</body>
</html>
