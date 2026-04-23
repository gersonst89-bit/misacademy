<?php
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CursoController;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\CarritoController;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureDocente;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ModuloController;
use App\Http\Controllers\ModuloPublicController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\Admin\MaterialController;
use App\Http\Controllers\MaterialPublicController;
use App\Http\Controllers\LeccionController;
use App\Http\Controllers\Admin\LeccionController as AdminLeccionController;
use App\Http\Controllers\EvaluacionController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\LeccionHeartbeatController;
use App\Http\Controllers\LeccionAccesoController;
Route::prefix('modulos')->group(function () {
    // Protegidos (gestión) - PRIMERO las rutas específicas
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/mis', [ModuloController::class, 'misModulos']);
        Route::post('/', [ModuloController::class, 'store']);
        Route::put('/{id}', [ModuloController::class, 'update']);
        Route::delete('/{id}', [ModuloController::class, 'destroy']);
        Route::patch('/{id}/estado', [ModuloController::class, 'updateEstado']);
        // Si tienes panel admin:
        // Route::get('/admin', [ModuloController::class, 'index']);
    });

    // Públicos - DESPUÉS las rutas con parámetros dinámicos
    Route::get('/', [ModuloPublicController::class, 'index']);
    Route::get('/{id}', [ModuloPublicController::class, 'show']);
});

// Endpoints públicos de materiales (solo listado)
Route::prefix('materiales')->group(function () {
    Route::get('/', [MaterialPublicController::class, 'index']); // Listado público con filtros
});

// Endpoints protegidos de materiales (todo lo demás requiere autenticación)
Route::middleware('auth:sanctum')->prefix('materiales')->group(function () {
    Route::get('/{id}', [MaterialPublicController::class, 'show']); // Ver detalle
    Route::post('/', [MaterialController::class, 'store']);
    Route::put('/{id}', [MaterialController::class, 'update']);
    Route::delete('/{id}', [MaterialController::class, 'destroy']);
    Route::patch('/{id}/estado', [MaterialController::class, 'updateEstado']);
});


// Endpoint simple de prueba
Route::get('/hola', function () {
    return response()->json([
        'mensaje' => 'Hola desde el backend!',
        'status' => 'success',
        'timestamp' => now(),
        'version' => 'Laravel 12.29.0'
    ]);
});

