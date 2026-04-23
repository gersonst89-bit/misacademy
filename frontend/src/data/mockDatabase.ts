// src/data/mockDatabaseFull.ts

import type {
  PersonalAccessToken,
  Rol,
  Usuario,
  LineaAcademica,
  Curso,
  RutaAcademica,
  Modulo,
  Leccion,
  Inscripcion,
  ProgresoEstudiante,
  Evaluacion,
  Pregunta,
  OpcionRespuesta,
  IntentoEvaluacion,
  RespuestaUsuario,
  TipoPago,
  Pago,
  CarritoCompras,
  CarritoItem,
  DetallePago,
  Certificacion,
  Resena,
  ComentarioLeccion,
  Notificacion,
  TokenUsuario,
  SesionUsuario,
  CursosRutas,
  InscripcionRuta,
  Material,
  Contacto,
  Session,
} from "../types/models";

// 1. personal_access_tokens
export const mockPersonalAccessTokens: PersonalAccessToken[] = [
  {
    id: 1,
    tokenable_type: "Usuario",
    tokenable_id: 1,
    name: "web-client",
    token: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
    abilities: "read,write",
    last_used_at: "2025-09-01T10:00:00",
    expires_at: "2026-09-01T10:00:00",
    created_at: "2025-01-01T00:00:00",
    updated_at: "2025-09-01T10:00:00",
  },
  {
    id: 2,
    tokenable_type: "Usuario",
    tokenable_id: 2,
    name: "mobile",
    token: "1111111111111111222222222222222233333333333333334444444444444444",
    abilities: null,
    last_used_at: null,
    expires_at: null,
    created_at: "2025-02-15T12:00:00",
    updated_at: "2025-02-15T12:00:00",
  },
];

// 2. rol
export const mockRoles: Rol[] = [
  { id_rol: 1, nombre_rol: "Admin", descripcion: "Administrador del sistema", fecha_creacion: "2024-01-01T00:00:00", fecha_actualizacion: "2024-01-01T00:00:00" },
  { id_rol: 2, nombre_rol: "Instructor", descripcion: "Creador de cursos", fecha_creacion: "2024-02-01T00:00:00", fecha_actualizacion: null },
  { id_rol: 3, nombre_rol: "Estudiante", descripcion: null, fecha_creacion: "2024-03-01T00:00:00", fecha_actualizacion: null },
];

// 3. usuarios
export const mockUsuarios: Usuario[] = [
  {
    id_usuario: 1,
    id_rol: 1,
    nombre: "Ed",
    apellido: "Donner",
    dni: "12345678",
    email: "ed.donner@example.com",
    password: "hashed_pw_1",
  // telefono: "+511234567", // Eliminado: no existe en Usuario
    imagen_perfil: "https://plus.unsplash.com/premium_photo-1667030474693-6d0632f97029?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    biografia: "Backend Developer",
    email_verificado: true,
  estado: "Publicado",
    fecha_registro: "2024-05-01T09:00:00",
    ultimo_acceso: "2025-09-20T12:00:00",
  },
  {
    id_usuario: 2,
    id_rol: 3,
    nombre: "Leandro",
    apellido: "C",
    dni: "87654321",
    email: "leandro.c@example.com",
    password: "hashed_pw_2",
  // telefono: null, // Eliminado: no existe en Usuario
    imagen_perfil: null,
    biografia: null,
    email_verificado: false,
  estado: "Publicado",
    fecha_registro: "2024-06-10T11:00:00",
    ultimo_acceso: "2025-09-10T08:30:00",
  },
  {
    id_usuario: 3,
    id_rol: 2,
    nombre: "Diego",
    apellido: "Z",
  dni: "", // Debe ser string, no null
    email: "diego.z@example.com",
    password: "hashed_pw_3",
  // telefono: "+51987654321", // Eliminado: no existe en Usuario
    imagen_perfil: "https://via.placeholder.com/150",
    biografia: "Instructor fullstack",
    email_verificado: true,
  estado: "Publicado",
    fecha_registro: "2024-07-15T14:00:00",
    ultimo_acceso: "2025-09-15T10:00:00",
  },
];

