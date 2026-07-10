import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Brain, Briefcase, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { apiUrl } from "../config/api";
import { apiClient } from "../services/apiClient";
import { useToast } from "../hooks/useToast";
import { usePageTitle } from "../hooks/usePageTitle";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-[#03070c]">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(14,165,233,0.3)]"></div>
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

// Color accent por línea académica
const getLineaAccent = (nombre: string) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("ia") || n.includes("inteligencia"))
    return {
      border: "hover:border-purple-500/50",
      glow: "hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.3)]",
      badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      dot: "bg-purple-400",
      arrow: "group-hover:bg-purple-500 group-hover:border-purple-400",
      title: "group-hover:text-purple-400",
      icon: <Brain size={14} />,
      label: "MIS IA",
      overlay: "bg-purple-500/20",
    };
  if (n.includes("teacher") || n.includes("docente") || n.includes("educa"))
    return {
      border: "hover:border-emerald-500/50",
      glow: "hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]",
      badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dot: "bg-emerald-400",
      arrow: "group-hover:bg-emerald-500 group-hover:border-emerald-400",
      title: "group-hover:text-emerald-400",
      icon: <GraduationCap size={14} />,
      label: "MIS TEACHER",
      overlay: "bg-emerald-500/20",
    };
  if (n.includes("business") || n.includes("negocio") || n.includes("empresa"))
    return {
      border: "hover:border-amber-500/50",
      glow: "hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]",
      badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      dot: "bg-amber-400",
      arrow: "group-hover:bg-amber-500 group-hover:border-amber-400",
      title: "group-hover:text-amber-400",
      icon: <Briefcase size={14} />,
      label: "MIS BUSINESS",
      overlay: "bg-amber-500/20",
    };
  if (n.includes("dev") || n.includes("desarrollo") || n.includes("program"))
    return {
      border: "hover:border-sky-500/50",
      glow: "hover:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.3)]",
      badge: "bg-sky-500/10 border-sky-500/20 text-sky-400",
      dot: "bg-sky-400",
      arrow: "group-hover:bg-sky-500 group-hover:border-sky-400",
      title: "group-hover:text-sky-400",
      icon: <Code2 size={14} />,
      label: "MIS DEV",
      overlay: "bg-sky-500/20",
    };
  return {
    border: "hover:border-sky-500/50",
    glow: "hover:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.3)]",
    badge: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    dot: "bg-sky-400",
    arrow: "group-hover:bg-sky-500 group-hover:border-sky-400",
    title: "group-hover:text-sky-400",
    icon: <GraduationCap size={14} />,
    label: "Especialización",
    overlay: "bg-sky-500/20",
  };
};

const getLineaDefaultImage = (nombre: string) => {
  const nameLower = (nombre || "").toLowerCase();
  if (nameLower.includes("ia") || nameLower.includes("inteligencia"))
    return "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600";
  if (nameLower.includes("teacher") || nameLower.includes("docente") || nameLower.includes("educa"))
    return "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600";
  if (nameLower.includes("business") || nameLower.includes("negocio") || nameLower.includes("empresa"))
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600";
  if (nameLower.includes("dev") || nameLower.includes("desarrollo") || nameLower.includes("program"))
    return "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600";
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600";
};

const slugify = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const LineasListPage = () => {
  const { showToast } = useToast();
  usePageTitle("Líneas Académicas");
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const response = await apiClient.get("/lineas-academicas");
        const data = response.data;
        const publicadas = (data.data || []).filter(
          (linea: LineaAcademica) => linea.estado === "Publicado"
        );
        setLineas(publicadas);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las líneas académicas.");
        showToast("No se pudieron cargar las líneas académicas. Inténtalo de nuevo.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLineas();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#03070c] text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-hidden bg-[#03070c]">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-600/8 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[200px] bg-blue-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-sky-500/5 border border-sky-500/20 text-[11px] font-black uppercase tracking-widest text-sky-400 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Especializaciones
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-black font-['Outfit'] uppercase tracking-tighter leading-[1.1] drop-shadow-2xl"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-400">
              Líneas Académicas
            </span>
            <br />
            <span className="text-white/30">MIS Academy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl font-medium leading-relaxed"
          >
            Explora nuestras áreas de especialización en tecnología e innovación. Aprende, domina y transforma tu futuro digital.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            href="#lineas"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] hover:shadow-[0_0_60px_-10px_rgba(14,165,233,0.6)]"
          >
            Explorar Rutas
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </section>

      {/* Grid de Líneas */}
      <section id="lineas" className="relative z-10 max-w-[1400px] mx-auto px-6 pb-20">
        {/* Glows de fondo del grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/6 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-purple-500/6 rounded-full blur-[130px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {lineas.length > 0 ? (
            lineas.map((linea, index) => {
              const accent = getLineaAccent(linea.nombre);
              return (
                <motion.div
                  key={linea.id_linea || `list-linea-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 15 }}
                >
                  <Link
                    to={`/lineas-academicas/${slugify(linea.slug || linea.nombre)}`}
                    className={`group relative flex flex-col bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 rounded-[2.5rem] p-3 transition-all duration-500 ${accent.border} ${accent.glow}`}
                  >
                    {/* Badge de especialidad */}
                    <div className={`absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${accent.badge}`}>
                      {accent.icon}
                      {accent.label}
                    </div>

                    <div className="relative h-60 w-full rounded-[2rem] overflow-hidden bg-black/50 mb-6">
                      <div className={`absolute inset-0 ${accent.overlay} mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500`} />
                      <img
                        src={(() => {
                          if (!linea.imagen || linea.imagen.includes("ejemplo2.jpg") || linea.imagen.includes("ejemplo3.jpg")) {
                            return getLineaDefaultImage(linea.nombre);
                          }
                          if (linea.imagen.startsWith("http")) return linea.imagen;
                          return `${apiUrl("/").replace(/\/$/, "")}/${linea.imagen.replace(/^\/?/, "")}`;
                        })()}
                        alt={linea.nombre}
                        onError={(e) => { (e.target as HTMLImageElement).src = getLineaDefaultImage(linea.nombre); }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#03070c] via-transparent to-transparent z-10" />
                    </div>

                    <div className="px-5 pb-5 flex-1 flex flex-col">
                      <h2 className={`text-xl md:text-2xl font-black font-['Outfit'] uppercase tracking-tight text-white mb-3 transition-colors ${accent.title}`}>
                        {linea.nombre}
                      </h2>
                      <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1 line-clamp-3 group-hover:text-slate-300 transition-colors">
                        {linea.descripcion}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                          Ver detalle
                        </span>
                        <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 shadow-lg ${accent.arrow}`}>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
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

      {/* CTA Final */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-sky-500/6 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-6"
          >
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400">¿Listo para empezar?</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Elige tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400">
              especialización
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg mb-10 font-medium"
          >
            Más de 40 cursos especializados te esperan. Comienza hoy y transforma tu carrera.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/cursos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-[0_0_30px_-10px_rgba(14,165,233,0.5)]"
            >
              Ver todos los cursos
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Crear cuenta gratis
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LineasListPage;