// Endpoint seguro: listado de usuarios solo para admins
Route::middleware(['auth:sanctum', EnsureAdmin::class])->prefix('admin')->group(function () {
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']); // desactivar
    Route::delete('/usuarios/{id}/force', [UsuarioController::class, 'forceDelete']); // eliminar real
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Endpoints de autenticación
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('verify/{token}', [AuthController::class, 'verify']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::get('profile', [AuthController::class, 'profile'])->middleware('auth:sanctum');
    Route::put('profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::post('change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
});

// Endpoints para cursos
Route::prefix('cursos')->group(function () {
    Route::get('/', [CursoController::class, 'index']); // Listado paginado
    Route::get('/destacados', [CursoController::class, 'destacados']); // Cursos destacados
    Route::get('/buscar', [CursoController::class, 'buscar']); // Búsqueda por nombre
    Route::get('/{id}', [CursoController::class, 'show']); // Detalle de curso
    // Listar reseñas de un curso (público)
    Route::get('/{id}/resenas', [\App\Http\Controllers\ResenaController::class, 'index']);
    // Crear reseña (solo usuario autenticado)
    Route::middleware('auth:sanctum')->post('/{id}/resenas', [\App\Http\Controllers\ResenaController::class, 'store']);
    // Editar reseña (solo usuario autenticado y propietario)
    Route::middleware('auth:sanctum')->patch('/resenas/{id}', [\App\Http\Controllers\ResenaController::class, 'update']);
    // Eliminar reseña (solo usuario autenticado y propietario)
    Route::middleware('auth:sanctum')->delete('/resenas/{id}', [\App\Http\Controllers\ResenaController::class, 'destroy']);
    Route::post('/{id}/comprar', [CursoController::class, 'comprar'])->middleware('auth:sanctum'); // Comprar curso
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/mis-cursos', [CursoController::class, 'misCursos']); // Panel docente/admin
    Route::post('/cursos', [CursoController::class, 'store']);
    Route::put('/cursos/{id}', [CursoController::class, 'update']);
    Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);
    Route::patch('/cursos/{id}/estado', [CursoController::class, 'cambiarEstado']); // Cambiar estado del curso
});

// Endpoints de inscripciones (usuario autenticado)
use App\Http\Controllers\InscripcionController;
Route::middleware('auth:sanctum')->prefix('inscripciones')->group(function () {
    Route::get('/', [InscripcionController::class, 'index']); // Listar inscripciones del usuario
    Route::post('/', [InscripcionController::class, 'store']); // Crear inscripción
    Route::delete('/{id}', [InscripcionController::class, 'destroy']); // Cancelar inscripción (propietario)
});

// Endpoints admin de inscripciones (protegidos)
use App\Http\Controllers\Admin\InscripcionController as AdminInscripcionController;
Route::middleware(['auth:sanctum', EnsureAdmin::class])->prefix('admin/inscripciones')->group(function () {
    Route::get('/', [AdminInscripcionController::class, 'index']);
    Route::get('/{id}', [AdminInscripcionController::class, 'show']);
    Route::patch('/{id}/estado', [AdminInscripcionController::class, 'updateEstado']);
    Route::delete('/{id}/force', [AdminInscripcionController::class, 'forceDelete']);
});

// Endpoints de inscripciones a rutas (usuario autenticado) - apuntan al controlador unificado
Route::middleware('auth:sanctum')->prefix('inscripciones-rutas')->group(function () {
    Route::get('/', [InscripcionController::class, 'index']);
    Route::post('/', [InscripcionController::class, 'store']);
    Route::delete('/{id}', [InscripcionController::class, 'destroy']);
});

// Endpoints admin de inscripciones a rutas (protegidos) - apuntan al controlador admin unificado
Route::middleware(['auth:sanctum', EnsureAdmin::class])->prefix('admin/inscripciones-rutas')->group(function () {
    Route::get('/', [AdminInscripcionController::class, 'index']);
    Route::get('/{id}', [AdminInscripcionController::class, 'show']);
    Route::patch('/{id}/estado', [AdminInscripcionController::class, 'updateEstado']);
    Route::delete('/{id}/force', [AdminInscripcionController::class, 'forceDelete']);
});


// Endpoint para contacto
use App\Http\Controllers\ContactoController;
Route::post('/contacto', [ContactoController::class, 'store']);


// Endpoints para rutas de aprendizaje
use App\Http\Controllers\RutaAcademicaController;
Route::prefix('rutas')->group(function () {
    // Eliminar varios cursos de una ruta (solo admin)
    Route::delete('/{id_ruta}/cursos', [\App\Http\Controllers\RutaAcademicaController::class, 'eliminarCursos'])
        ->middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class]);
    Route::get('/', [RutaAcademicaController::class, 'index']); // Listado y filtros
    Route::get('/destacadas', [RutaAcademicaController::class, 'destacadas']); // Rutas destacadas
    Route::get('/buscar', [RutaAcademicaController::class, 'buscar']); // Búsqueda por nombre
    Route::get('/{id}', [RutaAcademicaController::class, 'show']); // Detalle de ruta
    Route::post('/', [RutaAcademicaController::class, 'store']); // Crear ruta
    Route::put('/{id}', [RutaAcademicaController::class, 'update']); // Actualizar ruta
    Route::delete('/{id}', [RutaAcademicaController::class, 'destroy']); // Eliminar ruta

    // Asociar cursos a una ruta (solo admin)
    Route::post('/{id_ruta}/cursos', [\App\Http\Controllers\RutaAcademicaController::class, 'agregarCursos'])
        ->middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class]);
});

