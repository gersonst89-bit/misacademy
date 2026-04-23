<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $tipoDocumento }} - {{ $pago->id_pago }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #4CAF50; margin: 0; }
        .info-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; }
        .info-box table { width: 100%; }
        .info-box td { padding: 5px; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .details-table th, .details-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .details-table th { background-color: #f2f2f2; }
        .total { text-align: right; font-size: 14px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MIS ACADEMY</h1>
        <h2>{{ $tipoDocumento }} ELECTRÓNICA</h2>
        <p>N° {{ str_pad($pago->id_pago, 8, '0', STR_PAD_LEFT) }}</p>
    </div>

    <div class="info-box">
        <h3>Datos del Cliente</h3>
        <table>
            <tr>
                <td><strong>Nombre:</strong></td>
                <td>{{ $usuario->nombre ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Email:</strong></td>
                <td>{{ $usuario->email ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Fecha de Emisión:</strong></td>
                <td>{{ $pago->fecha_pago }}</td>
            </tr>
        </table>
    </div>

    <table class="details-table">
        <thead>
            <tr>
                <th>Descripción</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($detalles as $detalle)
            <tr>
                <td>{{ $detalle->curso->nombre ?? 'Curso' }}</td>
                <td>S/ {{ number_format($detalle->precio_unitario, 2) }}</td>
                <td>1</td>
                <td>S/ {{ number_format($detalle->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        <p>TOTAL: S/ {{ number_format($pago->monto, 2) }}</p>
    </div>

    <div class="footer">
        <p>Este documento es válido como comprobante de pago electrónico.</p>
        <p>MIS ACADEMY - Sistema de Gestión de Cursos</p>
        <p>Fecha de generación: {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
