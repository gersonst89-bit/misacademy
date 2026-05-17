import React, { useState, useEffect } from "react";
import CourseCard from "./CursoCard";
import { apiUrl } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Sparkles, AlertCircle } from "lucide-react";

interface LineaAcademica {
  id_linea_academica: number;
  nombre: string;
  estado: string;
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>(initialData || []);
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [selectedLinea, setSelectedLinea] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

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
          const response = await fetch(
            apiUrl(`/cursos?page=${page}`),
            { credentials: "include" }
          );
          if (!response.ok) throw new Error("Error al cargar los cursos");

          const data = await response.json();
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
        const res = await fetch(
          apiUrl("/lineas-academicas"),
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const activas = (data.data || []).filter(
          (l: LineaAcademica) => l.estado === "Publicado"
        );
        setLineas(activas);
      } catch (err) {
        console.error("Error cargando líneas:", err);
      }
    };

    fetchCourses();
    fetchLineas();
  }, [initialData]);

  const filteredCourses = courses.filter((course) => {
    // 1. Filtro de estado (Solo mostrar publicados)
    if (course.estado?.toLowerCase() !== "publicado") return false;

    // 2. Filtro de búsqueda por texto (Protección contra campos nulos)
    const lowercasedQuery = searchQuery.toLowerCase();
    const nombre = course.nombre || "";
    const descripcion = course.descripcion || course.descripcion_corta || "";
    
    const matchesSearch =
      nombre.toLowerCase().includes(lowercasedQuery) ||
      descripcion.toLowerCase().includes(lowercasedQuery);

    // 3. Filtro por Línea Académica (Comparación robusta)
    const matchesLinea =
      selectedLinea === null ||
      (course.rutas &&
        course.rutas.some((r: any) => {
          const lineaIdRuta = r.id_linea_academica || r.id_linea;
          return lineaIdRuta && String(lineaIdRuta) === String(selectedLinea);
        }));

    return matchesSearch && matchesLinea;
  });

  return (
    <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 relative">
      <div className="glow-orb top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 blur-[100px]" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative z-10">
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

      {/* Filtros por línea académica - Modernizado */}
      <div className="relative z-10 mb-12 flex flex-col gap-6">
        <div className="flex items-center gap-3 text-slate-500">
           <Filter size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">Filtrar por Especialidad</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <AnimatePresence>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, index) => (
                <CourseCard
                  key={course.id_curso || `course-${index}`}
                  title={course.nombre}
                  description={course.descripcion}
                  precio={`S/. ${course.precio}`}
                  image={course.imagen || "/ejemplo2.jpg"}
                  slug={course.slug || createSlug(course.nombre)}
                  cursoId={course.id_curso}
                  nivel={course.nivel || ""}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
        </div>
      )}
    </section>
  );
};

export default Cursos;
