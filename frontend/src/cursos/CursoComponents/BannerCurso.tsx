import { useEffect, useRef, useState } from "react";
import { BsBarChartFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import { IoIosInformationCircle } from "react-icons/io";

import { Link } from "react-router-dom"; // Importa Link para las rutas
import { apiUrl } from "../../config/api";

type FeaturedItem = {
  id_curso: number;
  nombre: string;
  descripcion: string;
  duracion: number;
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

const FeaturedCarousel = () => {
  const [index, setIndex] = useState(0);
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedItem[]>([]);
  const autoplayRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let allCourses: any[] = [];
        let page = 1;

        while (true) {
          const res = await fetch(
            apiUrl(`/cursos?page=${page}`)
          );

          if (!res.ok) break;

          const data = await res.json();
          const items = data.data || [];

          // Si no hay más cursos, detener
          if (items.length === 0) break;

          allCourses = [...allCourses, ...items];
          page++;
        }

        // Filtrar solo los publicados + destacados
        const filteredCourses = allCourses.filter(
          (course: any) =>
            course.destacado === 1 && course.estado === "Publicado"
        );

        setFeaturedCourses(filteredCourses);
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    clearIntervalIfAny();
    autoplayRef.current = window.setInterval(() => {
      if (!isPausedRef.current) {
        setIndex((prev) => (prev >= featuredCourses.length - 1 ? 0 : prev + 1));
      }
    }, 5000);
    return () => clearIntervalIfAny();
  }, [featuredCourses]);

  function clearIntervalIfAny() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  return (
    <div
      className="relative w-full min-h-[380px] overflow-hidden text-white"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out h-full pt-10"
        style={{
          transform: `translateX(-${index * 100}vw)`,
          width: `${featuredCourses.length * 100}vw`,
        }}
      >
        {featuredCourses.map((course) => (
          <div
            key={course.id_curso}
            className="h-full flex flex-col items-center justify-between px-10"
            style={{ flex: "0 0 100vw" }}
          >
            <div className="flex flex-1 w-full flex-col md:flex-row">
              <div className="w-full md:w-1/2 flex flex-col justify-center md:pr-14">
                {course.badge && (
                  <span className="bg-amber-400 text-[#0E1C2B] text-sm px-6 py-1 rounded-sm rounded-tr-3xl font-semibold inline-block w-fit">
                    {course.badge}
                  </span>
                )}
                <h3 className="text-5xl font-bold mt-3 leading-[3.8rem]">
                  {course.nombre}
                </h3>
                <p className="text-gray-300 mt-3 font-medium text-lg">
                  {course.descripcion}
                </p>
                <div className="flex items-center gap-6 text-[15px] text-gray-300 mt-4">
                  <span className="flex items-center gap-2">
                    <FaClock className="text-amber-400 text-lg" />
                    {course.duracion} Horas
                  </span>
                  <span className="flex items-center gap-2">
                    <BsBarChartFill className="text-amber-400 text-lg" />
                    {course.nivel}
                  </span>
                </div>
                <div className="flex justify-center md:justify-start gap-4 mt-6 mb-6 md:mb-4">
                  <Link to={`/curso/${createSlug(course.nombre)}`}>
                    <button className="bg-sky-400 text-white px-5 py-3 rounded-lg font-semibold hover:bg-sky-500 flex items-center gap-2 cursor-pointer transition">
                      <IoIosInformationCircle className="text-xl" />
                      <span>Más información</span>
                    </button>
                  </Link>

                  <button className="px-6 py-3 rounded-lg hover:text-gray-300 flex items-center gap-2 cursor-pointer"></button>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex items-center justify-center">
                <img
                  src={course.imagen || "/default-image.jpg"}
                  alt={course.nombre}
                  className="w-full max-h-80 object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              {featuredCourses.map((_, pos) => (
                <button
                  key={pos}
                  onClick={() => setIndex(pos)}
                  className={`w-4 h-4 rounded-full transition-colors ${
                    pos === index ? "bg-sky-400" : "bg-gray-600/70"
                  }`}
                  aria-label={`Ir al slide ${pos + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