// Endpoints para líneas académicas
use App\Http\Controllers\LineaAcademicaController;
Route::prefix('lineas')->group(function () {
    Route::get('/', [LineaAcademicaController::class, 'index']); // Listado y filtros
    Route::get('/{id}', [LineaAcademicaController::class, 'show']); // Detalle de línea
    Route::post('/', [LineaAcademicaController::class, 'store']); // Crear línea
    Route::put('/{id}', [LineaAcademicaController::class, 'update']); // Actualizar línea
    Route::delete('/{id}', [LineaAcademicaController::class, 'destroy']); // Eliminar línea
});

// Endpoint solo admin para cambio de estado de línea académica
Route::middleware(['auth:sanctum', EnsureAdmin::class])->patch('admin/lineas/{id}/estado', [LineaAcademicaController::class, 'updateEstado']);

// Endpoint POST de prueba para descartar problemas de enrutamiento/caché
Route::post('/test-post', function () {
    return response()->json(['ok' => true, 'timestamp' => now()]);
});

Route::prefix('pagos')->group(function () {
    // Registro de pago (usuario autenticado)
    Route::post('/', [PagoController::class, 'store'])->middleware('auth:sanctum');
    // Historial de pagos del usuario
    Route::get('/historial', [PagoController::class, 'historial'])->middleware('auth:sanctum');
    // Generar enlace de WhatsApp para comprobante
    Route::get('/{id}/whatsapp', [PagoController::class, 'enlaceWhatsapp'])->middleware('auth:sanctum');
    // Panel de control de transacciones (admin)
    Route::get('/', [PagoController::class, 'index'])->middleware('auth:sanctum');
    // Actualización de estado (admin)
    Route::put('/{id}/estado', [PagoController::class, 'actualizarEstado'])->middleware('auth:sanctum');
});


use App\Http\Controllers\TipoPagoController;

Route::prefix('tipos-pagos')->group(function () {
    Route::get('/', [TipoPagoController::class, 'index']); // Listar todos los métodos
    Route::post('/', [TipoPagoController::class, 'store'])->middleware('auth:sanctum'); // Crear método (admin)
    Route::put('/{id}', [TipoPagoController::class, 'update'])->middleware('auth:sanctum'); // Actualizar método (admin)
    Route::put('/{id}/activar', [TipoPagoController::class, 'activar'])->middleware('auth:sanctum'); // Activar/desactivar método (admin)
});

// Endpoints públicos de lecciones (solo listado)
Route::prefix('lecciones')->group(function () {
    Route::get('/', [LeccionController::class, 'index']); // Listado público con filtros
});

// Endpoints protegidos de lecciones (todo lo demás requiere autenticación)
Route::middleware('auth:sanctum')->prefix('lecciones')->group(function () {
    Route::get('/{id}', [LeccionController::class, 'show']); // Ver detalle
    Route::get('/modulo/{id_modulo}', [LeccionController::class, 'porModulo']); // Listar por módulo
    Route::post('/', [LeccionController::class, 'store']);
    Route::put('/{id}', [LeccionController::class, 'update']);
    Route::delete('/{id}', [LeccionController::class, 'destroy']);
    Route::patch('/{id}/estado', [LeccionController::class, 'updateEstado']);
    Route::get('/{id}/comentarios', [LeccionController::class, 'comentarios']);
    Route::post('/{id}/comentarios', [LeccionController::class, 'agregarComentario']);
    Route::patch('/comentarios/{id}', [LeccionController::class, 'editarComentario']);
    Route::post('/{id}/completar', [LeccionController::class, 'completar']);
    Route::get('/{id}/navegacion', [LeccionController::class, 'navegacion']);
    Route::post('/{id}/heartbeat', [LeccionHeartbeatController::class, 'procesar']);
    Route::get('/{id_leccion}/acceso', [LeccionAccesoController::class, 'acceso']);
});


