import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Brain, Briefcase, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiUrl } from '../config/api';
import { apiClient } from '../services/apiClient';
import { useToast } from '../hooks/useToast';
import { usePageTitle } from '../hooks/usePageTitle';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-[#03070c]">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full" />
      <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(14,165,233,0.3)]" />
    </div>
  </div>
);

interface LineaAcademica {
  id_linea: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  estado: string;
  slug?: string;
}

// ============================================================
// Accent por línea académica
// ============================================================
const getLineaAccent = (nombre: string) => {
  const n = (nombre || '').toLowerCase();

  if (n.includes('ia') || n.includes('inteligencia')) {
    return {
      border: 'hover:border-purple-500/50',
      glow: 'hover:shadow-[0_24px_70px_-20px_rgba(168,85,247,0.32)]',
      badge: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
      dot: 'bg-purple-400',
      arrow: 'group-hover:bg-purple-500 group-hover:border-purple-400',
      title: 'group-hover:text-purple-300',
      icon: <Brain size={13} />,
      label: 'MIS IA',
      overlay: 'bg-purple-500/20',
      patternBg: 'from-purple-500/20 via-purple-500/5 to-[#0c0a14]',
      patternStroke: 'rgba(168,85,247,0.35)',
    };
  }

  if (n.includes('teacher') || n.includes('docente') || n.includes('educa')) {
    return {
      border: 'hover:border-emerald-500/50',
      glow: 'hover:shadow-[0_24px_70px_-20px_rgba(16,185,129,0.28)]',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      dot: 'bg-emerald-400',
      arrow: 'group-hover:bg-emerald-500 group-hover:border-emerald-400',
      title: 'group-hover:text-emerald-300',
      icon: <GraduationCap size={13} />,
      label: 'MIS TEACHER',
      overlay: 'bg-emerald-500/20',
      patternBg: 'from-emerald-500/20 via-emerald-500/5 to-[#081410]',
      patternStroke: 'rgba(16,185,129,0.35)',
    };
  }

  if (n.includes('business') || n.includes('negocio') || n.includes('empresa')) {
    return {
      border: 'hover:border-amber-500/50',
      glow: 'hover:shadow-[0_24px_70px_-20px_rgba(245,158,11,0.28)]',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      dot: 'bg-amber-400',
      arrow: 'group-hover:bg-amber-500 group-hover:border-amber-400',
      title: 'group-hover:text-amber-300',
      icon: <Briefcase size={13} />,
      label: 'MIS BUSINESS',
      overlay: 'bg-amber-500/20',
      patternBg: 'from-amber-500/20 via-amber-500/5 to-[#14100a]',
      patternStroke: 'rgba(245,158,11,0.35)',
    };
  }

  if (n.includes('dev') || n.includes('desarrollo') || n.includes('program')) {
    return {
      border: 'hover:border-sky-500/50',
      glow: 'hover:shadow-[0_24px_70px_-20px_rgba(14,165,233,0.32)]',
      badge: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
      dot: 'bg-sky-400',
      arrow: 'group-hover:bg-sky-500 group-hover:border-sky-400',
      title: 'group-hover:text-sky-300',
      icon: <Code2 size={13} />,
      label: 'MIS DEV',
      overlay: 'bg-sky-500/20',
      patternBg: 'from-sky-500/20 via-sky-500/5 to-[#061118]',
      patternStroke: 'rgba(14,165,233,0.35)',
    };
  }

  return {
    border: 'hover:border-sky-500/50',
    glow: 'hover:shadow-[0_24px_70px_-20px_rgba(14,165,233,0.3)]',
    badge: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
    dot: 'bg-sky-400',
    arrow: 'group-hover:bg-sky-500 group-hover:border-sky-400',
    title: 'group-hover:text-sky-300',
    icon: <GraduationCap size={13} />,
    label: 'Especialización',
    overlay: 'bg-sky-500/20',
    patternBg: 'from-sky-500/20 via-sky-500/5 to-[#061118]',
    patternStroke: 'rgba(14,165,233,0.35)',
  };
};

