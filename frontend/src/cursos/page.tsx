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

    const fetchData = async () => {
      try {
        setLoading(true);

        const [coursesResponse, featuredResponse] = await Promise.all([
          apiClient.get('/cursos?page=1', {
            signal: controller.signal,
          }),
          apiClient.get('/cursos/destacados?limit=8', {
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        const coursesData = coursesResponse.data;
        const firstItems = coursesData.data || [];

        setCourses(firstItems);
        setTotalPages(coursesData.last_page || 1);

        const featuredData = featuredResponse.data;
        const featuredItems = featuredData.data || featuredData || [];

        setFeaturedCourses(featuredItems);
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

      {featuredReady && <CursoGrid initialData={courses} initialTotalPages={totalPages} />}
    </div>
  );
}
