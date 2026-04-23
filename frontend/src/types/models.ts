// 1. PersonalAccessToken
export interface PersonalAccessToken {
  id: number;
  tokenable_type: string;
  tokenable_id: number;
  name: string;
  token: string;
  abilities: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// 2. Rol
export interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

// 3. Usuario
export interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  password?: string;
  id_rol: number;
  estado: string;
  imagen_perfil?: string | null;
  biografia?: string | null;
  email_verificado?: boolean;
  fecha_registro?: string;
  ultimo_acceso?: string;
}

// 4. LineaAcademica
export interface LineaAcademica {
  id_linea: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  estado: 'Publicado' | 'Archivado' | string;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

// 5. Curso
export interface Curso {
  id_curso: number;
  nombre: string;
  descripcion: string;
  descripcion_corta?: string | null;
  descripcion_larga?: string | null;
  imagen: string | null;
  video_previsualizacion?: string | null;
  lo_que_aprenderas?: string | null;
  requisitos?: string | null;
  duracion: number | string;
  tiempo?: number | null;
  precio: number;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado' | string;
  estado: 'Publicado' | 'Archivado' | string;
  destacado: boolean | 0 | 1;
  docente?: {
    id_docente: number;
    nombre: string;
    imagen?: string | null;
  } | null;
  id_docente?: number | null;
  fecha_creacion: string;
  fecha_actualizacion?: string | null;
  id_ruta?: number;
  rutas: (number | { id_ruta: number; nombre?: string; orden?: number })[];
}


// 6. RutaAcademica
export interface RutaAcademica {
  id_ruta: number;
  nombre: string;
  descripcion: string | null;
  id_linea_academica: number;
  imagen: string | null;
  horas_totales: number;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado' | string;
  precio: number;
  estado: 'Activa' | 'Inactiva' | 'Borrador' | string;
  destacado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

// 7. Modulo
export interface Modulo {
  id_modulo: number;
  id_curso: number;
  titulo: string;
  descripcion: string | null;
  orden: number;
  estado: 'Activo' | 'Inactivo' | string;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

// 8. Leccion
export interface Leccion {
  id_leccion: number;
  id_modulo: number;
  titulo: string;
  descripcion: string | null;
  url_video: string | null;
  duracion: number | null;
  orden: number;
  estado: 'Publicado' | 'Archivado' | string;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

// 9. Inscripcion
export interface Inscripcion {
  id_inscripcion: number;
  id_usuario: number;
  id_curso: number;
  fecha_inscripcion: string;
  estado: 'Activo' | 'Completado' | 'Abandonado' | 'Suspendido' | string;
  progreso_total: number;
  fecha_completado: string | null;
}

// 10. ProgresoEstudiante
export interface ProgresoEstudiante {
  id_progreso: number;
  id_inscripcion: number;
  id_leccion: number;
  estado: 'No iniciado' | 'En progreso' | 'Completado' | string;
  tiempo_visualizacion: number;
  porcentaje_completado: number;
  ultima_actividad: string | null;
  fecha_completado: string | null;
}

// 11. Evaluacion
export interface Evaluacion {
  id_evaluacion: number;
  id_curso: number;
  titulo: string;
  descripcion: string | null;
  puntuacion_requerida: number;
  duracion: number | null;
  intentos_maximos: number;
  estado: 'Activo' | 'Inactivo' | string;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

// 12. Pregunta
export interface Pregunta {
  id_pregunta: number;
  id_evaluacion: number;
  texto_pregunta: string;
  tipo: 'Opcion multiple' | 'Verdadero/Falso' | 'Texto libre' | string;
  puntos: number;
  orden: number;
}

// 13. OpcionRespuesta
export interface OpcionRespuesta {
  id_opcion: number;
  id_pregunta: number;
  texto_opcion: string;
  es_correcta: boolean;
}

// 14. IntentoEvaluacion
export interface IntentoEvaluacion {
  id_intento: number;
  id_usuario: number;
  id_evaluacion: number;
  fecha_inicio: string;
  fecha_finalizacion: string | null;
  calificacion: number | null;
  intento_numero: number;
  estado: 'En progreso' | 'Completado' | 'Abandonado' | string;
}

// 15. RespuestaUsuario
export interface RespuestaUsuario {
  id_respuesta: number;
  id_intento: number;
  id_pregunta: number;
  id_opcion: number | null;
  respuesta_texto: string | null;
  puntos_obtenidos: number;
}

// 16. TipoPago
export interface TipoPago {
  id_tipo_pago: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  comision?: number | string | null;
  codigo_referencia?: string | null;
}


// 17. Pago
export interface Pago {
  id_pago: number;
  id_usuario: number;
  id_tipo_pago: number;
  monto: number;
  fecha_pago: string;
  estado: 'Pendiente' | 'Completado' | 'Fallido' | 'Reembolsado' | string;
  referencia_externa: string | null;
  detalles_transaccion: string | null;
  tipo_pago?: TipoPago;
  usuario?: Usuario;
}

// 18. CarritoCompras
export interface CarritoCompras {
  id_carrito: number;
  id_usuario: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: 'Activo' | 'Abandonado' | 'Completado' | string;
}

// 19. CarritoItem
export interface CarritoItem {
  id_item: number;
  id_carrito: number;
  id_curso: number;
  precio: number;
  fecha_agregado: string;
}

// 20. DetallePago
export interface DetallePago {
  id_detalle: number;
  id_pago: number;
  id_curso: number;
  precio_unitario: number;
  descuento: number;
  total: number;
}

// 21. Certificacion
interface CertificacionBase {
  id_certificacion: number;
  codigo_certificado: string;
  tipo_certificado: "empresa" | "adicional";
  fecha_emision: string | null;
}

export interface CertificacionEmpresa extends CertificacionBase {
  tipo_certificado: "empresa";
  id_usuario: number;
  id_curso: number;
  calificacion_final: number;
  url_certificado: string | null;
  nombre_estudiante?: never;
  nombre_curso?: never;
  fecha_inicio?: never;
  fecha_fin?: never;
  total_horas?: never;
  email_destinatario?: never;
}

export interface CertificacionAdicional extends CertificacionBase {
  tipo_certificado: "adicional";
  id_usuario?: never;
  id_curso?: never;
  calificacion_final?: never;
  url_certificado?: never;