// 4. lineas_academicas
export const mockLineasAcademicas: LineaAcademica[] = [
  {
    id_linea: 1,
    nombre: "MIS DEV",
    descripcion: "Formación integral en desarrollo de software y programación para construir aplicaciones completas.",
    imagen: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  estado: "Publicado",
    fecha_creacion: "2024-01-01T00:00:00",
    fecha_actualizacion: null,
  },
  {
    id_linea: 2,
    nombre: "MIS IA",
    descripcion: "Especialización en Inteligencia Artificial y Machine Learning para resolver problemas complejos y crear soluciones inteligentes.",
    imagen: "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  estado: "Publicado",
    fecha_creacion: "2024-01-10T00:00:00",
    fecha_actualizacion: null,
  },
  {
    id_linea: 3,
    nombre: "MIS TEACHER",
    descripcion: "Desarrollo de habilidades pedagógicas y herramientas educativas para formar profesionales en el ámbito educativo.",
    imagen: "https://images.unsplash.com/photo-1589395937658-0557e7d89fad?q=80&w=1412&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  estado: "Publicado",
    fecha_creacion: "2024-02-01T00:00:00",
    fecha_actualizacion: null,
  },
  {
    id_linea: 4,
    nombre: "MIS BUSINESS",
    descripcion: "Capacitación en estrategias de negocio, emprendimiento y gestión para crear empresas exitosas en el mercado actual.",
    imagen: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  estado: "Publicado",
    fecha_creacion: "2024-03-01T00:00:00",
    fecha_actualizacion: null,
  },
];

// 5. Rutas Académicas
export const mockRutasAcademicas: RutaAcademica[] = [
  {
    id_ruta: 1,
    nombre: "Ruta Fullstack",
    descripcion: "Ruta para ser desarrollador fullstack",
    id_linea_academica: 1,
    imagen: "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?q=80&w=1500&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    horas_totales: 200,
    nivel: "Intermedio",
    precio: 199.99,
  estado: "Activa",
    destacado: true,
    fecha_creacion: "2024-05-01T00:00:00",
    fecha_actualizacion: null,
  },
  {
    id_ruta: 2,
    nombre: "Ruta Agentes IA",
    descripcion: "Ruta especializada en agentes autónomos",
    id_linea_academica: 2,
    imagen: "https://images.unsplash.com/photo-1666597107756-ef489e9f1f09?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    horas_totales: 120,
    nivel: "Avanzado",
    precio: 249.99,
  estado: "Activa",
    destacado: false,
    fecha_creacion: "2025-02-01T00:00:00",
    fecha_actualizacion: null,
  },
  {
    id_ruta: 3,
    nombre: "Ruta Backend",
    descripcion: "Ruta enfocada en el desarrollo de aplicaciones backend con Node.js",
    id_linea_academica: 1,
    imagen: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    horas_totales: 150,
    nivel: "Intermedio",
    precio: 149.99,
  estado: "Activa",
    destacado: false,
    fecha_creacion: "2024-06-01T00:00:00",
    fecha_actualizacion: null,
  },
  {
    id_ruta: 4,
    nombre: "Ruta Inteligencia Artificial",
    descripcion: "Ruta especializada en el desarrollo de modelos y agentes de IA",
    id_linea_academica: 2,
    imagen: "https://images.unsplash.com/photo-1694903110330-cc64b7e1d21d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    horas_totales: 180,
    nivel: "Avanzado",
    precio: 279.99,
  estado: "Activa",
    destacado: true,
    fecha_creacion: "2025-03-01T00:00:00",
    fecha_actualizacion: null,
  },
];

