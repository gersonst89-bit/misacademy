import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { apiUrl, API_URL } from "../config/api";

interface Curso {
  id_curso: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string | null;
  nivel: string;
  estado: string;
  destacado: number | boolean | string;
}

const createSlug = (title: string): string =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const nivelColor = (nivel: string) => {
  switch (nivel?.toLowerCase()) {
    case "básico":
    case "basico":
      return "bg-emerald-500";
    case "intermedio":
      return "bg-amber-500";
    case "avanzado":
    case "experto":
      return "bg-rose-500";
    default:
      return "bg-sky-500";
  }
};

export default function CursosDestacadosHome() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        // Usar el endpoint optimizado que ya existe en el backend
        const res = await fetch(apiUrl("/cursos/destacados?limit=8"));
        
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        
        const data = await res.json();
        
        // El backend ya devuelve la lista filtrada de destacados publicados
        // Si por alguna razón viene vacío, mostramos un mensaje adecuado
        setCursos(data.data || data || []);
      } catch (err) {
        console.error("Error cargando cursos destacados:", err);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-6 lg:px-8 bg-[#0B1623]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white">Cargando cursos destacados...</p>
        </div>
      </section>
    );
  }

  if (cursos.length === 0) {
    return (
      <section className="py-16 px-6 lg:px-8 bg-[#0B1623]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nuestros Cursos Más Populares
          </h2>
          <p className="text-gray-400 mt-8">Pronto tendremos cursos disponibles.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="cursos" className="py-16 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nuestros Cursos Más Populares
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Descubre los cursos que más eligen nuestros estudiantes para
            impulsar su carrera profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <div
              key={curso.id_curso}
              className="flex flex-col text-white bg-[#0D1A28] rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-white/5 hover:border-sky-500/30 transition-all duration-300 group"
            >
              <Link to={`/curso/${createSlug(curso.nombre)}`}>
                <div className="relative overflow-hidden h-48">
                  <img
                    src={curso.imagen || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"}
                    alt={curso.nombre}
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"; }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badge de nivel */}
                  {curso.nivel && (
                    <span
                      className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full text-white shadow-lg ${nivelColor(
                        curso.nivel
                      )}`}
                    >
                      {curso.nivel}
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-4 flex flex-col flex-1">
                <Link to={`/curso/${createSlug(curso.nombre)}`}>
                  <h3 className="text-base font-semibold mb-2 text-left leading-snug group-hover:text-sky-400 transition-colors duration-200">
                    {curso.nombre}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 mb-4 text-left flex-1 line-clamp-2">
                  {curso.descripcion}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sky-400 font-bold text-lg">
                    S/. {curso.precio}
                  </span>
                  <Link
                    to={`/curso/${createSlug(curso.nombre)}`}
                    className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                  >
                    Ver más <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/cursos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-sky-500/30"
          >
            Ver todos los cursos <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
