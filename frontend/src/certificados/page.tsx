"use client";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
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
}

interface Certificacion {
  id_certificacion: number;
  fecha_emision: string;
  codigo_certificado: string;
  calificacion_final: string | null;
  url_certificado?: string | null;
  curso: Curso;
}

export default function MisCertificados() {
  const [certificados, setCertificados] = useState<Certificacion[]>([]);
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

  const solicitarCertificado = async (certificadoId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para solicitar el certificado.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/certificacion/solicitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_certificado: certificadoId }), // Enviamos el ID del certificado
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Certificado solicitado con éxito");
      } else {
        alert(data.message || "No se pudo solicitar el certificado");
      }
    } catch (error) {
      alert("Hubo un error al solicitar el certificado.");
    }
  };

  useEffect(() => {
    const fetchCertificados = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Debes iniciar sesión para ver tus certificados.");
        setLoading(false);
        return;
      }

      try {
        let page = 1;
        let all: Certificacion[] = [];
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(`${API_URL}/certificaciones?page=${page}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });

          const data = await res.json();
          console.log("Certificaciones:", data);

          if (res.ok && data && Array.isArray(data.data)) {
            all = [...all, ...data.data];
            hasMore = data.next_page_url !== null;
            page++;
          } else {
            setError(data.message || "No se pudieron cargar tus certificados.");
            break;
          }
        }

        setCertificados(all);
      } catch {
        setError("Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificados();
  }, []);

  const certificadosOrdenados = [...certificados].sort((a, b) => {
    const fechaA = new Date(a.fecha_emision).getTime();
    const fechaB = new Date(b.fecha_emision).getTime();
    return orden === "reciente" ? fechaB - fechaA : fechaA - fechaB;
  });

  if (loading) return <LoadingSpinner />;

  if (error || certificados.length === 0)
    return (
      <div className="p-8 min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {error
            ? "No se pudieron cargar tus certificados"
            : "Aún no tienes certificados disponibles"}
        </h1>
        <p className="text-gray-400 mb-8 text-center">
          {error
            ? "Verifica tu conexión o vuelve a intentarlo."
            : "Cuando completes cursos y apruebes, tus certificados aparecerán aquí."}
        </p>
      </div>
    );

  return (
    <div className="p-8 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Mis Certificados
      </h1>

      {/* SELECTOR DE ORDEN */}
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
        {certificadosOrdenados.map((c) => {
          const aprobado = c.calificacion_final !== null;

          return (
            <div
              key={c.id_certificacion}
              className="flex flex-col sm:flex-row bg-[#0E1C2B] rounded-2xl shadow-lg overflow-hidden border border-gray-700"
            >
              <div className="sm:w-48 w-full h-48 sm:h-auto">
                <img
                  src={c.curso.imagen || "/sinCurso.jpg"}
                  alt={c.curso.nombre}
                  onError={(e) => (e.currentTarget.src = "/sinCurso.jpg")}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {c.curso.nombre}
                  </h2>

                  <p className="flex items-center gap-2 text-gray-400 mb-2">
                    <FaCalendarAlt className="text-white" />
                    Emitido: {ajustarFechaPeru(c.fecha_emision)}
                  </p>

                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold">Código:</span>{" "}
                    {c.codigo_certificado}
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    disabled={!aprobado}
                    onClick={() => solicitarCertificado(c.id_certificacion)} // Llamada a la función
                    className={`px-5 py-2 rounded-lg font-semibold transition
    ${
      aprobado
        ? "bg-sky-600 hover:bg-sky-700 text-white"
        : "bg-gray-700 text-gray-400 cursor-not-allowed"
    }`}
                  >
                    Solicitar Certificado
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
