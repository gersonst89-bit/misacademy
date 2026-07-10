import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LineaAcademica, RutaAcademica } from "../types/models";
import { BookOpen, Route as RouteIcon, ArrowRight } from "lucide-react";
import LineasAcademicasGrid from "./Components/LineasAcademicasGrid";
import LearningRoadmap from "./Components/LearningRoadmap";
import { apiUrl } from "../config/api";
import { apiClient } from "../services/apiClient";
import { usePageTitle } from "../hooks/usePageTitle";

// Loader
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-[#03070c]">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(14,165,233,0.3)]"></div>
    </div>
  </div>
);

const ErrorMessage = () => (
  <div className="flex justify-center items-center h-screen bg-[#03070c]">
    <p className="text-red-500 text-xl">No se encontró la línea académica.</p>
  </div>
);

const slugify = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// Accent theme by linea
const getAccentTheme = (nombre: string) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("ia") || n.includes("inteligencia")) return {
    glow1: "bg-purple-500/10",
    glow2: "bg-indigo-600/8",
    imgGlow: "bg-purple-500/20",
    imgShadow: "shadow-[0_0_80px_-20px_rgba(168,85,247,0.5)]",
    corner: "border-purple-500/50",
    iconBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    iconBg2: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    bar: "bg-gradient-to-r from-purple-500 to-indigo-500",
    sectionGlow1: "bg-purple-500/6",
    sectionGlow2: "bg-indigo-500/5",
    ctaGlow: "bg-purple-500/6",
    ctaGradient: "from-purple-500 to-indigo-600",
    ctaShadow: "shadow-[0_0_30px_-10px_rgba(168,85,247,0.5)]",
  };
  if (n.includes("teacher") || n.includes("docente") || n.includes("educa")) return {
    glow1: "bg-emerald-500/10",
    glow2: "bg-teal-600/8",
    imgGlow: "bg-emerald-500/20",
    imgShadow: "shadow-[0_0_80px_-20px_rgba(16,185,129,0.5)]",
    corner: "border-emerald-500/50",
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    iconBg2: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    sectionGlow1: "bg-emerald-500/6",
    sectionGlow2: "bg-teal-500/5",
    ctaGlow: "bg-emerald-500/6",
    ctaGradient: "from-emerald-500 to-teal-600",
    ctaShadow: "shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]",
  };
  if (n.includes("business") || n.includes("negocio") || n.includes("empresa")) return {
    glow1: "bg-amber-500/10",
    glow2: "bg-orange-600/8",
    imgGlow: "bg-amber-500/20",
    imgShadow: "shadow-[0_0_80px_-20px_rgba(245,158,11,0.5)]",
    corner: "border-amber-500/50",
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    iconBg2: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    bar: "bg-gradient-to-r from-amber-500 to-orange-500",
    sectionGlow1: "bg-amber-500/6",
    sectionGlow2: "bg-orange-500/5",
    ctaGlow: "bg-amber-500/6",
    ctaGradient: "from-amber-500 to-orange-500",
    ctaShadow: "shadow-[0_0_30px_-10px_rgba(245,158,11,0.5)]",
  };
  // DEV / default
  return {
    glow1: "bg-sky-500/10",
    glow2: "bg-blue-600/8",
    imgGlow: "bg-sky-500/20",
    imgShadow: "shadow-[0_0_80px_-20px_rgba(14,165,233,0.5)]",
    corner: "border-sky-500/50",
    iconBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    iconBg2: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    bar: "bg-gradient-to-r from-sky-500 to-blue-500",
    sectionGlow1: "bg-sky-500/6",
    sectionGlow2: "bg-blue-500/5",
    ctaGlow: "bg-sky-500/6",
    ctaGradient: "from-sky-500 to-blue-600",
    ctaShadow: "shadow-[0_0_30px_-10px_rgba(14,165,233,0.5)]",
  };
};

function LineaAcademicaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [lineaData, setLineaData] = useState<LineaAcademica | null>(null);
  usePageTitle(lineaData?.nombre || "Línea Académica");
  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<RutaAcademica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalCursos, setTotalCursos] = useState<number>(0);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo(0, 0);

    const fetchLineaYDatos = async () => {
      try {
        setLoading(true);

        const responseLinea = await apiClient.get("/lineas-academicas");
        const dataLinea = responseLinea.data;

        if (!dataLinea || !Array.isArray(dataLinea.data) || dataLinea.data.length === 0) {
          throw new Error("No se encontraron líneas académicas.");
        }

        const parseList = (json: any): any[] => {
          if (Array.isArray(json)) return json;
          if (Array.isArray(json?.data)) return json.data;
          if (Array.isArray(json?.items)) return json.items;
          if (Array.isArray(json?.rutas)) return json.rutas;
          if (Array.isArray(json?.cursos)) return json.cursos;
          if (Array.isArray(json?.data?.data)) return json.data.data;
          return [];
        };

        const lineas = parseList(dataLinea);
        const selectedLinea = lineas.find((linea: LineaAcademica) => {
          const s1 = slugify(linea.slug || linea.nombre);
          const s2 = slugify(linea.nombre);
          return s1 === slug || s2 === slug || (linea.slug && linea.slug.toLowerCase() === slug?.toLowerCase());
        });

        if (!selectedLinea) {
          console.warn(`[MIS Academy] Línea no encontrada para el slug: "${slug}".`);
          setLoading(false);
          return;
        }

        const responseDetail = await apiClient.get(`/lineas-academicas/slug/${slug}`).catch(() => {
          setLineaData(selectedLinea);
          setRutas([]);
          setTotalCursos(0);
          return null;
        });

        if (!responseDetail) return;

        const fullLineaData = responseDetail.data;
        setLineaData(fullLineaData);

        const lineRutas = fullLineaData.rutas_academicas || [];
        setRutas(lineRutas);
        setFilteredRutas(lineRutas);

        const total = lineRutas.reduce((acc: number, ruta: any) => {
          return acc + (ruta.cursos ? ruta.cursos.length : 0);
        }, 0);

        setTotalCursos(total);
      } catch (err) {
        console.error(err);
        setError("Hubo un problema al cargar la línea académica o las rutas.");
      } finally {
        setLoading(false);
      }
    };

    fetchLineaYDatos();
  }, [slug]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = rutas.filter((ruta) =>
        ruta.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRutas(filtered);
    } else {
      setFilteredRutas(rutas);
    }
  }, [searchQuery, rutas]);

  if (loading) return <LoadingSpinner />;
  if (error || !lineaData) return <ErrorMessage />;

  const accent = getAccentTheme(lineaData.nombre);

  return (
    <div className="min-h-screen bg-[#03070c] overflow-x-hidden text-white">
      {/* Hero */}
      <div className="relative pt-24 pb-20 px-6 md:px-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] blur-[150px] rounded-full -z-10 animate-pulse opacity-80" style={{ background: `radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)` }} />
        <div className={`absolute top-[-10%] right-[-5%] w-[600px] h-[600px] ${accent.glow1} blur-[150px] rounded-full -z-10 animate-pulse`} />
        <div className={`absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] ${accent.glow2} blur-[120px] rounded-full -z-10`} />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center relative z-10">
          {/* Text */}
          <div className="lg:w-1/2 w-full space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sky-400 text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md">
              <Link to="/lineas-academicas" className="hover:text-white transition-colors">Academia</Link>
              <span className="opacity-30">/</span>
              <span>Línea Académica</span>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.5, x: 0 }}
                className="absolute -top-8 left-0 text-sky-500 font-bold tracking-[1em] text-sm hidden lg:block"
              >
                MIS
              </motion.div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1.0] mb-8 hero-glow">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-sky-500">
                  {lineaData.nombre.replace("MIS ", "")}
                </span>
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-light max-w-xl mx-auto lg:mx-0">
              {lineaData.descripcion}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${accent.iconBg}`}>
                  <RouteIcon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black">{rutas.length}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rutas</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${accent.iconBg2}`}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black">{totalCursos}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cursos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="lg:w-1/2 w-full perspective-1000">
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className={`absolute inset-0 ${accent.imgGlow} blur-[120px] rounded-full scale-150 animate-pulse -z-10`} />
              <motion.div
                animate={{ y: [0, -20, 0], rotateZ: [0, 1, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 group"
              >
                <div className={`relative rounded-[3rem] overflow-hidden border border-white/10 ${accent.imgShadow}`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                  <img
                    src={(() => {
                      const imgPath = lineaData.imagen;
                      if (!imgPath) return "/ejemplo2.jpg";
                      if (imgPath.startsWith("http")) return imgPath;
                      return `${apiUrl("/").replace(/\/$/, "")}/${imgPath.replace(/^\/?/, "")}`;
                    })()}
                    alt={lineaData.nombre}
                    className="w-full aspect-[16/10] object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                </div>
                <div className={`absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 ${accent.corner} rounded-tr-[2rem] -z-10`} />
                <div className={`absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 ${accent.corner} rounded-bl-[2rem] -z-10`} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="relative overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-[600px] h-[500px] ${accent.sectionGlow1} rounded-full blur-[140px] pointer-events-none`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[400px] ${accent.sectionGlow2} rounded-full blur-[130px] pointer-events-none`} />
        <LearningRoadmap
          lineName={lineaData.nombre}
          routes={rutas}
          lineSlug={slug || ""}
          lineaNombre={lineaData.nombre}
        />
      </div>

      {/* Grid de Rutas */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-24 overflow-hidden">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${accent.sectionGlow1} rounded-full blur-[140px] pointer-events-none`} />
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] ${accent.sectionGlow2} rounded-full blur-[130px] pointer-events-none`} />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                Explora las Rutas
              </h2>
              <div className={`h-1 w-24 ${accent.bar} rounded-full`} />
            </div>

            <div className="w-full md:w-[400px]">
              <div className="relative group">
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white/10 focus:border-sky-500/50 outline-none transition-all backdrop-blur-md"
                  placeholder="Buscar una ruta específica..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors">
                  <RouteIcon size={20} />
                </div>
              </div>
            </div>
          </div>

          {filteredRutas.length === 0 ? (
            <div className="py-20 text-center bg-white/[0.02] border border-white/10 rounded-[3rem]">
              <p className="text-slate-400 text-xl font-medium">
                No encontramos rutas que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            <LineasAcademicasGrid lineas={filteredRutas} linea={lineaData} lineaNombre={lineaData.nombre} />
          )}
        </div>
      </div>

      {/* CTA Final */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] ${accent.ctaGlow} rounded-full blur-[120px] pointer-events-none`} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">¿Listo para empezar?</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Empieza tu ruta en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400">
              {lineaData.nombre.replace("MIS ", "")}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg mb-10 font-medium"
          >
            {rutas.length} rutas y {totalCursos} cursos especializados te esperan. Comienza hoy.
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
              className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${accent.ctaGradient} text-white font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all ${accent.ctaShadow}`}
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
}

export default LineaAcademicaPage;