// 6. Cursos
export const mockCursos: Curso[] = [
  {
    id_curso: 1,
    nombre: "Curso Fullstack",
    descripcion: "Curso para ser desarrollador Fullstack",
    imagen: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    duracion: "180",
    precio: 99.99,
    nivel: "Intermedio",
    estado: "Publicado",
    destacado: true,
    fecha_creacion: "2024-01-01T00:00:00",
    fecha_actualizacion: null,          // <- antes undefined
    id_ruta: 1,                         // <- lo mantenemos
    rutas: [1],                         // <- requerido por el tipo
  },
  {
    id_curso: 2,
    nombre: "Curso Backend",
    descripcion: "Curso especializado en backend",
    imagen: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    duracion: "150",
    precio: 79.99,
    nivel: "Intermedio",
    estado: "Publicado",
    destacado: false,
    fecha_creacion: "2024-02-01T00:00:00",
    fecha_actualizacion: null,          // <- antes undefined
    id_ruta: 1,
    rutas: [1],
  },
  {
    id_curso: 3,
    nombre: "Curso Agentes IA",
    descripcion: "Curso sobre agentes autónomos",
    imagen: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    duracion: "120",
    precio: 129.99,
    nivel: "Avanzado",
    estado: "Publicado",
    destacado: true,
    fecha_creacion: "2024-05-01T00:00:00",
    fecha_actualizacion: null,          // <- antes undefined
    id_ruta: 2,
    rutas: [2],
  },
  {
    id_curso: 4,
    nombre: "Curso Frontend",
    descripcion: "Curso de desarrollo frontend con React, HTML y CSS",
    imagen: "https://images.unsplash.com/photo-1592609930961-219235eded71?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    duracion: "140",
    precio: 89.99,
    nivel: "Intermedio",
    estado: "Publicado",
    destacado: false,
    fecha_creacion: "2024-03-01T00:00:00",
    fecha_actualizacion: null,          // <- antes undefined
    id_ruta: 3,
    rutas: [3],
  },
  {
    id_curso: 5,
    nombre: "Curso IA Básica",
    descripcion: "Curso introductorio a la inteligencia artificial y aprendizaje automático",
    imagen: "https://images.unsplash.com/photo-1592609930961-219235eded71?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    duracion: "100",
    precio: 109.99,
    nivel: "Principiante",
    estado: "Publicado",
    destacado: true,
    fecha_creacion: "2024-04-01T00:00:00",
    fecha_actualizacion: null,          // <- antes undefined
    id_ruta: 4,
    rutas: [4],
  },
];


// 7. Módulos
export const mockModulos: Modulo[] = [
  { id_modulo: 1, id_curso: 1, titulo: "Introducción a Fullstack", descripcion: null, orden: 1, estado: "Activo", fecha_creacion: "2024-01-01T00:00:00", fecha_actualizacion: null},
  { id_modulo: 2, id_curso: 1, titulo: "Backend con Node.js", descripcion: null, orden: 2, estado: "Activo", fecha_creacion: "2024-01-01T00:00:00", fecha_actualizacion: null},
  { id_modulo: 3, id_curso: 2, titulo: "Fundamentos de Backend", descripcion: null, orden: 1, estado: "Activo", fecha_creacion: "2024-02-01T00:00:00", fecha_actualizacion: null },
  { id_modulo: 4, id_curso: 3, titulo: "Introducción a los Agentes IA", descripcion: null, orden: 1, estado: "Activo", fecha_creacion: "2024-03-01T00:00:00", fecha_actualizacion: null},
  { id_modulo: 5, id_curso: 3, titulo: "Desarrollo de Agentes", descripcion: null, orden: 2, estado: "Activo", fecha_creacion: "2024-04-01T00:00:00", fecha_actualizacion: null },
  { id_modulo: 6, id_curso: 4, titulo: "Introducción al Frontend", descripcion: null, orden: 1, estado: "Activo", fecha_creacion: "2024-03-01T00:00:00", fecha_actualizacion: null },
  { id_modulo: 7, id_curso: 5, titulo: "Conceptos Básicos de IA", descripcion: null, orden: 1, estado: "Activo", fecha_creacion: "2024-04-01T00:00:00", fecha_actualizacion: null },
];

