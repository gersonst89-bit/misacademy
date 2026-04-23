import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { apiUrl } from "../config/api";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

interface LineaAcademica {
  id_linea: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  estado: string;
  slug?: string;
}

const slugify = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function LineasListPage() {
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const response = await fetch(
          apiUrl("/lineas")
        );
        if (!response.ok) throw new Error("Error al obtener las líneas académicas");

        const data = await response.json();
        const publicadas = (data.data || []).filter(
          (linea: LineaAcademica) => linea.estado === "Publicado"
        );
        setLineas(publicadas);
      } catch (err) {
        setError("Hubo un problema al cargar las líneas académicas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLineas();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-950 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white overflow-x-hidden">
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center items-center text-center px-6 md:px-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('/hero-image.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />

        <div className="relative z-10 px-6 max-w-4xl">
          <h1 className="text-3xl md:text-6xl font-extrabold mb-6 animate-fadeInUp">
            Líneas Académicas MIS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fadeInUp delay-200">
            Explora, aprende y transforma tu futuro con nuestras áreas de
            especialización en tecnología, innovación y educación digital.
          </p>
          <a
            href="#lineas"
            className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-sky-600 rounded-full hover:bg-sky-700 hover:shadow-[0_0_25px_5px_rgba(56,189,248,0.6)] animate-bounce"
          >
            Descubrir más
          </a>
        </div>
      </section>

      <section
        id="lineas"
        className="w-full px-3 sm:px-6 lg:px-10 xl:px-16 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center"
      >
        {lineas.length > 0 ? (
          lineas.map((linea) => (
            <Link
              to={`/lineas-academicas/${slugify(linea.slug || linea.nombre)}`}
              key={linea.id_linea}
              className="group relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={linea.imagen || "/fallback.jpg"}
                  alt={linea.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:opacity-70 transition" />
              </div>

              <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">{linea.nombre}</h2>
                </div>
                <p className="text-gray-300">{linea.descripcion}</p>

                <div className="mt-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-3 transition-all duration-500 flex items-center gap-2 text-sky-400 font-semibold">
                  <ArrowRight className="w-5 h-5" />
                  <span>Empezar a estudiar</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-full">
            No hay líneas académicas disponibles actualmente.
          </p>
        )}
      </section>
    </div>
  );
}

export default LineasListPage;
