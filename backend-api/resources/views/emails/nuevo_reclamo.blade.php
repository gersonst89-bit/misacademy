<h2>Nuevo Reclamo Registrado</h2>
<p><strong>Nombre:</strong> {{ $reclamacion->nombre_completo }}</p>
<p><strong>DNI:</strong> {{ $reclamacion->dni }}</p>
<p><strong>Email:</strong> {{ $reclamacion->email }}</p>
<p><strong>Tipo de Reclamo:</strong> {{ $reclamacion->tipo_reclamo }}</p>
<p><strong>Asunto:</strong> {{ $reclamacion->asunto }}</p>
<p><strong>Descripción:</strong> {{ $reclamacion->descripcion }}</p>
<p><em>Fecha:</em> {{ $reclamacion->created_at }}</p>