// 8. Lecciones
export const mockLecciones: Leccion[] = [
  { id_leccion: 1, id_modulo: 1, titulo: "Instalación de Node.js", descripcion: null, url_video: "https://www.youtube.com/embed/video1", duracion: 15, orden: 1, estado: "Publicado", fecha_creacion: "2024-01-01T00:00:00", fecha_actualizacion: null },
  { id_leccion: 2, id_modulo: 2, titulo: "Configurar un servidor Express", descripcion: null, url_video: null, duracion: 30, orden: 1, estado: "Publicado", fecha_creacion: "2024-01-01T00:00:00", fecha_actualizacion: null },
  { id_leccion: 3, id_modulo: 3, titulo: "Base de datos con MongoDB", descripcion: null, url_video: "https://www.youtube.com/embed/video2", duracion: 40, orden: 1, estado: "Publicado", fecha_creacion: "2024-02-01T00:00:00", fecha_actualizacion: null },
  { id_leccion: 4, id_modulo: 4, titulo: "Conceptos básicos de IA", descripcion: null, url_video: null, duracion: 20, orden: 1, estado: "Publicado", fecha_creacion: "2024-03-01T00:00:00", fecha_actualizacion: null },
  { id_leccion: 5, id_modulo: 5, titulo: "Desarrollando un Agente", descripcion: null, url_video: "https://www.youtube.com/embed/video3", duracion: 60, orden: 1, estado: "Publicado", fecha_creacion: "2024-04-01T00:00:00", fecha_actualizacion: null },
  { id_leccion: 6, id_modulo: 6, titulo: "Configuración de React", descripcion: null, url_video: null, duracion: 25, orden: 1, estado: "Publicado", fecha_creacion: "2024-03-01T00:00:00", fecha_actualizacion: null },
  { id_leccion: 7, id_modulo: 7, titulo: "Introducción a la IA", descripcion: null, url_video: "https://www.youtube.com/embed/video4", duracion: 50, orden: 1, estado: "Publicado", fecha_creacion: "2024-04-01T00:00:00", fecha_actualizacion: null },
];

// 9. inscripciones
export const mockInscripciones: Inscripcion[] = [
  { id_inscripcion: 1, id_usuario: 2, id_curso: 1, fecha_inscripcion: "2025-07-10T10:00:00", estado: "Activo", progreso_total: 25.0, fecha_completado: null },
  { id_inscripcion: 2, id_usuario: 2, id_curso: 2, fecha_inscripcion: "2024-09-01T09:00:00", estado: "Completado", progreso_total: 100.0, fecha_completado: "2025-01-10T12:00:00" },
];

// 10. progreso_estudiante
export const mockProgresoEstudiante: ProgresoEstudiante[] = [
  { id_progreso: 1, id_inscripcion: 1, id_leccion: 1, estado: "En progreso", tiempo_visualizacion: 300, porcentaje_completado: 50.0, ultima_actividad: "2025-09-20T11:00:00", fecha_completado: null },
  { id_progreso: 2, id_inscripcion: 2, id_leccion: 3, estado: "Completado", tiempo_visualizacion: 600, porcentaje_completado: 100.0, ultima_actividad: "2025-01-10T12:00:00", fecha_completado: "2025-01-10T12:00:00" },
];

// 11. evaluaciones
export const mockEvaluaciones: Evaluacion[] = [
  { id_evaluacion: 1, id_curso: 1, titulo: "Quiz Semana 1", descripcion: null, puntuacion_requerida: 70.0, duracion: 30, intentos_maximos: 2, estado: "Activo", fecha_creacion: "2025-01-05T00:00:00", fecha_actualizacion: null },
];

// 12. preguntas
export const mockPreguntas: Pregunta[] = [
  { id_pregunta: 1, id_evaluacion: 1, texto_pregunta: "¿Qué es un agente autónomo?", tipo: "Texto libre", puntos: 5, orden: 1 },
  { id_pregunta: 2, id_evaluacion: 1, texto_pregunta: "¿Cuál es la librería para interfaces de React?", tipo: "Opcion multiple", puntos: 2, orden: 2 },
];

// 13. opciones_respuesta
export const mockOpcionesRespuesta: OpcionRespuesta[] = [
  { id_opcion: 1, id_pregunta: 2, texto_opcion: "React", es_correcta: true },
  { id_opcion: 2, id_pregunta: 2, texto_opcion: "Angular", es_correcta: false },
  { id_opcion: 3, id_pregunta: 2, texto_opcion: "Vue", es_correcta: false },
];

