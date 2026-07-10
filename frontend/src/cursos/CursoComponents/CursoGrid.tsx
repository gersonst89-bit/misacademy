import React, { useState, useEffect } from "react";
import CourseCard from "./CursoCard";
import { apiUrl } from "../../config/api";
import { apiClient } from "../../services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface LineaAcademica {
  id_linea_academica: number;
  nombre: string;
  estado: string;
}

const ITEMS_PER_PAGE = 8;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const createSlug = (title: string): string => {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const Cursos: React.FC<{ initialData?: any[] }> = ({ initialData }) => {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>(initialData || []);
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [selectedLinea, setSelectedLinea] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lineaCursoIds, setLineaCursoIds] = useState<Map<number, Set<number>>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (initialData) {
      setCourses(initialData);
      setLoading(false);
    }

    const fetchCourses = async () => {
      if (initialData) return;
      setLoading(true);
      try {
        let allCourses: any[] = [];
        let page = 1;
        let lastPage = 1;

        do {
          const response = await apiClient.get(`/cursos?page=${page}`).catch((err: any) => {
            throw new Error(err?.response?.data?.message || err?.message || "Error al cargar los cursos");
          });

          const data = response.data;
          const cursosPagina = data.data || [];
          allCourses = [...allCourses, ...cursosPagina];

          lastPage = data.last_page || 1;
          page++;
        } while (page <= lastPage);

        setCourses(allCourses);
      } catch (err: any) {
        console.error("Error al cargar cursos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchLineas = async () => {
      try {
        const res = await apiClient.get("/lineas-academicas");
        const data = res.data;
        const activas = (data.data || []).filter(
          (l: LineaAcademica) => l.estado === "Publicado"
        );
        setLineas(activas);

        const idMap = new Map<number, Set<number>>();
        for (const linea of activas as any[]) {
          const lineaId = linea.id_linea_academica ?? linea.id_linea;
          const ids = new Set<number>();
          const rutas = linea.rutas_academicas || linea.rutas || [];
          for (const ruta of rutas) {
            const cursos = ruta.cursos || [];
            for (const c of cursos) {
              const cid = c.id_curso ?? c.id;
              if (cid != null) ids.add(Number(cid));
            }
          }
          if (lineaId != null) idMap.set(Number(lineaId), ids);
        }
        setLineaCursoIds(idMap);
      } catch (err) {
        console.error("Error cargando líneas:", err);
      }
    };

    fetchCourses();
    fetchLineas();
  }, [initialData]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLinea]);

  const filteredCourses = courses.filter((course) => {
    if (course.estado?.toLowerCase() !== "publicado") return false;

    const lowercasedQuery = searchQuery.toLowerCase();
    const nombre = course.nombre || "";
    const descripcion = course.descripcion || course.descripcion_corta || "";
    const matchesSearch =
      nombre.toLowerCase().includes(lowercasedQuery) ||
      descripcion.toLowerCase().includes(lowercasedQuery);

    if (selectedLinea === null) return matchesSearch;

    const allowedIds = lineaCursoIds.get(selectedLinea);
    const courseId = Number(course.id_curso ?? course.id);
    const matchesLinea =
      (allowedIds != null && allowedIds.has(courseId)) ||
      (Array.isArray(course.rutas) && course.rutas.some((r: any) => Number(r.id_linea_academica ?? r.id_linea) === selectedLinea));

    return matchesSearch && matchesLinea;
  });

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section ref={sectionRef} className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 relative">
      {/* Atmospheric glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-indigo-500/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/6 rounded-full blur-[130px]" />
      </div>

      {/* Header: título + buscador */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 relative z-10">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-sky-400" />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-sky-400 uppercase">Catálogo de Excelencia</span>
          </motion.div>
          <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none italic pr-4">
            Nuestros <span className="text-gradient-sky drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">Cursos</span>
          </h2>
        </div>

        <div className="flex-1 max-w-md relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="premium-input w-full !pl-16 !pr-4 !py-4 text-sm font-medium tracking-tight"
            placeholder="¿Qué quieres aprender hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros — con fondo diferenciado y separador */}
      <div className="relative z-10 mb-12">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filtrar por Especialidad</span>
            {filteredCourses.length > 0 && (
              <span className="ml-auto text-[10px] font-bold text-sky-400/70 tracking-widest">
                {filteredCourses.length} cursos
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedLinea(null)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                selectedLinea === null
                  ? "bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              Todos
            </button>
            {lineas.map((linea, index) => (
              <button
                key={linea.id_linea_academica || `grid-linea-${index}`}
                onClick={() =>
                  setSelectedLinea(
                    selectedLinea === linea.id_linea_academica ? null : linea.id_linea_academica
                  )
                }
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  selectedLinea === linea.id_linea_academica
                    ? "bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                    : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                {linea.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-rose-500/5 rounded-[3rem] border border-rose-500/20">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <p className="text-xl font-bold text-white mb-2">Ops, algo salió mal</p>
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course, index) => (
                  <motion.div
                    key={course.id_curso || `course-${index}`}
                    variants={itemVariants}
                    layout
                    className="flex flex-col h-full"
                  >
                    <CourseCard
                      title={course.nombre}
                      description={course.descripcion}
                      precio={`S/. ${course.precio}`}
                      image={course.imagen || "/ejemplo2.jpg"}
                      slug={course.slug || createSlug(course.nombre)}
                      cursoId={course.id_curso}
                      nivel={course.nivel || ""}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-600">
                    <Search size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sin resultados</h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    No pudimos encontrar cursos para "{searchQuery}". Intenta con otra palabra clave.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Paginación */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 mt-16 relative z-10"
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                    page === currentPage
                      ? "bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                      : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronRight size={18} />
              </button>

              <span className="ml-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Página {currentPage} de {totalPages}
              </span>
            </motion.div>
          )}
        </>
      )}
    </section>
  );
};

export default Cursos;