// Endpoints gestión de evaluaciones (admin, docente y estudiante)
Route::middleware('auth:sanctum')->prefix('evaluaciones')->group(function () {
    // Endpoints universales robustos para evaluación
    Route::get('/', [EvaluacionController::class, 'index']); // Lista evaluaciones
    Route::post('/', [EvaluacionController::class, 'store']); // Crear evaluación
    Route::get('/mis-evaluaciones', [EvaluacionController::class, 'misEvaluaciones']); // Historial de intentos
    Route::get('/reportes', [EvaluacionController::class, 'reportes']); // Reportes admin
    Route::get('/intentos/{intentoId}', [EvaluacionController::class, 'verResultado']); // Ver resultado intento
    Route::get('/{id}', [EvaluacionController::class, 'show']); // Ver evaluación específica
    Route::put('/{id}', [EvaluacionController::class, 'update']); // Actualizar evaluación
    Route::delete('/{id}', [EvaluacionController::class, 'destroy']); // Eliminar evaluación
    Route::patch('/{id}/estado', [EvaluacionController::class, 'updateEstado']); // Cambiar estado
    Route::get('/{id}/intentos', [EvaluacionController::class, 'intentos']); // Ver intentos de evaluación
    Route::post('/{id}/iniciar', [EvaluacionController::class, 'iniciar']); // Iniciar intento
    Route::post('/{id}/responder', [EvaluacionController::class, 'responder']); // Enviar respuestas (legacy)

    // Endpoints robustos para frontend universal
    Route::get('/courses/{courseId}/eligibility', [EvaluacionController::class, 'checkEligibility']); // Elegibilidad
    Route::get('/courses/{courseId}/info', [EvaluacionController::class, 'getEvaluationInfo']); // Info/configuración
    Route::get('/sessions/{sessionId}/resume', [EvaluacionController::class, 'resumeSession']); // Recuperar sesión
    Route::post('/sessions/{sessionId}/answers', [EvaluacionController::class, 'saveAnswer']); // Guardar respuesta individual
    Route::post('/sessions/{sessionId}/answers/batch', [EvaluacionController::class, 'saveAnswersBatch']); // Guardar respuestas batch
    Route::post('/sessions/{sessionId}/heartbeat', [EvaluacionController::class, 'sendHeartbeat']); // Heartbeat
    Route::post('/sessions/{sessionId}/events', [EvaluacionController::class, 'recordEvents']); // Eventos de seguridad
    Route::post('/sessions/{sessionId}/submit', [EvaluacionController::class, 'submitEvaluation']); // Finalizar evaluación
});

// Endpoints gestión de preguntas (admin y docente)
use App\Http\Controllers\PreguntaController;
Route::middleware('auth:sanctum')->prefix('preguntas')->group(function () {
    Route::get('/', [PreguntaController::class, 'index']); // Admin/Docente
    Route::post('/', [PreguntaController::class, 'store']); // Admin/Docente
    Route::get('/{id}', [PreguntaController::class, 'show']); // Admin/Docente
    Route::put('/{id}', [PreguntaController::class, 'update']); // Admin/Docente
    Route::delete('/{id}', [PreguntaController::class, 'destroy']); // Admin/Docente
});

// Endpoints gestión de opciones de respuesta (admin y docente)
use App\Http\Controllers\OpcionRespuestaController;
Route::middleware('auth:sanctum')->prefix('opciones')->group(function () {
    Route::get('/', [OpcionRespuestaController::class, 'index']); // Admin/Docente
    Route::post('/', [OpcionRespuestaController::class, 'store']); // Admin/Docente
    Route::get('/{id}', [OpcionRespuestaController::class, 'show']); // Admin/Docente
    Route::put('/{id}', [OpcionRespuestaController::class, 'update']); // Admin/Docente
    Route::delete('/{id}', [OpcionRespuestaController::class, 'destroy']); // Admin/Docente
});