// 14. intentos_evaluacion
export const mockIntentosEvaluacion: IntentoEvaluacion[] = [
  { id_intento: 1, id_usuario: 2, id_evaluacion: 1, fecha_inicio: "2025-07-11T09:00:00", fecha_finalizacion: "2025-07-11T09:20:00", calificacion: 85.0, intento_numero: 1, estado: "Completado" },
];

// 15. respuestas_usuario
export const mockRespuestasUsuario: RespuestaUsuario[] = [
  { id_respuesta: 1, id_intento: 1, id_pregunta: 2, id_opcion: 1, respuesta_texto: null, puntos_obtenidos: 2 },
];

// 16. tipos_pagos
export const mockTiposPagos: TipoPago[] = [
  { id_tipo_pago: 1, nombre: "Tarjeta", descripcion: "Pago con tarjeta", activo: true, comision: 2.5, codigo_referencia: "CARD" },
  { id_tipo_pago: 2, nombre: "PayPal", descripcion: null, activo: true, comision: 3.0, codigo_referencia: "PP" },
];

// 17. pagos
export const mockPagos: Pago[] = [
  { id_pago: 1, id_usuario: 2, id_tipo_pago: 1, monto: 60.0, fecha_pago: "2025-07-10T10:05:00", estado: "Completado", referencia_externa: "PAY-123", detalles_transaccion: null },
];

// 18. carrito_compras
export const mockCarritoCompras: CarritoCompras[] = [
  { id_carrito: 1, id_usuario: 2, fecha_creacion: "2025-07-10T09:50:00", fecha_actualizacion: "2025-07-10T09:55:00", estado: "Activo" },
];

// 19. carrito_items
export const mockCarritoItems: CarritoItem[] = [
  { id_item: 1, id_carrito: 1, id_curso: 1, precio: 60.0, fecha_agregado: "2025-07-10T09:51:00" },
];

// 20. detalle_pagos
export const mockDetallePagos: DetallePago[] = [
  { id_detalle: 1, id_pago: 1, id_curso: 1, precio_unitario: 60.0, descuento: 0.0, total: 60.0 },
];

// 21. certificaciones
export const mockCertificaciones: Certificacion[] = [
  { id_certificacion: 1, id_usuario: 2, id_curso: 2, fecha_emision: "2025-01-11T12:00:00", codigo_certificado: "CERT-0001", calificacion_final: 95.0, url_certificado: "https://example.com/cert/1", tipo_certificado: "empresa" },
];

// 22. resenas
export const mockResenas: Resena[] = [
  { id_resena: 1, id_usuario: 2, id_curso: 1, calificacion: 5, comentario: "Excelente curso práctico.", fecha_resena: "2025-07-12T15:00:00" },
];

// 23. comentarios_leccion
export const mockComentariosLeccion: ComentarioLeccion[] = [
  { id_comentario: 1, id_usuario: 2, id_leccion: 1, comentario: "Gran explicación", fecha_comentario: "2025-07-12T15:30:00", comentario_padre_id: null },
];

// 24. notificaciones
export const mockNotificaciones: Notificacion[] = [
  { id_notificacion: 1, id_usuario: 2, titulo: "Bienvenido", mensaje: "Gracias por inscribirte", tipo: "Sistema", leida: false, fecha_creacion: "2025-07-10T10:00:00", fecha_leida: null },
];

// 25. tokens_usuario
export const mockTokensUsuario: TokenUsuario[] = [
  { id_token: 1, id_usuario: 2, token: "tok-verify-123", tipo: "Verificacion", fecha_creacion: "2025-07-01T00:00:00", fecha_expiracion: "2025-07-08T00:00:00", usado: false },
];

// 26. sesiones_usuario
export const mockSesionesUsuario: SesionUsuario[] = [
  { id_sesion: "sess-1", id_usuario: 2, ip_address: "192.168.0.2", user_agent: "Mozilla/5.0", payload: '{"uid":2}', ultimo_acceso: "2025-09-20T11:00:00" },
];

