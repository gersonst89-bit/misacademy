<h2>Actualización en el estado de tu pago</h2>
<p>Hola {{ $pago->usuario->nombre }},</p>
<p>El estado de tu pago ha cambiado:</p>
<ul>
    <li><strong>Concepto:</strong> {{ $pago->detalles_transaccion ?? 'Sin detalles' }}</li>
    <li><strong>Monto:</strong> ${{ number_format($pago->monto, 2) }}</li>
    <li><strong>Fecha:</strong> {{ $pago->fecha_pago }}</li>
    <li><strong>Estado anterior:</strong> {{ $estadoAnterior }}</li>
    <li><strong>Estado nuevo:</strong> {{ $estadoNuevo }}</li>
    <li><strong>N° Transacción:</strong> {{ $pago->id_pago }}</li>
</ul>
<p>Si tienes dudas, contáctanos.</p>