// ============================================================
// Patrón visual fallback
// ============================================================
const getLineaPattern = (nombre: string, stroke: string) => {
  const n = (nombre || '').toLowerCase();

  // IA
  if (n.includes('ia') || n.includes('inteligencia')) {
    return (
      <svg viewBox="0 0 300 160" className="absolute right-0 bottom-0 w-56 h-40 opacity-70">
        <circle cx="230" cy="140" r="90" fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx="230" cy="140" r="60" fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx="230" cy="140" r="30" fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx="230" cy="140" r="3" fill={stroke} />
      </svg>
    );
  }

  // Teacher
  if (n.includes('teacher') || n.includes('docente') || n.includes('educa')) {
    return (
      <svg viewBox="0 0 300 160" className="absolute right-0 bottom-0 w-56 h-40 opacity-70">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="150"
            y1={40 + i * 22}
            x2="290"
            y2={40 + i * 22}
            stroke={stroke}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    );
  }

  // Business
  if (n.includes('business') || n.includes('negocio') || n.includes('empresa')) {
    return (
      <svg viewBox="0 0 300 160" className="absolute right-0 bottom-0 w-56 h-40 opacity-70">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={175 + i * 30}
            y={120 - (i + 1) * 18}
            width="16"
            height={(i + 1) * 18}
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    );
  }

  // Dev / default
  return (
    <svg viewBox="0 0 300 160" className="absolute right-0 bottom-0 w-56 h-40 opacity-70">
      {[
        [170, 60],
        [205, 90],
        [240, 60],
        [205, 30],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="26"
          height="26"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
};

// ============================================================
// Media de la card
// ============================================================
const CardMedia = ({
  linea,
  accent,
}: {
  linea: LineaAcademica;
  accent: ReturnType<typeof getLineaAccent>;
}) => {
  const [imgError, setImgError] = useState(false);

  const hasImage =
    !!linea.imagen &&
    !linea.imagen.includes('ejemplo2.jpg') &&
    !linea.imagen.includes('ejemplo3.jpg');

  const imageSrc = hasImage
    ? linea.imagen.startsWith('http')
      ? linea.imagen
      : `${apiUrl('/').replace(/\/$/, '')}/${linea.imagen.replace(/^\/?/, '')}`
    : null;

  const showPattern = !imageSrc || imgError;

  return (
    <div
      className={`relative h-36 sm:h-40 w-full overflow-hidden bg-gradient-to-br ${accent.patternBg}`}
    >
      {/* Badge */}
      <div
        className={`absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] backdrop-blur-md ${accent.badge}`}
      >
        {accent.icon}
        {accent.label}
      </div>

      {showPattern ? (
        getLineaPattern(linea.nombre, accent.patternStroke)
      ) : (
        <img
          src={imageSrc as string}
          alt={linea.nombre}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#03070c] via-[#03070c]/5 to-transparent z-10" />

      {/* Subtle highlight */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-transparent to-transparent z-10" />
    </div>
  );
};

// ============================================================
// Slug
// ============================================================
const slugify = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

// ============================================================
// Página
// ============================================================
const LineasListPage = () => {
  const { showToast } = useToast();

  usePageTitle('Líneas Académicas');

  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // Carga de líneas
  // ==========================================================
  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const response = await apiClient.get('/lineas-academicas');

        const data = response.data;

        const publicadas = (data.data || []).filter(
          (linea: LineaAcademica) => linea.estado === 'Publicado',
        );

        setLineas(publicadas);
      } catch (err) {
        console.error(err);

        setError('Error al cargar las líneas académicas.');

        showToast('No se pudieron cargar las líneas académicas. Inténtalo de nuevo.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLineas();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#03070c] text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-hidden bg-[#03070c]">
      {/* ======================================================
          HERO — título con blanco + degradado solo en "ACADÉMICAS"
          ====================================================== */}
      <section className="relative px-6 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Main title — Opción 2: blanco + degradado solo en Académicas */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="px-2 font-['Outfit'] font-black uppercase tracking-[0.06em] leading-[0.98] text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-white">LÍNEAS </span>
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #38bdf8' }}>
              ACADÉMICAS
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/50 font-medium leading-relaxed"
          >
            Explora nuestras áreas de especialización en tecnología e innovación. Aprende, domina y
            transforma tu futuro digital.
          </motion.p>

          {/* CTA — botón mejorado */}
          <motion.a
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.6 }}
            href="#lineas"
            className="mt-6 group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl border border-sky-500/50 bg-sky-500/10 text-white font-bold uppercase tracking-[0.16em] text-xs sm:text-sm transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20 hover:border-sky-400 hover:shadow-[0_0_40px_rgba(14,165,233,0.25)]"
          >
            <span>Explorar rutas</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12" />
          </motion.a>
        </div>
      </section>

      {/* ======================================================
          GRID — sin cambios
          ====================================================== */}
      <section
        id="lineas"
        className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-6 pb-16 sm:pb-20"
      >
        {/* Section header */}
        <div className="flex items-center gap-4 mb-4 sm:mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
            Áreas de especialización
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
          {lineas.length > 0 ? (
            lineas.map((linea, index) => {
              const accent = getLineaAccent(linea.nombre);

              return (
                <motion.div
                  key={linea.id_linea || `list-linea-${index}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    delay: Math.min(index * 0.08, 0.24),
                    type: 'spring',
                    stiffness: 100,
                    damping: 16,
                  }}
                  className="h-full"
                >
                  <Link
                    to={`/lineas-academicas/${slugify(linea.slug || linea.nombre)}`}
                    className={`group relative flex flex-col h-full min-h-[420px] bg-gradient-to-b from-white/[0.035] to-white/[0.012] border border-white/10 rounded-[1.75rem] overflow-hidden transition-all duration-500 ${accent.border} ${accent.glow}`}
                  >
                    {/* Media */}
                    <CardMedia linea={linea} accent={accent} />

                    {/* Main content */}
                    <div className="flex flex-col flex-1 px-5 sm:px-6 pt-5 pb-5">
                      {/* Accent line */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`w-7 h-px ${accent.dot} transition-all duration-500 group-hover:w-11`}
                        />
                        <span className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                          Especialización
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className={`text-xl sm:text-2xl font-black font-['Outfit'] uppercase tracking-[-0.025em] text-white transition-colors duration-300 ${accent.title}`}
                      >
                        {linea.nombre}
                      </h2>

                      {/* Description */}
                      <p className="mt-3 text-sm text-slate-400 leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors">
                        {linea.descripcion}
                      </p>

                      {/* Action */}
                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-white/45 group-hover:text-white transition-colors">
                          Explorar línea
                        </span>
                        <div
                          className={`w-10 h-10 rounded-xl bg-white/[0.035] border border-white/10 flex items-center justify-center transition-all duration-500 shadow-lg ${accent.arrow}`}
                        >
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Hover sheen */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.025] via-transparent to-transparent" />
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-white/40 font-bold uppercase tracking-widest text-sm col-span-full py-20">
              No hay líneas académicas disponibles.
            </p>
          )}
        </div>
      </section>

      {/* ======================================================
          CTA FINAL — sin cambios
          ====================================================== */}
      <section className="relative overflow-hidden px-6 pt-10 pb-24 sm:pt-14 sm:pb-28">
        {/* Glow central */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[300px] bg-sky-500/7 rounded-full blur-[130px] pointer-events-none" />

        {/* Lines */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-[900px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/[0.04] border border-sky-500/15 mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
              ¿Listo para empezar?
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-['Outfit'] text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[-0.045em] leading-[0.95] text-white"
          >
            Elige tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
              especialización
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-5 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed"
          >
            Más de 40 cursos especializados te esperan. Comienza hoy y transforma tu carrera.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center"
          >
            <Link
              to="/cursos"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white font-black uppercase tracking-[0.16em] text-[10px] sm:text-xs shadow-[0_14px_40px_-14px_rgba(14,165,233,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-14px_rgba(14,165,233,0.7)]"
            >
              Ver todos los cursos
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 border border-white/10">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            <Link
              to="/registro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.025] border border-white/10 text-white font-black uppercase tracking-[0.16em] text-[10px] sm:text-xs transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
            >
              Crear cuenta gratis
            </Link>
          </motion.div>
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[70%] max-w-[720px] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </section>
    </div>
  );
};

export default LineasListPage;
