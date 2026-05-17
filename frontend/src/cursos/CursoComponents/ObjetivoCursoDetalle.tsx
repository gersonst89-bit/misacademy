import React from "react";
import { FaCheck, FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";

interface ObjetivoCursoDetalleProps {
  aprendizajes: string[];
}

const ObjetivoCursoDetalle: React.FC<ObjetivoCursoDetalleProps> = ({
  aprendizajes,
}) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-[2rem] p-8 md:p-10 border-t-2 border-white/10"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
          <FaLightbulb className="text-amber-400 text-2xl" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Lo que aprenderás en <span className="text-gradient-sky">este curso</span>
        </h2>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {aprendizajes.map((item, i) => (
          <motion.li 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="flex items-start gap-4 group"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <FaCheck className="text-sky-400 text-[10px] group-hover:text-white transition-colors" />
            </div>
            <span className="text-slate-400 text-sm md:text-base leading-relaxed font-light group-hover:text-white transition-colors">
              {item.trim()}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
};

export default ObjetivoCursoDetalle;
