<h2>¡Pago registrado correctamente!</h2>
<p>Hola {{ $pago->usuario->nombre }},</p>
<p>Tu pago ha sido registrado con éxito.</p>
<ul>
    <li><strong>Concepto:</strong> {{ $comprobante['concepto'] }}</li>
    <li><strong>Monto:</strong> ${{ number_format($comprobante['monto'], 2) }}</li>
    <li><strong>Fecha:</strong> {{ $comprobante['fecha'] }}</li>
    <li><strong>Estado:</strong> {{ $comprobante['estado'] }}</li>
    <li><strong>N° Transacción:</strong> {{ $comprobante['numero_transaccion'] }}</li>
</ul>
<p>Gracias por tu confianza.</p>