use App\Http\Controllers\Admin\PreguntaController as AdminPreguntaController;
use App\Http\Controllers\Admin\OpcionRespuestaController as AdminOpcionRespuestaController;
// Endpoints admin de preguntas (protegidos)
Route::middleware(['auth:sanctum'])->prefix('admin/preguntas')->group(function () {
    Route::get('/', [AdminPreguntaController::class, 'index']);
    Route::post('/', [AdminPreguntaController::class, 'store']);
    Route::get('/{pregunta}', [AdminPreguntaController::class, 'show']);
    Route::put('/{pregunta}', [AdminPreguntaController::class, 'update']);
    Route::delete('/{pregunta}', [AdminPreguntaController::class, 'destroy']);
});

// Endpoints admin de opciones de respuesta (protegidos)
Route::middleware(['auth:sanctum'])->prefix('admin/opciones-respuesta')->group(function () {
    Route::get('/', [AdminOpcionRespuestaController::class, 'index']);
    Route::post('/', [AdminOpcionRespuestaController::class, 'store']);
    Route::get('/{opcionRespuesta}', [AdminOpcionRespuestaController::class, 'show']);
    Route::put('/{opcionRespuesta}', [AdminOpcionRespuestaController::class, 'update']);
    Route::delete('/{opcionRespuesta}', [AdminOpcionRespuestaController::class, 'destroy']);
});

use App\Http\Controllers\Admin\CertificacionController;

// Endpoint público para buscar certificado por código o nombre con un solo parámetro (sin autenticación)
// Frontend: un solo campo de búsqueda que busca en código_certificado Y nombre_estudiante
// Uso: GET /api/certificaciones/buscar?buscar=CERT-12345
//       GET /api/certificaciones/buscar?buscar=Juan Perez
Route::get('/certificaciones/buscar', [CertificacionController::class, 'buscarPorCodigo']);

// Endpoints admin de certificaciones (protegidos)
Route::middleware(['auth:sanctum', EnsureAdmin::class])->prefix('admin/certificaciones')->group(function () {
    // Listar todos los certificados (automático y manual)
    // Frontend: para mostrar el listado y filtrar por tipo
    // Para filtrar por tipo usa:
    //   ?tipo_certificado=empresa   // (Automático)
    //   ?tipo_certificado=adicional // (Manual)
    // Puedes mostrar en el filtro: "Automático" y "Manual" pero enviar los valores reales al backend.
    Route::get('/', [CertificacionController::class, 'index']);

    // Crear certificado adicional
    // Frontend: solo para admins, formulario de creación manual
    Route::post('/', [CertificacionController::class, 'store']);

    // Ver detalle de certificado (empresa o adicional)
    // Frontend: para mostrar información completa de un certificado
    Route::get('/{id}', [CertificacionController::class, 'show']);

    // Editar certificado adicional
    // Frontend: solo para admins, formulario de edición manual
    Route::put('/{id}', [CertificacionController::class, 'update']);

    // Eliminar certificado adicional
    // Frontend: solo para admins, opción de eliminar manual
    Route::delete('/{id}', [CertificacionController::class, 'destroy']);
});

use App\Http\Controllers\CertificacionUsuarioController;
// Endpoints usuario autenticado para certificaciones propias
Route::middleware(['auth:sanctum'])->prefix('certificaciones')->group(function () {
    Route::get('/', [CertificacionUsuarioController::class, 'index']); // Listar certificaciones propias
    Route::get('/{id}', [CertificacionUsuarioController::class, 'show']); // Ver detalle de certificación propia
    Route::post('/{id}/enviar', [CertificacionUsuarioController::class, 'enviarPorEmail']); // Enviar certificado por email
});
Route::middleware('auth:sanctum')->group(function () {
    // Historial de compras del usuario (cursos pagados)
    Route::get('/compras/historial', [PagoController::class, 'historialCompras']);
    Route::get('/carrito', [CarritoController::class, 'index']);
    Route::post('/carrito/agregar', [CarritoController::class, 'agregar']);
    Route::post('/carrito/quitar', [CarritoController::class, 'quitar']);
    Route::post('/carrito/vaciar', [CarritoController::class, 'vaciar']);
});

