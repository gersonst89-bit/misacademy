"use client";

import { useEffect, useState } from "react";
import { FaStar, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL, BASE_URL } from "../config/api";

export const LoadingSpinner = () => (
  <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(14,28,43,0.95)',zIndex:9999,display:'flex',justifyContent:'center',alignItems:'center'}}>
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

interface Curso {
  id_curso: number;
  nombre: string;
  imagen?: string | null;
  descripcion?: string;
}

interface Resena {
  id_resena: number;
  calificacion: number;
  comentario: string;
  fecha_resena: string;
  curso: Curso;
}

export default function MisResenas() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [orden, setOrden] = useState<"reciente" | "antiguo">("reciente");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const ajustarFechaPeru = (fechaStr: string) => {
    if (!fechaStr) return "";
    const fechaISO = fechaStr.includes("T")
      ? fechaStr
      : fechaStr.replace(" ", "T");
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Lima",
    });
  };

  const getImagenCurso = (imagen?: string | null): string => {
    if (!imagen || imagen === "null" || imagen.trim() === "") {
      return "/sinCurso.jpg";
    }
    return imagen.startsWith("http")
      ? imagen
      : `${BASE_URL}${imagen}`;
  };

  useEffect(() => {
    const fetchResenas = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Debes iniciar sesión para ver tus reseñas.");
        setLoading(false);
        return;
      }

      try {
        let page = 1;
        let allResenas: any[] | ((prevState: Resena[]) => Resena[]) = [];
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(`${API_URL}/mis-resenas?page=${page}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });

          const data = await res.json();
          console.log(`Página ${page}:`, data);

          if (res.ok && data && Array.isArray(data.resenas)) {
            allResenas = [...allResenas, ...data.resenas];

            // Detectar si hay más páginas (depende de tu API)
            hasMore = data.nextPage !== null && data.nextPage !== undefined;

            // Avanzar página
            page++;
          } else {
            setError(
              data.message ||
                data.mensaje ||
                "No se pudieron cargar tus reseñas."
            );
            break;
          }
        }

        // Guardar todas las reseñas juntas
        setResenas(allResenas);
      } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        setError("Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchResenas();
  }, []);

  const resenasOrdenadas = [...resenas].sort((a, b) => {
    const fechaA = new Date(a.fecha_resena).getTime();
    const fechaB = new Date(b.fecha_resena).getTime();
    return orden === "reciente" ? fechaB - fechaA : fechaA - fechaB;
  });

  if (loading) return <LoadingSpinner />;

  if (error || resenasOrdenadas.length === 0)
    return (
      <div className="p-8 min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {error
            ? "No se pudieron cargar tus reseñas"
            : "Aún no has escrito ninguna reseña"}
        </h1>
        <p className="text-gray-400 mb-8 text-center">
          {error
            ? "Verifica tu conexión o vuelve a intentarlo más tarde."
            : "Cuando escribas reseñas de tus cursos, aparecerán aquí."}
        </p>
      </div>
    );

  return (
    <div className="p-8 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Mis Reseñas
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0E1C2B] p-4 rounded-xl border border-gray-700 mb-8">
        <label
          htmlFor="orden"
          className="text-gray-300 font-medium mb-2 sm:mb-0"
        >
          Ordenar por:
        </label>
        <select
          id="orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value as "reciente" | "antiguo")}
          className="bg-[#0b1c2c] text-gray-200 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="reciente">Más reciente primero</option>
          <option value="antiguo">Más antiguo primero</option>
        </select>
      </div>
      <div className="space-y-6">
        {resenasOrdenadas.map((resena) => (
          <div
            key={resena.id_resena}
            onClick={() =>
              navigate(
                `/curso/${resena.curso.nombre
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`
              )
            }
            className="flex flex-col sm:flex-row bg-[#0E1C2B] rounded-2xl shadow-lg overflow-hidden hover:scale-[1.01] hover:bg-[#122437] transition-transform duration-300 border border-gray-700 cursor-pointer"
          >
            <div className="sm:w-48 w-full h-48 sm:h-auto">
              <img
                src={getImagenCurso(resena.curso.imagen)}
                alt={resena.curso.nombre}
                onError={(e) => (e.currentTarget.src = "/sinCurso.jpg")}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {resena.curso.nombre}
                </h2>

                <div className="flex items-center mb-2 text-lg">
                  <FaStar className="text-amber-400 mr-2" />
                  <span className="font-semibold text-white">
                    {resena.calificacion.toFixed(1)}
                  </span>
                </div>

                <p className="text-gray-400 mb-3 line-clamp-3">
                  {resena.comentario || "Sin comentario"}
                </p>

                <p className="flex items-center gap-2 text-gray-400">
                  <FaCalendarAlt className="text-white" />
                  {ajustarFechaPeru(resena.fecha_resena)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
