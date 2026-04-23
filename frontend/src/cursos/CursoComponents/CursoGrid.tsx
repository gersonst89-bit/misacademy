import React, { useState, useEffect } from "react";
import CourseCard from "./CursoCard";
import { apiUrl } from "../../config/api";

const Cursos: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchCourses = async () => {
    setLoading(true);
    try {
      let allCourses: any[] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await fetch(
          apiUrl(`/cursos?page=${page}`)
        );
        if (!response.ok) throw new Error("Error al cargar los cursos");

        const data = await response.json();
        console.log(`Página ${page} recibida:`, data.data?.length, "cursos");

        const cursosPagina = data.data || [];
        allCourses = [...allCourses, ...cursosPagina];

        lastPage = data.last_page || 1;
        page++;
      } while (page <= lastPage);

      setCourses(allCourses);
      console.log(`Total de cursos cargados: ${allCourses.length}`);
    } catch (err: any) {
      console.error("Error al cargar cursos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchCourses();
}, []);


  const filteredCourses = courses.filter((course) => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return (
      course.estado === "Publicado" &&
      (course.nombre.toLowerCase().includes(lowercasedQuery) ||
        course.descripcion.toLowerCase().includes(lowercasedQuery))
    );
  });

  return (
    <div className="w-full px-6 pt-2 pb-5">
      <h2 className="text-3xl font-bold text-start text-white mb-4">
        Nuestros Cursos
      </h2>

      <div className="mb-6">
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none"
          placeholder="Buscar cursos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center h-full">
          <p className="text-white">Cargando cursos...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <CourseCard
                key={index}
                title={course.nombre}
                description={course.descripcion}
                precio={`S/. ${course.precio}`}
                image={course.imagen || "/default-image.jpg"}
                slug={course.id_curso.toString()}
                cursoId={course.id_curso}
              />
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center h-full min-h-24">
              <p className="text-gray-200 text-xl">
                No se encontraron cursos que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cursos;
