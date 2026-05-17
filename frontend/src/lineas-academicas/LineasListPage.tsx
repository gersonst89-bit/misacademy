import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { apiUrl } from "../config/api";
import { useToast } from "../hooks/useToast";
import { usePageTitle } from "../hooks/usePageTitle";

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

const LineasListPage = () => {
  const { showToast } = useToast();
  usePageTitle("Líneas Académicas");
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const response = await fetch(
          apiUrl("/lineas-academicas"),
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Error al obtener las líneas académicas");

        const data = await response.json();
        const publicadas = (data.data || []).filter(
          (linea: LineaAcademica) => linea.estado === "Publicado"
        );
        setLineas(publicadas);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las líneas académicas.");
        showToast("No se pudieron cargar las líneas académicas. Inténtalo de nuevo.", "error");
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
    <div className="min-h-screen text-white overflow-hidden pb-32">
      {/* Premium Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse animation-delay-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-sky-500/5 border border-sky-500/20 text-[11px] font-black uppercase tracking-widest text-sky-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Especializaciones
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-['Outfit'] uppercase tracking-tighter leading-[1.1] drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-400">
              Líneas Académicas
            </span>
            <br />
            <span className="text-white/40">MIS Academy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 max-w-2xl font-medium leading-relaxed">
            Explora nuestras áreas de especialización en tecnología e innovación. Aprende, domina y transforma tu futuro digital.
          </p>

          <a
            href="#lineas"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Explorar Rutas
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* Grid de Líneas */}
      <section id="lineas" className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lineas.length > 0 ? (
            lineas.map((linea, index) => (
              <Link
                to={`/lineas-academicas/${slugify(linea.slug || linea.nombre)}`}
                key={linea.id_linea || `list-linea-${index}`}
                className="group relative flex flex-col bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-3 hover:bg-white/[0.04] hover:border-sky-500/30 transition-all duration-500"
              >
                <div className="relative h-60 w-full rounded-[2rem] overflow-hidden bg-black/50 mb-6">
                  <div className="absolute inset-0 bg-sky-500/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500" />
                  <img
                    src={linea.imagen || "/ejemplo2.jpg"}
                    alt={linea.nombre}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/ejemplo2.jpg"; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03070c] via-transparent to-transparent z-10" />
                </div>

                <div className="px-5 pb-5 flex-1 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-black font-['Outfit'] uppercase tracking-tight text-white mb-3 group-hover:text-sky-400 transition-colors">
                    {linea.nombre}
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed mb-8 flex-1 line-clamp-3 group-hover:text-white/60 transition-colors">
                    {linea.descripcion}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-500/50 group-hover:text-sky-400 transition-colors">
                      Ver detalle
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-sky-500 group-hover:border-sky-400 group-hover:text-black transition-all duration-500 shadow-lg">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-white/40 font-bold uppercase tracking-widest text-sm col-span-full py-20">
              No hay líneas académicas disponibles.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default LineasListPage;


