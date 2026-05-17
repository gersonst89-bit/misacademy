import { useState, useEffect } from "react";
import FeaturedCarousel from "./CursoComponents/BannerCurso";
import CursoGrid from "./CursoComponents/CursoGrid";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "../config/api";

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-[#03070c]">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(14,165,233,0.3)]"></div>
      <div className="absolute inset-4 border-4 border-blue-600/20 rounded-full"></div>
      <div className="absolute inset-4 border-4 border-blue-600 border-b-transparent rounded-full animate-spin-slow"></div>
    </div>
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
      className="mt-10 flex flex-col items-center gap-2"
    >
      <span className="text-sky-400 font-black tracking-[0.4em] uppercase text-[10px]">MIS Academy</span>
      <span className="text-slate-500 font-bold text-xs">Preparando tu catálogo de cursos...</span>
    </motion.div>
  </div>
);

export default function CursosPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allCourses: any[] = [];
        let page = 1;
        let lastPage = 1;

        // Fetch all courses (needed for both grid and banner)
        do {
          const res = await fetch(
            apiUrl(`/cursos?page=${page}`),
            { credentials: "include" }
          );
          if (!res.ok) break;
          const data = await res.json();
          const items = data.data || [];
          allCourses = [...allCourses, ...items];
          lastPage = data.last_page || 1;
          page++;
        } while (page <= lastPage);

        // Filter featured for banner
        const featured = allCourses.filter(
          (c: any) => (c.destacado === 1 || c.destacado === true || c.destacado === "1") && c.estado === "Publicado"
        );

        setCourses(allCourses);
        setFeaturedCourses(featured);
        
        // Small extra delay for smooth transition
        setTimeout(() => setLoading(false), 800);
      } catch (error) {
        console.error("Error cargando los datos:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  return (
    <div className="bg-[#03070c] min-h-screen">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {featuredCourses.length > 0 && <FeaturedCarousel initialData={featuredCourses} />}
            <CursoGrid initialData={courses} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


