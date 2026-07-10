import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LearningRoadmapProps {
  lineName: string;
  routes: { id_ruta: number; nombre: string; descripcion?: string | null }[];
  lineSlug: string;
  lineaNombre?: string;
}

const getAccent = (nombre: string) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("ia") || n.includes("inteligencia")) return {
    iconBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    iconHover: "group-hover:bg-purple-500 group-hover:text-white",
    stepBorder: "border-purple-500",
    stepShadow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    stepText: "text-purple-400",
    lineGradient: "from-purple-500/60 via-indigo-500/20",
    hoverBorder: "hover:border-purple-500/50",
    hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)]",
    detailText: "text-purple-400",
  };
  if (n.includes("teacher") || n.includes("docente") || n.includes("educa")) return {
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    iconHover: "group-hover:bg-emerald-500 group-hover:text-white",
    stepBorder: "border-emerald-500",
    stepShadow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    stepText: "text-emerald-400",
    lineGradient: "from-emerald-500/60 via-teal-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]",
    detailText: "text-emerald-400",
  };
  if (n.includes("business") || n.includes("negocio") || n.includes("empresa")) return {
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    iconHover: "group-hover:bg-amber-500 group-hover:text-white",
    stepBorder: "border-amber-500",
    stepShadow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    stepText: "text-amber-400",
    lineGradient: "from-amber-500/60 via-orange-500/20",
    hoverBorder: "hover:border-amber-500/50",
    hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)]",
    detailText: "text-amber-400",
  };
  return {
    iconBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    iconHover: "group-hover:bg-sky-500 group-hover:text-white",
    stepBorder: "border-sky-500",
    stepShadow: "shadow-[0_0_20px_rgba(14,165,233,0.4)]",
    stepText: "text-sky-400",
    lineGradient: "from-sky-500/60 via-blue-500/20",
    hoverBorder: "hover:border-sky-500/50",
    hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.2)]",
    detailText: "text-sky-400",
  };
};

const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ lineName, routes, lineSlug, lineaNombre }) => {
  const navigate = useNavigate();
  const accent = getAccent(lineaNombre || lineName);

  const slugify = (s: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return (
    <div className="w-full py-20 px-4 md:px-10 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className={`p-3 rounded-2xl border mb-4 ${accent.iconBg}`}>
            <MapIcon className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Mapa de la Ruta de Aprendizaje
          </h2>
          <p className="text-slate-400 max-w-lg">
            Sigue este camino diseñado estratégicamente para dominar la especialidad de{" "}
            <span className="text-white font-semibold">{lineName}</span> paso a paso.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b ${accent.lineGradient} to-transparent -translate-x-1/2 hidden md:block`} />

          <div className="space-y-12 md:space-y-24">
            {routes.map((ruta, index) => {
              const isEven = index % 2 === 0;
              const routeSlug = slugify(ruta.nombre);

              return (
                <motion.div
                  key={ruta.id_ruta}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Step number badge */}
                  <div className={`absolute left-1/2 -translate-x-1/2 top-[-20px] md:top-1/2 md:-translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#03070c] border-2 ${accent.stepBorder} flex items-center justify-center ${accent.stepText} font-black text-lg ${accent.stepShadow}`}>
                    {index + 1}
                  </div>

                  {/* Content card */}
                  <div className={`w-full md:w-1/2 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <div
                      onClick={() => navigate(`/lineas-academicas/${lineSlug}/${routeSlug}`)}
                      className={`group p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 ${accent.hoverBorder} ${accent.hoverGlow} hover:bg-white/[0.06] transition-all duration-500 cursor-pointer backdrop-blur-xl relative overflow-hidden`}
                    >
                      <div className={`flex items-center gap-4 mb-4 ${isEven ? "md:flex-row-reverse" : "md:flex-row"}`}>
                        <div className={`p-3 rounded-xl border transition-all duration-500 ${accent.iconBg} ${accent.iconHover}`}>
                          <GraduationCap size={24} />
                        </div>
                        <h3 className={`text-xl md:text-2xl font-bold transition-colors ${accent.detailText.replace("text-", "group-hover:text-")}`}>
                          {ruta.nombre}
                        </h3>
                      </div>

                      <p className="text-slate-400 mb-6 line-clamp-2 group-hover:text-slate-300 transition-colors">
                        {ruta.descripcion || "Explora los fundamentos y técnicas avanzadas en esta ruta de especialización."}
                      </p>

                      <div className={`flex items-center gap-2 font-bold text-xs tracking-widest uppercase ${accent.detailText} ${isEven ? "md:flex-row-reverse" : "md:flex-row"}`}>
                        <span>Ver Detalles</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Empty side spacer */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningRoadmap;