// 27. cursos_rutas
export const mockCursosRutas: CursosRutas[] = [
  { id: 1, id_curso: 1, id_ruta: 1, orden: 1 },
  { id: 2, id_curso: 2, id_ruta: 1, orden: 1 },
  { id: 3, id_curso: 2, id_ruta: 2, orden: 2 },
  { id: 4, id_curso: 3, id_ruta: 2, orden: 3 },
  { id: 5, id_curso: 4, id_ruta: 3, orden: 2 },
  { id: 6, id_curso: 4, id_ruta: 4, orden: 3 },
];

// 28. inscripciones_rutas
export const mockInscripcionesRutas: InscripcionRuta[] = [
  { id_inscripcion_ruta: 1, id_usuario: 2, id_ruta: 1, fecha_inscripcion: "2025-07-10T10:00:00", estado: "Activo", progreso_total: 10.0, fecha_completado: null },
];

// 29. materiales
export const mockMateriales: Material[] = [
  { id_material: 1, id_modulo: 1, nombre: "Guía instalación", descripcion: "PDF paso a paso", url_archivo: "https://via.placeholder.com/file.pdf", tamanio: 512, estado: "Publicado", fecha_creacion: "2025-01-10T00:00:00" },
  { id_material: 2, id_modulo: 1, nombre: "Slides Intro React", descripcion: null, url_archivo: "https://via.placeholder.com/slides.ppt", tamanio: 1024, estado: "Publicado", fecha_creacion: "2024-08-02T00:00:00" },
];

// 30. contacto
export const mockContactos: Contacto[] = [
  { id_contacto: 1, nombre: "Carlos", apellido: "Sánchez", email: "carlos.s@example.com", telefono: "555-9999", asunto: "Soporte técnico", mensaje: "No puedo acceder al curso.", fecha_envio: "2025-07-11T09:00:00", estado: "Pendiente", fecha_respuesta: null, respuesta: null },
  { id_contacto: 2, nombre: "Laura", apellido: "M", email: "laura.m@example.com", telefono: null, asunto: "Factura", mensaje: "Solicito factura del pago.", fecha_envio: "2025-06-01T08:00:00", estado: "Respondido", fecha_respuesta: "2025-06-02T10:00:00", respuesta: "Enviada por correo" },
];

// 31. sessions (tabla sessions tipo Laravel)
export const mockSessions: Session[] = [
  { id: "session1", user_id: 1, ip_address: "192.168.0.1", user_agent: "Mozilla/5.0", payload: '{"user":1}', last_activity: 1695200000 },
  { id: "session2", user_id: 2, ip_address: "192.168.0.2", user_agent: "Mozilla/5.0", payload: '{"user":2}', last_activity: 1695200100 },
];

// export all as default object (opcional)
const mockDB = {
  personalAccessTokens: mockPersonalAccessTokens,
  roles: mockRoles,
  usuarios: mockUsuarios,
  lineasAcademicas: mockLineasAcademicas,
  cursos: mockCursos,
  rutasAcademicas: mockRutasAcademicas,
  modulos: mockModulos,
  lecciones: mockLecciones,
  inscripciones: mockInscripciones,
  progresoEstudiante: mockProgresoEstudiante,
  evaluaciones: mockEvaluaciones,
  preguntas: mockPreguntas,
  opcionesRespuesta: mockOpcionesRespuesta,
  intentosEvaluacion: mockIntentosEvaluacion,
  respuestasUsuario: mockRespuestasUsuario,
  tiposPagos: mockTiposPagos,
  pagos: mockPagos,
  carritoCompras: mockCarritoCompras,
  carritoItems: mockCarritoItems,
  detallePagos: mockDetallePagos,
  certificaciones: mockCertificaciones,
  resenas: mockResenas,
  comentariosLeccion: mockComentariosLeccion,
  notificaciones: mockNotificaciones,
  tokensUsuario: mockTokensUsuario,
  sesionesUsuario: mockSesionesUsuario,
  cursosRutas: mockCursosRutas,
  inscripcionesRutas: mockInscripcionesRutas,
  materiales: mockMateriales,
  contactos: mockContactos,
  sessions: mockSessions,
};

export default mockDB;
