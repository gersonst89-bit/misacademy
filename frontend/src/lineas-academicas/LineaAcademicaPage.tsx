import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LineaAcademica, RutaAcademica } from "../types/models";
import { BookOpen, Route as RouteIcon } from "lucide-react";
import LineasAcademicasGrid from "./Components/LineasAcademicasGrid";
import LearningRoadmap from "./Components/LearningRoadmap";
import { apiUrl, API_URL } from "../config/api";
import { usePageTitle } from "../hooks/usePageTitle";

// Loader
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

const ErrorMessage = () => (
  <div className="flex justify-center items-center h-screen">
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

        // 1️⃣ Obtener líneas académicas
        const responseLinea = await fetch(
          apiUrl("/lineas-academicas"),
          { credentials: "include" }
        );
        const dataLinea = await responseLinea.json();

        if (
          !dataLinea ||
          !Array.isArray(dataLinea.data) ||
          dataLinea.data.length === 0
        ) {
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
        const selectedLinea = lineas.find(
          (linea: LineaAcademica) => {
            const s1 = slugify(linea.slug || linea.nombre);
            const s2 = slugify(linea.nombre);
            return s1 === slug || s2 === slug || (linea.slug && linea.slug.toLowerCase() === slug?.toLowerCase());
          }
        );

        if (!selectedLinea) {
          console.warn(`[MIS Academy] Línea no encontrada para el slug: "${slug}". Disponibles:`, lineas.map(l => slugify(l.slug || l.nombre)));
          setLoading(false);
          return;
        }

        // 2️⃣ Obtener datos específicos de esta línea (incluyendo rutas y cursos)
        const responseDetail = await fetch(
          apiUrl(`/lineas-academicas/slug/${slug}`),
          { credentials: "include" }
        );
        
        if (!responseDetail.ok) {
           // Fallback si falla el slug (intentar encontrarlo en la lista previa)
           setLineaData(selectedLinea);
           setRutas([]);
           setTotalCursos(0);
           return;
        }

        const fullLineaData = await responseDetail.json();
        setLineaData(fullLineaData);

        // Extraer rutas y calcular total de cursos de forma DINÁMICA
        const lineRutas = fullLineaData.rutas_academicas || [];
        setRutas(lineRutas);
        setFilteredRutas(lineRutas);

        // Suma dinámica: Cursos totales = suma de cursos en cada ruta
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

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Cinemático Premium */}
      <div className="relative pt-24 pb-20 px-6 md:px-10 overflow-hidden">
        {/* Glow Backgrounds */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center relative z-10">
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
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <RouteIcon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black">{rutas.length}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rutas</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black">{totalCursos}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cursos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full perspective-1000">
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Atmospheric Glow behind image */}
              <div className="absolute inset-0 bg-sky-500/20 blur-[120px] rounded-full scale-150 animate-pulse -z-10" />
              
              {/* Image Container with Float Animation */}
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  rotateZ: [0, 1, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative z-10 group"
              >
                {/* Image Masking & Overlays */}
                <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_-20px_rgba(14,165,233,0.4)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                  
                  <img
                    src={(() => {
                      const imgPath = lineaData.imagen;
                      if (!imgPath) return "/ejemplo2.jpg";
                      if (imgPath.startsWith("http")) return imgPath;
                      return `${apiUrl("/").replace(/\/$/, "")}/${imgPath.replace(/^\/?(api\/)?/, "")}`;
                    })()}
                    alt={lineaData.nombre}
                    className="w-full aspect-[16/10] object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                  
                  {/* Subtle Vignette */}
                  <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                </div>

                {/* Decorative Tech Accents */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-sky-500/50 rounded-tr-[2rem] -z-10" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-sky-500/50 rounded-bl-[2rem] -z-10" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="bg-black/20 backdrop-blur-sm">
        <LearningRoadmap 
          lineName={lineaData.nombre} 
          routes={rutas} 
          lineSlug={slug || ""}
        />
      </div>

      {/* Grid de Rutas Adicionales */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Explora las Rutas
            </h2>
            <div className="h-1 w-24 bg-sky-500 rounded-full" />
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
          <div className="py-20 text-center glass-card rounded-[3rem]">
            <p className="text-slate-400 text-xl font-medium">
              No encontramos rutas que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <LineasAcademicasGrid lineas={filteredRutas} linea={lineaData} />
        )}
      </div>
    </div>
  );
}

export default LineaAcademicaPage;
