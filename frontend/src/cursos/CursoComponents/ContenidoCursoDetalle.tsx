import React, { useState } from 'react';
import { FaList, FaChevronDown } from 'react-icons/fa';
import { MdOutlineSlowMotionVideo } from 'react-icons/md';
import { ImFileText2 } from 'react-icons/im';
import type { Modulo, Leccion, Material } from '../../types/models';
import { motion, AnimatePresence } from 'framer-motion';

interface ContenidoCursoDetalleProps {
  modulos: Modulo[];
  lecciones: Leccion[];
  materiales: Material[];
  isPurchased: boolean;
  cursoIdSlug: string;
  accent?: any;
}

const ContenidoCursoDetalle: React.FC<ContenidoCursoDetalleProps> = ({
  modulos,
  lecciones,
  materiales,
  isPurchased,
  cursoIdSlug,
  accent = {
    text: 'text-sky-400',
    barBg: 'bg-sky-500',
    hoverBorder: 'hover:border-sky-500/30',
    hoverTitle: 'group-hover:text-sky-400',
    badgeBg: 'bg-sky-500/10 border-sky-500/20',
    iconBg: 'group-open:bg-sky-500 group-open:border-sky-400',
    chevronBg: 'group-hover:bg-sky-500/10',
    textGrad: 'text-gradient-sky',
  },
}) => {
  const [activeModuloId, setActiveModuloId] = useState<number | null>(null);

  const navigate = (url: string) => {
    if (isPurchased) {
      window.location.href = url;
    }
  };

  const modulosSafe = Array.isArray(modulos) ? modulos : [];

  const leccionesSafe = Array.isArray(lecciones) ? lecciones : [];

  const materialesSafe = Array.isArray(materiales) ? materiales : [];

  const modulosOrdenados = [...modulosSafe].sort((a, b) => a.orden - b.orden);

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds || seconds <= 0) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleModulo = (id: number) => {
    setActiveModuloId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-7"
      >
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-[0_0_20px_rgba(255,255,255,0.02)] ${accent.badgeBg}`}
        >
          <FaList className={`${accent.text} text-lg`} />
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Programa del{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accent.textGrad}`}>
              {modulos.length > 0 ? 'Curso' : 'Estudio'}
            </span>
          </h2>

          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Currículum estructurado por expertos
          </p>
        </div>
      </motion.div>

      <div className="grid gap-3.5">
        {modulosOrdenados.map((modulo, idx) => {
          const leccionesDelModulo = leccionesSafe
            .filter((l) => l.id_modulo === modulo.id_modulo)
            .sort((a, b) => a.orden - b.orden);

          const materialesDelModulo = materialesSafe.filter(
            (m) => m.id_modulo === modulo.id_modulo,
          );

          const isOpen = activeModuloId === modulo.id_modulo;

          return (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                delay: idx * 0.05,
              }}
              key={modulo.id_modulo}
              className={`glass-card rounded-[1.75rem] overflow-hidden group border transition-all duration-500 ${
                isOpen
                  ? accent.hoverBorder.replace('hover:', '')
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Accordion Trigger */}
              <div
                onClick={() => toggleModulo(modulo.id_modulo)}
                className="cursor-pointer font-bold text-white bg-white/0 hover:bg-white/5 transition-all px-5 py-5 sm:px-6 sm:py-5 flex items-center select-none"
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center mr-4 transition-all duration-300 ${
                    isOpen
                      ? `${accent.barBg} border-transparent text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-black">{modulo.orden}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-lg sm:text-xl tracking-tight font-bold transition-colors ${
                      isOpen ? accent.text : 'group-hover:text-white'
                    }`}
                  >
                    {modulo.titulo}
                  </span>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                      {leccionesDelModulo.length} lecciones
                    </span>

                    <div className="w-1 h-1 rounded-full bg-slate-700" />

                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                      {materialesDelModulo.length} recursos
                    </span>
                  </div>
                </div>

                <div
                  className={`ml-3 w-9 h-9 rounded-full flex items-center justify-center bg-white/5 transition-colors group-hover:bg-white/10 shrink-0`}
                >
                  <FaChevronDown
                    className={`${accent.text} transition-transform duration-500 text-xs ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-4" />

                      <ul className="grid gap-1.5">
                        {leccionesDelModulo.map((leccion) => (
                          <li
                            key={`leccion-${leccion.id_leccion}`}
                            onClick={() =>
                              navigate(`/video-page/${cursoIdSlug}?leccion=${leccion.id_leccion}`)
                            }
                            className={`flex items-center justify-between p-3 rounded-xl border border-transparent transition-all group/item ${
                              isPurchased
                                ? `cursor-pointer hover:bg-white/5 hover:border-white/10 shadow-sm`
                                : 'opacity-70 grayscale select-none'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-white/20 transition-all shrink-0">
                                <MdOutlineSlowMotionVideo className="text-slate-500 group-hover/item:text-white text-lg transition-colors" />
                              </div>

                              <div className="min-w-0">
                                <span className="block text-sm sm:text-base font-bold text-slate-300 group-hover/item:text-white transition-colors truncate">
                                  {leccion.titulo}
                                </span>

                                <span className="block text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                                  Clase en Video
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-black font-mono ${accent.text} ${accent.badgeBg} px-2.5 py-1.5 rounded-lg border shadow-[0_0_15px_rgba(255,255,255,0.01)] shrink-0 ml-3`}
                            >
                              {formatDuration(leccion.duracion)}
                            </span>
                          </li>
                        ))}

                        {materialesDelModulo.map((material) => (
                          <li
                            key={`material-${material.id_material}`}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group/item"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-white/20 transition-all shrink-0">
                                <ImFileText2 className="text-slate-500 group-hover/item:text-white text-lg transition-colors" />
                              </div>

                              <div className="min-w-0">
                                <span className="block text-sm sm:text-base font-bold text-slate-300 group-hover/item:text-white transition-colors truncate">
                                  {material.nombre || material.titulo}
                                </span>

                                <span className="block text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                                  Recurso Adicional
                                </span>
                              </div>
                            </div>

                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 border border-white/5 px-2.5 py-1.5 rounded-lg shrink-0 ml-3">
                              Material
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ContenidoCursoDetalle;
