import { useEffect, useMemo, useState } from 'react';
import {
  FaSearch,
  FaTimes,
  FaExternalLinkAlt,
  FaUser,
  FaIdCard,
  FaAward,
  FaShieldAlt,
  FaCheck,
  FaCalendarAlt,
  FaStar,
  FaEnvelope,
  FaBookOpen,
} from 'react-icons/fa';
import { API_URL } from '../config/api';
import { apiClient } from '../services/apiClient';
import { useSearchParams } from 'react-router-dom';

type Status = 'idle' | 'loading' | 'success' | 'error';

type Certificacion = {
  id_certificacion: number;
  id_usuario: number;
  id_curso: number;
  fecha_emision: string;
  codigo_certificado: string;
  calificacion_final: number | string;
  url_certificado: string | null;
  tipo_certificado: string;
  nombre_curso: string | null;
  nombre_estudiante: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  total_horas: number | string | null;
  email_destinatario: string | null;
  usuario?: any;
  curso?: any;
};

const API_BASE = API_URL;
const MOSTRAR_DIPLOMA_OFICIAL = false;

/* =======================
   Helpers
   ======================= */

function fmt(value: any) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function fmtDate(value: any) {
  if (!value) return '—';

  const d = new Date(value);

  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

function getNombreCompleto(usuario: any) {
  if (!usuario) return null;

  const nombre = usuario?.nombre ?? '';
  const apellido = usuario?.apellido ?? '';
  const full = `${nombre} ${apellido}`.trim();

  return full || null;
}

function getTipoCertificadoLabel(tipo: string | null | undefined): string {
  if (!tipo) return '—';

  if (tipo === 'adicional' || tipo === 'Certificado Adicional') {
    return 'Certificado Adicional';
  }

  if (tipo === 'empresa' || tipo === 'Certificado de Aprobación') {
    return 'Certificado de Aprobación';
  }

  return tipo;
}

function getCursoNombre(curso: any) {
  if (!curso) return null;

  return curso?.nombre ?? curso?.nombre_curso ?? curso?.titulo ?? curso?.title ?? null;
}

/* =======================
   Normalización de búsqueda
   ======================= */

function quitarTildes(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function limpiarBusqueda(str: string, tipoBusqueda: 'nombre' | 'dni' | 'codigo') {
  let limpio = quitarTildes(str);

  if (tipoBusqueda === 'nombre') {
    limpio = limpio.replace(/[^a-zA-Z0-9\s]/g, '');
  } else {
    limpio = limpio.replace(/[^a-zA-Z0-9\s-]/g, '');
  }

  return limpio.trim().replace(/\s+/g, ' ');
}

/* =======================
   Component
   ======================= */

export default function ConsultarCertificado() {
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState<'nombre' | 'dni' | 'codigo'>('codigo');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [data, setData] = useState<Certificacion[]>([]);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const placeholderText = useMemo(() => {
    if (tipo === 'nombre') {
      return 'Escribe tu nombre y apellidos completos...';
    }

    if (tipo === 'dni') {
      return 'DNI del estudiante...';
    }

    return 'Código del certificado (ej: CERT-XXXX o MIS-XXXX)...';
  }, [tipo]);

  /* =======================
     Toast auto hide
     ======================= */

  useEffect(() => {
    if (status !== 'idle' && message) {
      setIsMessageVisible(true);

      const timer = setTimeout(() => setIsMessageVisible(false), 3000);

      return () => clearTimeout(timer);
    }
  }, [status, message]);

  /* =======================
     Buscar certificados
     ======================= */

  const buscar = async (c?: string, explicitTipo?: string) => {
    const activeTipo = (explicitTipo ?? tipo) as 'nombre' | 'dni' | 'codigo';

    const code = limpiarBusqueda((c ?? codigo).trim(), activeTipo);

    if (!code) {
      setStatus('error');

      const errorMsg =
        activeTipo === 'nombre'
          ? 'Ingresa nombres y apellidos para buscar.'
          : activeTipo === 'dni'
            ? 'Ingresa un DNI para buscar.'
            : 'Ingresa un código de certificado para buscar.';

      setMessage(errorMsg);
      setData([]);
      return;
    }

    // Evita búsquedas demasiado generales como "Gerson"
    if (activeTipo === 'nombre' && code.split(/\s+/).filter(Boolean).length < 2) {
      setStatus('error');
      setMessage('Ingresa tu nombre y al menos un apellido.');
      setData([]);
      return;
    }

    // Actualiza la URL solamente para búsquedas por código
    if (activeTipo === 'codigo') {
      setSearchParams({
        codigo: code,
      });
    }

    setStatus('loading');
    setMessage('Buscando certificados...');
    setData([]);

    try {
      const res = await apiClient.get(
        `/certificaciones/buscar?buscar=${encodeURIComponent(code)}&tipo=${activeTipo}`,
      );

      const payload = res.data;

      if (Array.isArray(payload) && payload.length > 0) {
        setData(payload);
        setStatus('success');
        setMessage(`Se encontraron ${payload.length} certificados.`);
      } else {
        setStatus('error');
        setMessage('No se encontraron certificados.');
        setData([]);
      }
    } catch (err: any) {
      const payload = err?.response?.data;

      setStatus('error');

      setMessage(
        Array.isArray(payload?.message)
          ? payload.message.join(', ')
          : payload?.message || 'Error consultando certificados.',
      );

      setData([]);
    }
  };

  /* =======================
     Limpiar
     ======================= */

  const limpiar = () => {
    setCodigo('');
    setStatus('idle');
    setMessage('');
    setData([]);
    setSearchParams({});
  };

  /* =======================
     Autoload por URL
     ======================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('codigo');

    if (c) {
      setCodigo(c);
      void buscar(c, 'codigo');
    }
  }, []);

  /* =======================
     Agrupar por persona
     ======================= */

  const certificadosPorPersona = useMemo(() => {
    return data.reduce((acc: Record<string, Certificacion[]>, cert) => {
      const persona = cert.nombre_estudiante ?? getNombreCompleto(cert.usuario) ?? 'Sin nombre';

      if (!acc[persona]) {
        acc[persona] = [];
      }

      acc[persona].push(cert);

      return acc;
    }, {});
  }, [data]);

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 py-4 sm:py-6 lg:py-8 text-white bg-[#03070C] relative overflow-hidden">
      {/* =======================
          Decorative atmosphere
         ======================= */}

      <div className="absolute top-[5%] left-[8%] w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] bg-sky-500/10 rounded-full blur-[110px] sm:blur-[130px] pointer-events-none" />

      <div className="absolute top-[38%] right-[5%] w-[240px] sm:w-[360px] h-[240px] sm:h-[360px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute bottom-[5%] left-[35%] w-[260px] sm:w-[420px] h-[260px] sm:h-[420px] bg-sky-400/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* =======================
            Hero / Header
           ======================= */}

        <div className="text-center mb-7 sm:mb-8 pt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/15 bg-sky-500/[0.04] backdrop-blur-xl mb-4">
            <FaShieldAlt className="text-sky-400 text-xs" />

            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/80">
              Verificación oficial
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.02]">
            Consulta de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
              Certificados
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed px-2">
            Busca por nombre o valida directamente con tu código de certificado o DNI.
          </p>
        </div>

        {/* =======================
            Selector de método
           ======================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6 sm:mb-7 max-w-2xl mx-auto bg-white/[0.015] border border-white/10 p-2 rounded-[1.75rem] sm:rounded-3xl backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
          {(['codigo', 'dni', 'nombre'] as const).map((t) => {
            const isActive = tipo === t;

            let Icon = FaAward;
            let label = 'Código';

            if (t === 'dni') {
              Icon = FaIdCard;
              label = 'DNI Estudiante';
            } else if (t === 'nombre') {
              Icon = FaUser;
              label = 'Nombre Completo';
            }

            return (
              <button
                key={t}
                onClick={() => {
                  setTipo(t);
                  setStatus('idle');
                  setMessage('');
                }}
                className={`relative flex items-center justify-center gap-2.5 px-4 py-3.5 sm:py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_10px_30px_rgba(14,165,233,0.18)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
                )}

                <Icon size={14} className={isActive ? 'text-white' : 'text-gray-500'} />

                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* =======================
            Search
           ======================= */}

        <div className="relative mb-5 sm:mb-6">
          <div className="absolute -inset-2 sm:-inset-3 rounded-[2.25rem] bg-sky-500/[0.035] blur-2xl pointer-events-none" />

          <div className="relative bg-white/[0.035] backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.28)] flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full group flex items-center">
              <FaSearch className="absolute left-5 sm:left-6 text-gray-500 group-focus-within:text-sky-400 transition-colors" />

              <input
                className="w-full bg-transparent border-none rounded-2xl pl-12 sm:pl-14 pr-12 py-4 text-sm sm:text-base md:text-lg font-medium outline-none focus:ring-0 placeholder:text-gray-600 transition-all text-white"
                placeholder={placeholderText}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void buscar()}
              />

              {codigo && (
                <button
                  onClick={limpiar}
                  className="absolute right-3 sm:right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                  title="Limpiar"
                >
                  <FaTimes size={16} />
                </button>
              )}
            </div>

            <div className="w-full md:w-auto p-1 md:p-0">
              <button
                onClick={() => void buscar()}
                disabled={status === 'loading'}
                className="w-full md:w-auto min-w-[160px] rounded-[1.35rem] sm:rounded-[1.5rem] px-8 sm:px-10 py-4 bg-gradient-to-r from-sky-500 to-indigo-500 hover:scale-[1.02] font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_12px_30px_rgba(14,165,233,0.2)] active:scale-95"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaSearch />
                )}

                {status === 'loading' ? 'Buscando' : 'Validar'}
              </button>
            </div>
          </div>
        </div>

        {/* =======================
            Trust indicators
           ======================= */}

        {status === 'idle' && data.length === 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-8 sm:mb-10">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                <FaCheck className="text-emerald-400 text-[9px]" />
              </span>
              Consulta oficial
            </div>

            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
              <span className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/15 flex items-center justify-center">
                <FaCheck className="text-sky-400 text-[9px]" />
              </span>
              Validación rápida
            </div>

            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
              <span className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
                <FaCheck className="text-indigo-400 text-[9px]" />
              </span>
              Información verificable
            </div>
          </div>
        )}

        {/* =======================
            Toast
           ======================= */}

        {status !== 'idle' && message && (
          <div
            className={`fixed bottom-5 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl border backdrop-blur-xl z-50 transition-all duration-500 shadow-2xl flex items-center gap-3 ${
              status === 'error'
                ? 'border-rose-500/50 text-rose-200 bg-rose-500/10'
                : status === 'success'
                  ? 'border-emerald-500/50 text-emerald-200 bg-emerald-500/10'
                  : 'border-sky-500/50 text-sky-200 bg-sky-500/10'
            } ${
              isMessageVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0 pointer-events-none'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
                status === 'error'
                  ? 'bg-rose-500'
                  : status === 'success'
                    ? 'bg-emerald-500'
                    : 'bg-sky-500'
              }`}
            />

            <span className="text-xs sm:text-sm font-bold tracking-tight">{message}</span>
          </div>
        )}

        {/* =======================
            Resultados
           ======================= */}

        {Object.keys(certificadosPorPersona).length > 0 && (
          <div className="space-y-16 sm:space-y-20 mt-16 sm:mt-20 animate-fadeIn pb-24 sm:pb-32">
            {Object.entries(certificadosPorPersona).map(([persona, certs]) => (
              <div key={persona} className="space-y-7 sm:space-y-8">
                {/* Nombre del estudiante */}

                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

                  <h2
                    className="text-lg sm:text-xl md:text-3xl font-black text-white uppercase px-2 sm:px-6 text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    style={{ letterSpacing: '0.10em' }}
                  >
                    {persona}
                  </h2>

                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-sky-500/30 to-transparent" />
                </div>

                {/* Certificados */}

                <div
                  className={
                    certs.length === 1
                      ? 'max-w-4xl mx-auto'
                      : 'grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8'
                  }
                >
                  {certs.map((cert, i) => {
                    const estudiante =
                      cert.nombre_estudiante ?? getNombreCompleto(cert.usuario) ?? persona;

                    const nombreCurso =
                      cert.nombre_curso ?? getCursoNombre(cert.curso) ?? 'Curso no disponible';

                    const tipoCertificado = getTipoCertificadoLabel(cert.tipo_certificado);

                    const codigoCertificado = fmt(cert.codigo_certificado);

                    const fechaEmision = fmtDate(cert.fecha_emision);

                    const calificacion = fmt(cert.calificacion_final);

                    const correo = fmt(cert.email_destinatario ?? cert.usuario?.email);

                    return (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-white/[0.025] backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.32)] transition-all duration-500 hover:border-sky-500/35 hover:-translate-y-1"
                      >
                        {/* Glow interno */}

                        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-72 h-52 bg-sky-500/[0.06] blur-[90px] pointer-events-none" />

                        {/* Botón diploma */}

                        {MOSTRAR_DIPLOMA_OFICIAL && (
                          <button
                            onClick={() =>
                              window.open(`/certificado/${cert.codigo_certificado}`, '_blank')
                            }
                            className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 group/btn"
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-500/10 border border-sky-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center text-sky-400 group-hover/btn:scale-110 group-hover/btn:bg-sky-500 group-hover/btn:text-black transition-all">
                              <FaExternalLinkAlt size={16} />
                            </div>
                          </button>
                        )}

                        <div className="relative p-6 sm:p-8 lg:p-9">
                          {/* Cabecera */}

                          <div className="mb-6 sm:mb-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] mb-3">
                              <FaCheck className="text-emerald-400 text-[9px]" />

                              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300/80">
                                Certificado verificado
                              </span>
                            </div>

                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-sky-400/70 mb-1.5">
                              {tipoCertificado}
                            </p>

                            <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                              Código de verificación
                            </span>

                            <div className="mt-1.5 inline-flex max-w-full items-center px-3.5 py-2 rounded-xl bg-sky-500/[0.07] border border-sky-500/15">
                              <span className="text-sm sm:text-base font-black tracking-[0.08em] text-sky-300 break-all">
                                {codigoCertificado}
                              </span>
                            </div>
                          </div>

                          {/* Estudiante + Curso */}

                          <div className="mb-6 sm:mb-7">
                            <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                              Estudiante
                            </span>

                            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight text-white break-words">
                              {estudiante}
                            </h3>

                            <div className="mt-4 flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/15 flex items-center justify-center flex-shrink-0">
                                <FaBookOpen className="text-indigo-400 text-xs" />
                              </div>

                              <div className="min-w-0">
                                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-gray-500 mb-1">
                                  Curso
                                </span>

                                <p className="text-sm sm:text-base font-bold text-gray-200 leading-relaxed break-words">
                                  {nombreCurso}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Datos principales */}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Fecha */}

                            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-sky-500/[0.08] border border-sky-500/10 flex items-center justify-center">
                                  <FaCalendarAlt className="text-sky-400 text-[11px]" />
                                </div>

                                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                                  Fecha de emisión
                                </span>
                              </div>

                              <p className="text-sm sm:text-base font-bold text-gray-200">
                                {fechaEmision}
                              </p>
                            </div>

                            {/* Calificación */}

                            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/[0.08] border border-amber-500/10 flex items-center justify-center">
                                  <FaStar className="text-amber-400 text-[11px]" />
                                </div>

                                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                                  Calificación final
                                </span>
                              </div>

                              <p className="text-sm sm:text-base font-bold text-gray-200">
                                {calificacion}
                              </p>
                            </div>
                          </div>

                          {/* Correo */}

                          <div className="mt-3 sm:mt-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-sky-500/[0.08] border border-sky-500/10 flex items-center justify-center flex-shrink-0">
                                <FaEnvelope className="text-sky-400 text-xs" />
                              </div>

                              <div className="min-w-0">
                                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-gray-500 mb-1">
                                  Correo electrónico
                                </span>

                                <p className="text-sm font-semibold text-gray-300 break-all">
                                  {correo}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* ID de registro */}

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                              ID de registro
                            </span>

                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-black tracking-wider text-gray-300">
                              #{fmt(cert.id_certificacion)}
                            </span>
                          </div>
                        </div>

                        {/* Footer de verificación */}

                        <div className="relative border-t border-white/8 bg-white/[0.025] px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                              <FaCheck className="text-emerald-400 text-[9px]" />
                            </div>

                            <div>
                              <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-gray-300">
                                Documento verificado
                              </span>

                              <span className="block text-[8px] uppercase tracking-[0.12em] text-gray-600 mt-0.5">
                                MIS Academy
                              </span>
                            </div>
                          </div>

                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.55)] flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =======================
            Sin resultados
           ======================= */}

        {status === 'error' && data.length === 0 && (
          <div className="mt-16 sm:mt-20 text-center animate-fadeIn">
            <div className="relative max-w-xl mx-auto overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl px-6 sm:px-10 py-10 sm:py-12">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-24 bg-rose-500/5 blur-[60px] pointer-events-none" />

              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <FaSearch size={28} className="text-gray-600" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Sin resultados</h3>

              <p className="text-sm sm:text-base text-gray-500 font-medium">
                Verifica los datos e inténtalo nuevamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
