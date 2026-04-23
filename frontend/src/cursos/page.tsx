import { useState, useEffect } from "react";
import FeaturedCarousel from "./CursoComponents/BannerCurso";
import CursoGrid from "./CursoComponents/CursoGrid";

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

export default function CursosPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setLoading(false);
      } catch (error) {
        console.error("Error cargando los datos:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <FeaturedCarousel />
      <CursoGrid />
    </div>
  );
}
