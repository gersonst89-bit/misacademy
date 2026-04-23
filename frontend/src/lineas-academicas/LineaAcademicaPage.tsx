import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { LineaAcademica, RutaAcademica } from "../types/models";
import { BookOpen, Route as RouteIcon } from "lucide-react";
import LineasAcademicasGrid from "./components/LineasAcademicasGrid";
import { apiUrl, API_URL } from "../config/api";

// Loader
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

const ErrorMessage = () => (
  <div className="flex justify-center items-center h-screen">
    <p className="text-red-500 text-xl">No se encontró la línea académica.</p>
  </div>
);

const slugify = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function LineaAcademicaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [lineaData, setLineaData] = useState<LineaAcademica | null>(null);
  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<RutaAcademica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalCursos, setTotalCursos] = useState<number>(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchLineaYDatos = async () => {
      try {
        setLoading(true);

        // 1️⃣ Obtener líneas académicas
        const responseLinea = await fetch(
          apiUrl("/lineas")
        );
        const dataLinea = await responseLinea.json();

        if (
          !dataLinea ||
          !Array.isArray(dataLinea.data) ||
          dataLinea.data.length === 0
        ) {
          throw new Error("No se encontraron líneas académicas.");
        }

        const selectedLinea = dataLinea.data.find(
          (linea: LineaAcademica) => slugify(linea.nombre) === slug
        );

        if (!selectedLinea) {
          throw new Error("No se encontró la línea académica.");
        }

        // 2️⃣ Obtener rutas
        const responseRutas = await fetch(
          `${API_URL}/rutas`
        );
        const dataRutas = await responseRutas.json();

        const lineRutas = (dataRutas?.data || []).filter(
          (ruta: RutaAcademica) =>
            ruta.id_linea_academica === selectedLinea.id_linea &&
            ruta.estado === "Activa"
        );

        setLineaData(selectedLinea);
        setRutas(lineRutas);
        setFilteredRutas(lineRutas);

        // 3️⃣ Obtener cursos y contar los que pertenecen a estas rutas
        const responseCursos = await fetch(
          `${API_URL}/cursos`
        );
        const dataCursos = await responseCursos.json();

        const rutasIds = lineRutas.map((r: { id_ruta: any }) => r.id_ruta);

        const cursosFiltrados = dataCursos.data.filter(
          (curso: any) =>
            curso.estado === "Publicado" &&
            curso.rutas.some((r: any) => rutasIds.includes(r.id_ruta))
        );

        setTotalCursos(cursosFiltrados.length);
      } catch (err) {
        console.error(err);
        setError("Hubo un problema al cargar la línea académica o las rutas.");
        setLineaData(null);
        setRutas([]);
        setFilteredRutas([]);
        setTotalCursos(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLineaYDatos();
  }, [slug]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = rutas.filter((ruta) =>
        ruta.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRutas(filtered);
    } else {
      setFilteredRutas(rutas);
    }
  }, [searchQuery, rutas]);

  if (loading) return <LoadingSpinner />;
  if (error || !lineaData) return <ErrorMessage />;

  return (
    <div className="text-white">
      <div className="flex flex-col md:flex-row px-10 py-8 gap-8 items-center">
        <div className="md:w-1/2 w-full">
          <div className="py-2 text-sm pb-6 text-gray-400">
            <Link
              to="/lineas-academicas"
              className="hover:underline cursor-pointer"
            >
              Líneas Académicas
            </Link>{" "}
            &gt; <span>{lineaData.nombre}</span>
          </div>

          <h1 className="text-4xl font-bold mb-6">{lineaData.nombre}</h1>
          <p className="text-[17px] text-gray-300 mb-6">
            {lineaData.descripcion}
          </p>

          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-yellow-400" />
              <span>
                {rutas.length} {rutas.length === 1 ? "Ruta" : "Rutas"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" />
              <span>
                {totalCursos} {totalCursos === 1 ? "Curso" : "Cursos"}
              </span>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 w-full flex justify-center">
          <img
            src={lineaData.imagen || "/default-image.jpg"}
            alt={lineaData.nombre}
            className="w-full max-h-80 object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>

      <div className="px-10 pb-5">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Rutas de esta Línea Académica
        </h2>

        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none"
            placeholder="Buscar rutas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredRutas.length === 0 ? (
          <div className="col-span-full flex items-center justify-center h-full min-h-24">
            <p className="text-gray-200 text-xl">
              No se encontraron rutas que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <LineasAcademicasGrid lineas={filteredRutas} linea={lineaData} />
        )}
      </div>
    </div>
  );
}

export default LineaAcademicaPage;
