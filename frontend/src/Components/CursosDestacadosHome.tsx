import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { apiClient } from "../services/apiClient";
import { motion } from "framer-motion";

interface Curso {
  id_curso: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string | null;
  nivel: string;
  toggle_destacado?: number | boolean | string;
  destacado: number | boolean | string;
}

const createSlug = (title: string): string =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const nivelBadgeStyles = (nivel: string) => {
  switch (nivel?.toLowerCase()) {
    case "básico":
    case "basico":
      return "border-emerald-500/20 text-emerald-400 bg-emerald-950/30";
    case "intermedio":
      return "border-amber-500/20 text-amber-400 bg-amber-950/30";
    case "avanzado":
    case "experto":
      return "border-rose-500/20 text-rose-400 bg-rose-950/30";
    default:
      return "border-sky-500/20 text-sky-400 bg-sky-950/30";
  }
};

const cardHoverStyles = (nivel: string) => {
  switch (nivel?.toLowerCase()) {
    case "básico":
    case "basico":
      return "hover:border-emerald-500/30 hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)]";
    case "intermedio":
      return "hover:border-amber-500/30 hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.25)]";
    case "avanzado":
    case "experto":
      return "hover:border-rose-500/30 hover:shadow-[0_20px_50px_-12px_rgba(244,63,94,0.25)]";
    default:
      return "hover:border-sky-500/30 hover:shadow-[0_20px_50px_-12px_rgba(14,165,233,0.25)]";
  }
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
      damping: 15 
    } 
  },
};

export default function CursosDestacadosHome() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/cursos/destacados?limit=8");
        const data = res.data;
        setCursos(data.data || data || []);
      } catch (err) {
        console.error("Error cargando cursos destacados:", err);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-6 lg:px-8 bg-[#03070c] relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-sky-500/7 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-600/6 rounded-full blur-[120px]" />
        </div>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (cursos.length === 0) {
    return (
      <section className="py-24 px-6 lg:px-8 bg-[#03070c] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-sky-500/7 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-600/6 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black font-['Outfit'] uppercase tracking-tighter text-white mb-4">
            Nuestros Cursos Más Populares
          </h2>
          <p className="text-gray-400 mt-8">Pronto tendremos cursos disponibles para ti.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="cursos" className="py-24 px-6 lg:px-8 bg-[#03070c] relative overflow-hidden">
      {/* Background Glow Orbs for Depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-blue-600/7 rounded-full blur-[150px] -z-10" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-sky-500/10 border border-sky-500/30 rounded-lg flex items-center justify-center">
              <Sparkles size={12} className="text-sky-400" />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-sky-400 uppercase">Prestigio Académico</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black font-['Outfit'] uppercase tracking-tighter leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-white to-blue-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            Nuestros Cursos Más Populares
          </h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Descubre los programas y cursos de especialización con mayor demanda tecnológica, diseñados para impulsar tu perfil profesional hacia el siguiente nivel.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {cursos.map((curso) => (
            <motion.div
              variants={itemVariants}
              key={curso.id_curso}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`flex flex-col text-white bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 rounded-[2.25rem] overflow-hidden backdrop-blur-xl shadow-2xl transition-colors transition-shadow duration-300 group ${cardHoverStyles(curso.nivel)}`}
            >
              <Link to={`/curso/${createSlug(curso.nombre)}`} className="block">
                {/* Floating Image Style */}
                <div className="relative overflow-hidden h-48 m-3 rounded-[1.5rem] bg-slate-950 border border-white/5">
                  <img
                    src={curso.imagen || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"}
                    alt={curso.nombre}
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"; }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                  {/* Shine Sweep Overlay */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-20 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out pointer-events-none" />

                  {/* Glassmorphic Level Badge */}
                  {curso.nivel && (
                    <span
                      className={`absolute top-3.5 left-3.5 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md transition-colors duration-300 ${nivelBadgeStyles(
                        curso.nivel
                      )}`}
                    >
                      {curso.nivel}
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-6 pt-2 flex flex-col flex-1">
                <Link to={`/curso/${createSlug(curso.nombre)}`}>
                  <h3 className="text-base font-extrabold font-['Outfit'] tracking-tight mb-2 text-left leading-snug text-white group-hover:text-sky-400 transition-colors duration-300 line-clamp-2">
                    {curso.nombre}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 mb-6 text-left flex-1 line-clamp-2 leading-relaxed">
                  {curso.descripcion}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Inversión</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-white/50">S/</span>
                      <span className="text-xl font-black font-['Outfit'] text-white">
                        {Number(curso.precio || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/curso/${createSlug(curso.nombre)}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-sky-400 hover:text-white hover:bg-sky-500 hover:border-sky-400 transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
                    title="Ver Detalles del Curso"
                  >
                    <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-14">
          <Link
            to="/cursos"
            className="relative inline-flex items-center gap-3 px-8 py-4.5 bg-sky-500 hover:bg-sky-600 text-white font-black uppercase tracking-wider text-[11px] rounded-2xl shadow-[0_4px_20px_rgba(14,165,233,0.2)] hover:shadow-[0_8px_30px_rgba(14,165,233,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <span>Ver todos los cursos</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}

