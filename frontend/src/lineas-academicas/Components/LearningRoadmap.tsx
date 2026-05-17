import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, GraduationCap, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LearningRoadmapProps {
  lineName: string;
  routes: { id_ruta: number; nombre: string; descripcion?: string | null }[];
  lineSlug: string;
}

const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ lineName, routes, lineSlug }) => {
  const navigate = useNavigate();

  const slugify = (s: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return (
    <div className="w-full py-16 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4">
            <MapIcon className="w-6 h-6 text-sky-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Mapa de la Ruta de Aprendizaje
          </h2>
          <p className="text-slate-400 max-w-lg">
            Sigue este camino diseñado estratégicamente para dominar la especialidad de {lineName} paso a paso.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line connector */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-sky-500/50 via-blue-500/20 to-transparent -translate-x-1/2 hidden md:block" />

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
                  {/* Step Number Badge */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[-20px] md:top-1/2 md:-translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#0E1C2B] border-2 border-sky-500 flex items-center justify-center text-sky-400 font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    {index + 1}
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <div 
                      onClick={() => navigate(`/lineas-academicas/${lineSlug}/${routeSlug}`)}
                      className="group p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-sky-500/50 hover:bg-white/10 transition-all duration-500 cursor-pointer backdrop-blur-xl shadow-2xl relative overflow-hidden"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className={`flex items-center gap-4 mb-4 ${isEven ? "md:flex-row-reverse" : "md:flex-row"}`}>
                        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
                          <GraduationCap size={24} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold group-hover:text-sky-400 transition-colors">
                          {ruta.nombre}
                        </h3>
                      </div>

                      <p className="text-slate-400 mb-6 line-clamp-2">
                        {ruta.descripcion || "Explora los fundamentos y técnicas avanzadas en esta ruta de especialización."}
                      </p>

                      <div className={`flex items-center gap-2 font-bold text-xs tracking-widest uppercase text-sky-500 ${isEven ? "md:flex-row-reverse" : "md:flex-row"}`}>
                        <span>Ver Detalles</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Empty space for the other side */}
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
