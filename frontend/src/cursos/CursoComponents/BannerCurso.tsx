import { useEffect, useRef, useState } from "react";
import { BsBarChartFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import { IoIosInformationCircle } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { apiUrl } from "../../config/api";
import { Sparkles, ArrowRight } from "lucide-react";

type FeaturedItem = {
  id_curso: number;
  nombre: string;
  descripcion: string;
  duracion_horas: number;
  nivel: string;
  precio: string;
  imagen: string | null;
  estado: string;
  destacado: number;
  badge?: string;
};

const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const FeaturedCarousel = ({ initialData }: { initialData?: FeaturedItem[] }) => {
  const [index, setIndex] = useState(0);
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedItem[]>(initialData || []);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (initialData) {
      setFeaturedCourses(initialData);
      return;
    }

    const fetchCourses = async () => {
      try {
        let allCourses: any[] = [];
        let page = 1;

        while (true) {
          const res = await fetch(apiUrl(`/cursos?page=${page}`));
          if (!res.ok) break;
          const data = await res.json();
          const items = data.data || [];
          if (items.length === 0) break;
          allCourses = [...allCourses, ...items];
          page++;
        }

        const filteredCourses = allCourses.filter(
          (course: any) =>
            (course.destacado === 1 || course.destacado === true || course.destacado === "1") && 
            course.estado === "Publicado"
        );

        if (filteredCourses.length > 0) {
          setFeaturedCourses(filteredCourses);
        }
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      }
    };

    fetchCourses();
  }, [initialData]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPausedRef.current && featuredCourses.length > 0) {
        setIndex((prev) => (prev >= featuredCourses.length - 1 ? 0 : prev + 1));
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredCourses]);

  if (featuredCourses.length === 0) return null;

  return (
    <div
      className="relative w-full h-[600px] lg:h-[700px] overflow-hidden bg-[#03070c]"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredCourses[index].imagen || "/default-image.jpg"}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            {/* Enhanced gradients to blend perfectly with fixed header */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#03070c] via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#03070c] via-transparent to-[#03070c] z-10" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto h-full px-6 lg:px-12 flex items-center">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-sky-500/20 border border-sky-400/30 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <Sparkles size={18} className="text-sky-400" />
                   </div>
                   <span className="text-[10px] font-black tracking-[0.4em] text-sky-400 uppercase">Curso Destacado</span>
                </div>

                <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 italic pr-4">
                  {featuredCourses[index].nombre}
                </h2>
                
                <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed mb-10 max-w-xl">
                  {featuredCourses[index].descripcion}
                </p>

                <div className="flex flex-wrap items-center gap-8 mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                       <FaClock className="text-sky-400" />
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Duración</div>
                       <div className="text-white font-black">{featuredCourses[index].duracion_horas} Horas</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                       <BsBarChartFill className="text-sky-400" />
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dificultad</div>
                       <div className="text-white font-black">{featuredCourses[index].nivel}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <Link to={`/curso/${createSlug(featuredCourses[index].nombre)}`} className="btn-premium px-10 py-5 group">
                    <span className="flex items-center gap-3">
                       MÁS INFORMACIÓN
                       <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="hidden lg:block relative"
              >
                <div className="absolute inset-0 bg-sky-500/20 blur-[120px] rounded-full" />
                <div className="relative glass-card p-4 rounded-[2.5rem] border-white/10 overflow-hidden group">
                   <img
                      src={featuredCourses[index].imagen || "/default-image.jpg"}
                      alt={featuredCourses[index].nombre}
                      className="w-full aspect-video object-cover rounded-[2rem] shadow-2xl group-hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {featuredCourses.map((_, pos) => (
          <button
            key={pos}
            onClick={() => setIndex(pos)}
            className="group py-4 px-2"
            aria-label={`Slide ${pos + 1}`}
          >
            <div className={`h-1 transition-all duration-500 rounded-full ${
              pos === index ? "w-12 bg-sky-500" : "w-6 bg-white/20 group-hover:bg-white/40"
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
