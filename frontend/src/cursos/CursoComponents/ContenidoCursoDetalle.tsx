import React, { useState } from "react";
import { FaList, FaChevronDown } from "react-icons/fa";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { ImFileText2 } from "react-icons/im";
import type { Modulo, Leccion, Material } from "../../types/models";
import { motion, AnimatePresence } from "framer-motion";

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
    text: "text-sky-400",
    barBg: "bg-sky-500",
    hoverBorder: "hover:border-sky-500/30",
    hoverTitle: "group-hover:text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20",
    iconBg: "group-open:bg-sky-500 group-open:border-sky-400",
    chevronBg: "group-hover:bg-sky-500/10",
    textGrad: "text-gradient-sky",
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
    if (!seconds || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleModulo = (id: number) => {
    setActiveModuloId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-10"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-[0_0_20px_rgba(255,255,255,0.02)] ${accent.badgeBg}`}>
          <FaList className={`${accent.text} text-xl`} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            Programa del <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accent.textGrad}`}>{modulos.length > 0 ? "Curso" : "Estudio"}</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Currículum estructurado por expertos</p>
        </div>
      </motion.div>

      <div className="grid gap-5">
        {modulosOrdenados.map((modulo, idx) => {
          const leccionesDelModulo = leccionesSafe
            .filter((l) => l.id_modulo === modulo.id_modulo)
            .sort((a, b) => a.orden - b.orden);

          const materialesDelModulo = materialesSafe.filter(
            (m) => m.id_modulo === modulo.id_modulo
          );

          const isOpen = activeModuloId === modulo.id_modulo;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              key={modulo.id_modulo}
              className={`glass-card rounded-[2rem] overflow-hidden group border transition-all duration-500 ${
                isOpen ? accent.hoverBorder.replace("hover:", "") : "border-white/5 hover:border-white/10"
              }`}
            >
              {/* Accordion Trigger (Summary block) */}
              <div
                onClick={() => toggleModulo(modulo.id_modulo)}
                className="cursor-pointer font-bold text-white bg-white/0 hover:bg-white/5 transition-all p-7 flex items-center select-none"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center mr-6 transition-all duration-300 ${
                    isOpen
                      ? `${accent.barBg} border-transparent text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}
                >
                  <span className="text-sm font-black">{modulo.orden}</span>
                </div>
                <div className="flex-1">
                  <span className={`block text-xl tracking-tight font-bold transition-colors ${isOpen ? accent.text : "group-hover:text-white"}`}>
                    {modulo.titulo}
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                      {leccionesDelModulo.length} lecciones
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                      {materialesDelModulo.length} recursos
                    </span>
                  </div>
                </div>
                <div className={`ml-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 transition-colors group-hover:bg-white/10`}>
                  <FaChevronDown className={`${accent.text} transition-transform duration-500 text-sm ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Accordion Content (Smooth Animated height wrapper) */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 pt-2">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />
                      <ul className="grid gap-2">
                        {leccionesDelModulo.map((leccion) => (
                          <li
                            key={`leccion-${leccion.id_leccion}`}
                            onClick={() => navigate(`/video-page/${cursoIdSlug}?leccion=${leccion.id_leccion}`)}
                            className={`flex items-center justify-between p-4 rounded-2xl border border-transparent transition-all group/item ${
                              isPurchased
                                ? `cursor-pointer hover:bg-white/5 hover:border-white/10 shadow-sm`
                                : "opacity-70 grayscale select-none"
                            }`}
                          >
                            <div className="flex items-center gap-5">
                              <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-white/20 transition-all`}>
                                <MdOutlineSlowMotionVideo className="text-slate-500 group-hover/item:text-white text-xl transition-colors" />
                              </div>
                              <div>
                                <span className="text-base font-bold text-slate-300 group-hover/item:text-white transition-colors">
                                  {leccion.titulo}
                                </span>
                                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Clase en Video</span>
                              </div>
                            </div>
                            <span className={`text-[11px] font-black font-mono ${accent.text} ${accent.badgeBg} px-3 py-1.5 rounded-xl border shadow-[0_0_15px_rgba(255,255,255,0.01)]`}>
                              {formatDuration(leccion.duracion)}
                            </span>
                          </li>
                        ))}

                        {materialesDelModulo.map((material) => (
                          <li
                            key={`material-${material.id_material}`}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group/item"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-white/20 transition-all">
                                <ImFileText2 className="text-slate-500 group-hover/item:text-white text-xl transition-colors" />
                              </div>
                              <div>
                                <span className="text-base font-bold text-slate-300 group-hover/item:text-white transition-colors">
                                  {material.nombre || material.titulo}
                                </span>
                                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Recurso Adicional</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 border border-white/5 px-3 py-1.5 rounded-xl">
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
