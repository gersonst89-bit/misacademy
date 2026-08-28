import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLineas } from '../../store/academicSlice';
import CourseCard from './CursoCard';
import { apiClient } from '../../services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface LineaAcademica {
  id_linea_academica: number;
  nombre: string;
  estado: string;
}

interface CursosProps {
  initialData?: any[];
  initialTotalPages?: number;
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
      type: 'spring' as const,
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
  if (!title) return '';

  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const Cursos: React.FC<CursosProps> = ({ initialData, initialTotalPages = 1 }) => {
  const sectionRef = React.useRef<HTMLElement>(null);
  const dispatch = useDispatch<any>();

  const { lineas } = useSelector((state: any) => state.academic);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<any[]>(initialData || []);
  const [selectedLinea, setSelectedLinea] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(!initialData || initialData.length === 0);

  const [pageLoading, setPageLoading] = useState(false);
  const [loadingAllCourses, setLoadingAllCourses] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  // Cuando es false, solo tenemos la página actual.
  // Cuando es true, courses contiene todo el catálogo.
  const [allCoursesLoaded, setAllCoursesLoaded] = useState(false);

  const [serverTotalPages, setServerTotalPages] = useState(initialTotalPages);

  /**
   * Mantener sincronizado el contenido inicial recibido desde CursosPage.
   */
  useEffect(() => {
    if (initialData) {
      setCourses(initialData);
      setCurrentPage(1);
      setLoading(false);
      setAllCoursesLoaded(false);
    }
  }, [initialData, initialTotalPages]);

  /**
   * Cargar una página concreta del catálogo.
   * Esto reemplaza la carga automática de todas las páginas.
   */
  const fetchCoursePage = async (page: number) => {
    try {
      setPageLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
      });

      if (selectedLinea !== null) {
        params.set('id_linea_academica', String(selectedLinea));
      }

      const response = await apiClient.get(`/cursos?${params.toString()}`).catch((err: any) => {
        throw new Error(
          err?.response?.data?.message || err?.message || 'Error al cargar los cursos',
        );
      });

      const data = response.data;
      const cursosPagina = data.data || [];

      setCourses(cursosPagina);
      setServerTotalPages(data.last_page || 1);

      setAllCoursesLoaded(false);

      return cursosPagina;
    } catch (err: any) {
      console.error('Error al cargar cursos:', err);
      setError(err.message);
      return [];
    } finally {
      setPageLoading(false);
    }
  };

  /**
   * Cargar todas las páginas solamente cuando el usuario
   * realmente necesita búsqueda o filtros.
   *
   * Esto conserva la lógica anterior de búsqueda/filtros,
   * pero evita pagar ese coste durante la carga inicial.
   */
  const loadAllCourses = async () => {
    if (allCoursesLoaded || loadingAllCourses) return;

    try {
      setLoadingAllCourses(true);
      setError(null);

      const totalPages = Math.max(initialTotalPages, 1);

      // Si solo existe una página, ya tenemos todo.
      if (totalPages === 1) {
        setAllCoursesLoaded(true);
        return;
      }

      const remainingResponses = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          apiClient.get(`/cursos?page=${index + 2}`).catch((err: any) => {
            throw new Error(
              err?.response?.data?.message || err?.message || 'Error al cargar los cursos',
            );
          }),
        ),
      );

      const remainingCourses = remainingResponses.flatMap((response) => response.data?.data || []);

      const firstPageCourses = initialData || [];

      const allCourses = [...firstPageCourses, ...remainingCourses];

      setCourses(allCourses);
      setAllCoursesLoaded(true);
    } catch (err: any) {
      console.error('Error al cargar todos los cursos:', err);
      setError(err.message);
    } finally {
      setLoadingAllCourses(false);
    }
  };

  useEffect(() => {
    dispatch(fetchLineas());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);

    // Filtro por línea: el backend devuelve directamente
    // los cursos correspondientes a esa línea.
    if (selectedLinea !== null) {
      fetchCoursePage(1);
      return;
    }

    // Al volver a "Todos", recuperamos la primera página
    // normal del catálogo.
    if (!searchQuery.trim()) {
      fetchCoursePage(1);
      return;
    }

    // La búsqueda de texto sigue usando el catálogo completo.
    if (!allCoursesLoaded) {
      loadAllCourses();
    }
  }, [selectedLinea, searchQuery]);

  /**
   * Si la carga inicial aún no llegó, dejamos la página en estado loading.
   */
  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  /**
   * Filtrado local.
   *
   * Cuando allCoursesLoaded=false:
   *   courses = página actual.
   *
   * Cuando allCoursesLoaded=true:
   *   courses = catálogo completo.
   */
  const filteredCourses = courses.filter((course) => {
    if (course.estado?.toLowerCase() !== 'publicado') {
      return false;
    }

    const lowercasedQuery = searchQuery.toLowerCase().trim();

    const nombre = course.nombre || '';
    const descripcion = course.descripcion || course.descripcion_corta || '';

    const matchesSearch =
      nombre.toLowerCase().includes(lowercasedQuery) ||
      descripcion.toLowerCase().includes(lowercasedQuery);

    if (selectedLinea === null) {
      return matchesSearch;
    }

    /**
     * Los cursos vienen acompañados por sus rutas.
     * Usamos esa relación para determinar la línea académica.
     */
    const matchesLinea =
      Array.isArray(course.rutas) &&
      course.rutas.some((r: any) => Number(r.id_linea_academica ?? r.id_linea) === selectedLinea);

    return matchesSearch && matchesLinea;
  });

  /**
   * En modo normal, la API controla la paginación.
   * En modo búsqueda/filtro, paginamos localmente sobre
   * todos los cursos cargados.
   */
  const totalPages = allCoursesLoaded
    ? Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
    : Math.max(serverTotalPages, 1);

  const paginatedCourses = allCoursesLoaded
    ? filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filteredCourses;

  /**
   * Cambiar de página.
   *
   * Sin filtros:
   *   solicita solamente la página elegida.
   *
   * Con filtros:
   *   cambia la página localmente.
   */
  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    if (page === currentPage) {
      return;
    }

    setCurrentPage(page);

    if (!allCoursesLoaded) {
      await fetchCoursePage(page);
    }

    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-[2rem] bg-white/5 animate-pulse border border-white/5"
            />
          ))}
        </div>
      </section>
    );
  }

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

            <span className="text-[10px] font-black tracking-[0.3em] text-sky-400 uppercase">
              Catálogo de Excelencia
            </span>
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none italic pr-4">
            Nuestros{' '}
            <span className="text-gradient-sky drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              Cursos
            </span>
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

      {/* Filtros */}
      <div className="relative z-10 mb-12">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <Filter size={16} />

            <span className="text-[10px] font-black uppercase tracking-widest">
              Filtrar por Especialidad
            </span>

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
                  ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              Todos
            </button>

            {lineas.map((linea: LineaAcademica, index: number) => (
              <button
                key={linea.id_linea_academica || `grid-linea-${index}`}
                onClick={() =>
                  setSelectedLinea(
                    selectedLinea === linea.id_linea_academica ? null : linea.id_linea_academica,
                  )
                }
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  selectedLinea === linea.id_linea_academica
                    ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {linea.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(pageLoading || loadingAllCourses) && (
        <div className="flex items-center justify-center mb-6">
          <div className="w-6 h-6 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-rose-500/5 rounded-[3rem] border border-rose-500/20">
          <AlertCircle size={48} className="text-rose-500 mb-4" />

          <p className="text-xl font-bold text-white mb-2">Ops, algo salió mal</p>

          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {!error && (
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
                      image={course.imagen || '/ejemplo2.jpg'}
                      slug={course.slug || createSlug(course.nombre)}
                      cursoId={course.id_curso}
                      nivel={course.nivel || ''}
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
                    No pudimos encontrar cursos para "{searchQuery}". Intenta con otra palabra
                    clave.
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
                disabled={currentPage === 1 || pageLoading || loadingAllCourses}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  disabled={pageLoading || loadingAllCourses}
                  className={`w-10 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                    page === currentPage
                      ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || pageLoading || loadingAllCourses}
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
