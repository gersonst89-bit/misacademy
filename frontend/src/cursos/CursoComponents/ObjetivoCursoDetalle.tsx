import React from "react";
import { FaCheck, FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";

interface ObjetivoCursoDetalleProps {
  aprendizajes: string[];
  accent?: {
    text: string;
    badgeBg: string;
    borderGlow?: string;
  };
}

const ObjetivoCursoDetalle: React.FC<ObjetivoCursoDetalleProps> = ({
  aprendizajes,
  accent = {
    text: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20",
  },
}) => {
  // Filtrar elementos vacíos
  const itemsValidos = aprendizajes
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Si no hay aprendizajes registrados en el backend, mostramos una lista general para que nunca se vea vacío el curso
  const itemsAMostrar = itemsValidos.length > 0 ? itemsValidos : [
    "Dominar las habilidades técnicas fundamentales del temario",
    "Desarrollar proyectos prácticos guiados paso a paso",
    "Adquirir un certificado oficial de MIS Academy para tu currículum",
    "Acceder a recursos adicionales y material exclusivo del instructor"
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-[2rem] p-8 md:p-10 border-t-2 border-white/5"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${accent.badgeBg}`}>
          <FaLightbulb className={`${accent.text} text-2xl`} />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Lo que aprenderás en <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accent.text.replace("text-", "from-").replace("400", "300")} to-white`}>este curso</span>
        </h2>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {itemsAMostrar.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="flex items-start gap-4 group"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${accent.badgeBg} group-hover:scale-105 transition-transform`}>
              <FaCheck className={`${accent.text} text-[10px]`} />
            </div>
            <span className="text-slate-400 text-sm md:text-base leading-relaxed font-light group-hover:text-white transition-colors">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
};

export default ObjetivoCursoDetalle;
