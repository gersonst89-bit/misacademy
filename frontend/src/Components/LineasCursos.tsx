import React, { useEffect, useState } from "react";
import { BookOpen, Code2, GraduationCap, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchLineas } from "../store/academicSlice";
import { motion } from "framer-motion";

const slugify = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

type LineaData = {
  id_linea: number;
  nombre: string;
  descripcion: string;
  slug?: string;
  estado: string;
};

// Mapa de estilos para las líneas según palabras clave en el nombre
const styleMap: Record<string, any> = {
  ia: {
    icon: <BookOpen className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform duration-300" />,
    borderColor: "border-green-500/30 hover:border-green-500/50",
    underlineColor: "bg-green-500",
    buttonBg: "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30",
  },
  dev: {
    icon: <Code2 className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform duration-300" />,
    borderColor: "border-orange-500/30 hover:border-orange-500/50",
    underlineColor: "bg-orange-500",
    buttonBg: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30",
  },
  desarrollo: {
    icon: <Code2 className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform duration-300" />,
    borderColor: "border-orange-500/30 hover:border-orange-500/50",
    underlineColor: "bg-orange-500",
    buttonBg: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30",
  },
  educacion: {
    icon: <GraduationCap className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform duration-300" />,
    borderColor: "border-amber-500/30 hover:border-amber-500/50",
    underlineColor: "bg-amber-500",
    buttonBg: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30",
  },
  teacher: {
    icon: <GraduationCap className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform duration-300" />,
    borderColor: "border-amber-500/30 hover:border-amber-500/50",
    underlineColor: "bg-amber-500",
    buttonBg: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30",
  },
  negocios: {
    icon: <TrendingUp className="w-8 h-8 text-rose-400 group-hover:scale-110 transition-transform duration-300" />,
    borderColor: "border-rose-500/30 hover:border-rose-500/50",
    underlineColor: "bg-rose-500",
    buttonBg: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30",
  },
  business: {
    icon: <TrendingUp className="w-8 h-8 text-rose-400 group-hover:scale-110 transition-transform duration-300" />,
    borderColor: "border-rose-500/30 hover:border-rose-500/50",
    underlineColor: "bg-rose-500",
    buttonBg: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30",
  }
};

const defaultStyle = {
  icon: <BookOpen className="w-8 h-8 text-sky-400 group-hover:scale-110 transition-transform duration-300" />,
  borderColor: "border-sky-500/30 hover:border-sky-500/50",
  underlineColor: "bg-sky-500",
  buttonBg: "bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const LineasCursos: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { lineas, loading } = useSelector((state: any) => state.academic);

  useEffect(() => {
    dispatch(fetchLineas());
  }, [dispatch]);

  const getStyle = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes("ia") || n.includes("inteligencia")) return styleMap.ia;
    if (n.includes("dev") || n.includes("desarrollo")) return styleMap.dev;
    if (n.includes("educacion") || n.includes("teacher")) return styleMap.educacion;
    if (n.includes("negocios") || n.includes("business")) return styleMap.negocios;
    return defaultStyle;
  };

  return (
    <section className="pt-24 pb-12 text-white relative overflow-hidden bg-[#03070c]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-blue-500/7 rounded-full blur-[130px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-sky-400/6 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[150px] bg-indigo-500/4 rounded-full blur-[80px] -z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-4 tracking-tight font-['Outfit'] uppercase"
          >
            Nuestras Líneas de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400">
              Cursos
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed"
          >
            Especializaciones diseñadas para impulsar tu carrera profesional en las áreas más demanandadas de la tecnología.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {lineas.map((linea: LineaData, index: number) => {
            const style = getStyle(linea.nombre);
            const currentSlug = slugify(linea.slug || linea.nombre);
            
            return (
              <motion.div variants={itemVariants} key={linea.id_linea || `linea-${index}`} className="group h-full">
                <div
                  className={[
                    "glass-card bg-gradient-to-b from-white/[0.03] to-white/[0.01] rounded-[2.25rem] p-10 border border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2",
                    "border-t-2",
                    style.borderColor,
                    "h-full flex flex-col items-center",
                  ].join(" ")}
                >
                  <div className="relative mb-8">
                    <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${style.underlineColor}`} />
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 relative z-10`}>
                      {style.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-center mb-1 group-hover:text-white transition-colors uppercase tracking-tight font-['Outfit']">
                    {linea.nombre}
                  </h3>

                  <div className="flex-1 flex flex-col mt-4">
                    <p className="text-slate-400 text-center leading-relaxed text-sm mb-8 font-light italic line-clamp-3">
                      "{linea.descripcion}"
                    </p>

                    <button
                      onClick={() => navigate(`/lineas-academicas/${currentSlug}`)}
                      className={[
                        "mt-auto w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 uppercase text-xs tracking-widest flex items-center justify-center gap-2",
                        style.buttonBg,
                      ].join(" ")}
                    >
                      Explorar Ruta <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default LineasCursos;