  nombre_estudiante: string;
  nombre_curso: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_horas: number;
  email_destinatario: string;
}

export type Certificacion = CertificacionEmpresa | CertificacionAdicional;


// 22. Resena
export interface Resena {
  id_resena: number;
  id_usuario: number;
  id_curso: number;
  calificacion: number;
  comentario: string;
  fecha_resena: string;
  usuario?: {
    id_usuario: number;
    nombre: string;
    apellido?: string;
    imagen_perfil?: string | null;
  };
}


// 23. ComentarioLeccion
export interface ComentarioLeccion {
  id_comentario: number;
  id_usuario: number;
  id_leccion: number;
  comentario: string;
  fecha_comentario: string;
  comentario_padre_id: number | null;
}

// 24. Notificacion
export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  mensaje: string;
  tipo: 'Sistema' | 'Curso' | 'Pago' | 'Certificacion' | string;
  leida: boolean;
  fecha_creacion: string;
  fecha_leida: string | null;
}

// 25. TokenUsuario
export interface TokenUsuario {
  id_token: number;
  id_usuario: number;
  token: string;
  tipo: 'Verificacion' | 'Reseteo' | 'API' | string;
  fecha_creacion: string;
  fecha_expiracion: string;
  usado: boolean;
}

// 26. SesionUsuario
export interface SesionUsuario {
  id_sesion: string;
  id_usuario: number;
  ip_address: string | null;
  user_agent: string | null;
  payload: string | null;
  ultimo_acceso: string;
}

// 27. CursosRutas (tabla pivote)
export interface CursosRutas {
  id: number;
  id_curso: number;
  id_ruta: number;
  orden: number;
}

// 28. InscripcionRuta
export interface InscripcionRuta {
  id_inscripcion_ruta: number;
  id_usuario: number;
  id_ruta: number;
  fecha_inscripcion: string;
  estado: 'Activo' | 'Completado' | 'Abandonado' | 'Suspendido' | string;
  progreso_total: number;
  fecha_completado: string | null;
}

// 29. Material
export interface Material {
  id_material: number;
  id_modulo: number;
  nombre: string;
  descripcion: string | null;
  url_archivo: string;
  tamanio: number | null;
  estado: 'Publicado' | 'Archivado' | string;
  fecha_creacion: string;
}

// 30. Contacto
export interface Contacto {
  id_contacto: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  asunto: string;
  mensaje: string;
  fecha_envio: string;
  estado: 'Pendiente' | 'Respondido' | 'Archivado' | string;
  fecha_respuesta: string | null;
  respuesta: string | null;
}

// 31. Session (para autenticación Laravel o similar)
export interface Session {
  id: string;
  user_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  payload: string;
  last_activity: number;
}