Route::middleware('auth:sanctum')->get('/cursos/{id}/contenido', [CursoController::class, 'contenido']);
Route::middleware('auth:sanctum')->post('/lecciones/{id}/completar', [LeccionController::class, 'completar']);
Route::middleware('auth:sanctum')->get('/lecciones/{id}/navegacion', [LeccionController::class, 'navegacion']);

// Endpoints de auditoría (solo admin) - OPCIONAL para consultar logs
Route::middleware(['auth:sanctum', EnsureAdmin::class])->prefix('admin/auditoria')->group(function () {
    Route::get('/authentication', function(Request $request) {
        $logs = \App\Models\AuthenticationLog::orderByDesc('login_at')
            ->with('authenticatable')
            ->paginate(50);
        return response()->json($logs);
    });
    
    Route::get('/modelos', function(Request $request) {
        $audits = \OwenIt\Auditing\Models\Audit::orderByDesc('created_at')
            ->with('user')
            ->paginate(50);
        return response()->json($audits);
    });
});

Route::middleware('auth:sanctum')->post('/usuario/perfil', [PerfilController::class, 'update']);
Route::middleware('auth:sanctum')->put('/usuario/perfil', [PerfilController::class, 'update']); // Fallback para PUT sin archivo

// Endpoints de estadísticas para dashboard (protegido admin)
use App\Http\Controllers\EstadisticaController;
Route::middleware(['auth:sanctum', EnsureAdmin::class])->prefix('estadisticas')->group(function () {
    Route::get('/estudiantes/total', [EstadisticaController::class, 'cantidadEstudiantes']);
    Route::get('/estudiantes/por-linea', [EstadisticaController::class, 'estudiantesPorLineaAcademica']);
    Route::get('/cursos/mas-vendidos-mes', [EstadisticaController::class, 'cursosMasVendidosMes']);
    Route::get('/usuarios/retencion-mensual', [EstadisticaController::class, 'retencionMensualUsuarios']);
});

// DEBUG: Ruta temporal sin middleware para probar
Route::post('/usuario/perfil-debug', [PerfilController::class, 'update']);

use App\Http\Controllers\AuditController;
use App\Http\Controllers\AuthLogController;

Route::middleware(['auth:sanctum', EnsureAdmin::class])->group(function () {
    Route::get('/auditoria', [AuditController::class, 'index']);
    Route::get('/auth-logs', [AuthLogController::class, 'index']);
});


Route::middleware('auth:sanctum')->post('/certificacion/solicitar', [CertificacionUsuarioController::class, 'solicitar']);
Route::middleware('auth:sanctum')->get('/certificacion/eligibilidad/{id_curso}', [CertificacionUsuarioController::class, 'elegibilidad']);
Route::middleware('auth:sanctum')->get('/certificacion/pdf/{id_curso}', [CertificacionUsuarioController::class, 'descargarPDF']);

Route::middleware('auth:sanctum')->get('cursos/{id}/progreso', [CursoController::class, 'progreso']);

// Rutas para VideoToken (protegidas)
// Solo un usuario autenticado puede acceder a esta ruta
Route::middleware(['auth:sanctum'])->get('/lessons/{id}/video-token', [
    App\Http\Controllers\VideoTokenController::class,
    'getVideoToken'
]);

Route::middleware(['auth:sanctum'])->post('/video/heartbeat', [
    App\Http\Controllers\VideoSessionController::class,
    'heartbeat'
]);

// Libro de Reclamaciones - Registro de reclamos por usuarios
Route::post('/reclamaciones', [\App\Http\Controllers\ReclamacionController::class, 'store']);