import { useEffect, useState } from 'react';

import FeaturedCarousel from './CursoComponents/BannerCurso';
import CursoGrid from './CursoComponents/CursoGrid';

import { apiClient } from '../services/apiClient';

export default function CursosPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [featuredReady, setFeaturedReady] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourses = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get('/cursos?page=1', {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const coursesData = response.data;
        const firstItems = coursesData.data || [];

        setCourses(firstItems);
        setTotalPages(coursesData.last_page || 1);

        // Los cursos ya están listos.
        // No esperamos a que terminen los destacados.
        setLoading(false);
      } catch (error: any) {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          console.error('Error cargando cursos:', error);
        }

        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const fetchFeatured = async () => {
      try {
        const response = await apiClient.get('/cursos/destacados?limit=8', {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const featuredData = response.data;
        const featuredItems = featuredData.data || featuredData || [];

        setFeaturedCourses(featuredItems);
        setFeaturedReady(true);
      } catch (error: any) {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          console.error('Error cargando cursos destacados:', error);
        }

        if (!controller.signal.aborted) {
          // Aunque destacados fallen,
          // permitimos que la página siga funcionando.
          setFeaturedReady(true);
        }
      }
    };

    fetchCourses();
    fetchFeatured();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03070c] px-6 pt-6 pb-16">
        <div className="max-w-7xl mx-auto animate-pulse">
          {/* Banner destacado */}
          <div className="h-[220px] sm:h-[280px] lg:h-[320px] rounded-3xl bg-white/[0.04] border border-white/[0.06] mb-8" />

          {/* Encabezado */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-52 rounded-lg bg-white/[0.05]" />
            <div className="h-5 w-28 rounded-md bg-white/[0.04]" />
          </div>

          {/* Grid de cursos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025]"
              >
                <div className="aspect-video bg-white/[0.05]" />

                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 rounded bg-white/[0.05]" />
                  <div className="h-5 w-full rounded bg-white/[0.06]" />
                  <div className="h-4 w-4/5 rounded bg-white/[0.04]" />

                  <div className="pt-3 flex items-center justify-between">
                    <div className="h-7 w-20 rounded bg-white/[0.05]" />
                    <div className="h-8 w-24 rounded-lg bg-white/[0.05]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03070c]">
      {/* Destacados: se muestran cuando terminen de cargar */}
      {featuredReady && featuredCourses.length > 0 && (
        <FeaturedCarousel initialData={featuredCourses} />
      )}

      {/* Catálogo: se muestra apenas terminan de cargar los cursos */}
      <CursoGrid initialData={courses} initialTotalPages={totalPages} />
    </div>
  );
}
