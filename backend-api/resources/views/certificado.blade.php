<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Certificado</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        @page {
            margin: 0cm 0cm;
        }
        body {
            margin: 0cm 0cm;
            padding: 0;
            width: 100%;
            height: 100%;
            background-image: url('file://{{ public_path('certificados/certificado.png') }}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            font-family: 'Montserrat', Arial, sans-serif;
        }
        .contenido-certificado {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100vh;
            text-align: center;
            padding-top: 120px;
            color: #222;
        }
        .titulo {
            color: #1976d2;
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 0;
        }
        .subtitulo {
            font-size: 24px;
            letter-spacing: 4px;
            color: #222;
            margin-bottom: 30px;
        }
        .orgullo {
            font-size: 20px;
            color: #444;
            margin-bottom: 40px;
        }
        .nombre {
            font-size: 38px;
            font-weight: 600;
            color: #444;
            margin-bottom: 10px;
        }
        .linea {
            width: 60%;
            margin: 30px auto 20px auto;
            border: 1px solid #bbb;
        }
        .detalle {
            font-size: 18px;
            color: #444;
            margin-bottom: 40px;
        }
        .firma {
            margin: 30px 0 10px 0;
        }
        .docente {
            font-size: 16px;
            color: #444;
            border-top: 1px solid #bbb;
            width: 250px;
            margin: 10px auto 0 auto;
            padding-top: 5px;
        }
        .docente-label {
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="contenido-certificado">
        <div class="titulo">CERTIFICADO</div>
        <div class="subtitulo">DE FINALIZACIÓN</div>
        <div class="orgullo">Este certificado se otorga con orgullo a</div>
        <div class="nombre">{{ $nombre_completo }}</div>
        <div class="linea"></div>
        <div class="detalle">
            por haber completado exitosamente el Curso de <b>{{ $nombre_curso }}</b><br>
            el día {{ $fecha }}
        </div>
        @if($firma_url)
            <div class="firma">
                <img src="{{ public_path($firma_url) }}" alt="Firma" style="height: 60px;">
            </div>
        @endif
        <div class="docente">
            {{ $docente }}
            <div class="docente-label">Docente del Curso</div>
        </div>
    </div>
</body>
</html>