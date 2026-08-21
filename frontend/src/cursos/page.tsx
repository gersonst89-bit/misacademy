import { useEffect, useState } from 'react';
import FeaturedCarousel from './CursoComponents/BannerCurso';
import CursoGrid from './CursoComponents/CursoGrid';
import { apiClient } from '../services/apiClient';

export default function CursosPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [featuredReady, setFeaturedReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const isFeatured = (course: any) =>
      (course.destacado === 1 || course.destacado === true || course.destacado === '1') &&
      course.estado === 'Publicado';

    const fetchData = async () => {
      try {
        const firstResponse = await apiClient.get('/cursos?page=1', {
          signal: controller.signal,
        });

        const firstData = firstResponse.data;
        const firstItems = firstData.data || [];
        const totalPages = firstData.last_page || 1;

        setCourses(firstItems);
        setFeaturedCourses(firstItems.filter(isFeatured));

        if (totalPages <= 1) {
          setFeaturedReady(true);
          setLoading(false);
          return;
        }

        const remainingResponses = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            apiClient.get(`/cursos?page=${index + 2}`, {
              signal: controller.signal,
            }),
          ),
        );

        if (controller.signal.aborted) {
          return;
        }

        const remainingCourses = remainingResponses.flatMap((response) => response.data.data || []);

        const allCourses = [...firstItems, ...remainingCourses];

        setCourses(allCourses);
        setFeaturedCourses(allCourses.filter(isFeatured));
        setFeaturedReady(true);
        setLoading(false);
      } catch (error: any) {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          console.error('Error cargando cursos:', error);
        }
        setFeaturedReady(true);
        setLoading(false);
      }
    };

    fetchData();

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
    return <div className="min-h-screen bg-[#03070c]" />;
  }

  return (
    <div className="min-h-screen bg-[#03070c]">
      {featuredReady && featuredCourses.length > 0 && (
        <FeaturedCarousel initialData={featuredCourses} />
      )}

      {featuredReady && <CursoGrid initialData={courses} />}
    </div>
  );
}
