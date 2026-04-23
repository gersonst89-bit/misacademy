"use client";

import { useEffect, useState } from "react";
import { FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
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
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 28;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-[56px] h-[56px] flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#374151"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#22c55e"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s ease",
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-white font-bold text-sm">
        {percentage}%
      </span>
    </div>
  );
};

interface Curso {
  id_curso: number;
  nombre: string;
  descripcion?: string;
  imagen?: string | null;
}

interface Compra {
  id_pago: number;
  fecha_pago: string;
  precio: number;
  curso: Curso;
  progreso?: number; 

}

export default function MisCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [orden, setOrden] = useState<"reciente" | "antiguo">("reciente");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const ajustarFechaPeru = (fechaStr: string) => {
    const fechaISO = fechaStr.replace(" ", "T");
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Lima",
    });
  };

  useEffect(() => {
    const fetchCompras = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Debes iniciar sesión para ver tus compras.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/compras/historial`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        console.log("📦 Datos de historial compras:", data);

       if (res.ok && data.status === "success" && Array.isArray(data.compras)) {
  const comprasConProgreso = await Promise.all(
    data.compras.map(async (compra: Compra) => {
      try {
        const progresoRes = await fetch(`${API_URL}/cursos/${compra.curso.id_curso}/progreso`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const progresoData = await progresoRes.json();
        console.log("🔥 PROGRESO API:", progresoData);

        return {
          ...compra,
        progreso: progresoData.curso?.progreso_total ?? 0
        };
      } catch {
        return { ...compra, progreso: 0 };
      }
    })
  );

  setCompras(comprasConProgreso);
}
 else {
          setError(data.mensaje || "No se pudieron cargar tus compras.");
        }
      } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        setError("Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, []);

  const comprasOrdenadas = [...compras].sort((a, b) => {
    const fechaA = new Date(a.fecha_pago).getTime();
    const fechaB = new Date(b.fecha_pago).getTime();
    return orden === "reciente" ? fechaB - fechaA : fechaA - fechaB;
  });

  if (loading) return <LoadingSpinner />;

  if (error || comprasOrdenadas.length === 0)
    return (
      <div className="p-8 bg-[#0b1c2c] min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Aún no tienes ningún curso comprado
        </h1>
        <p className="text-gray-400 mb-8 text-center">
          Cuando tu pago sea confirmado como{" "}
          <span className="text-green-400">Completado</span>, tus cursos
          aparecerán aquí.
        </p>
      </div>
    );

  // Navegación automática a la primera lección disponible
  const handleCompraClick = async (curso: Curso) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/cursos/${curso.id_curso}/progreso`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      // Buscar la primera lección disponible, en progreso o completada
      let leccionId: number | null = null;
      if (data && data.modulos && Array.isArray(data.modulos)) {
        for (const modulo of data.modulos) {
          if (modulo.lecciones && Array.isArray(modulo.lecciones) && modulo.lecciones.length > 0) {
            // Buscar en orden de prioridad: disponible > en progreso > completada
            const disponible = modulo.lecciones.find((l: any) => l.estado === "disponible");
            const enProgreso = modulo.lecciones.find((l: any) => l.estado === "en_progreso");
            const completada = modulo.lecciones.find((l: any) => l.estado === "completada");
            
            const leccionEncontrada = disponible || enProgreso || completada || modulo.lecciones[0];
            if (leccionEncontrada) {
              leccionId = leccionEncontrada.id;
              break;
            }
          }
        }
      }
      if (leccionId) {
        navigate(`/curso/${curso.id_curso}/leccion/${leccionId}`);
      } else {
        // Si no hay lecciones, mostrar detalle del curso
        const slug = curso.nombre.toLowerCase().replace(/\s+/g, '-');
        navigate(`/curso-detalle/${slug}`);
      }
    } catch (err) {
      console.error("Error al consultar progreso del curso:", err);
      navigate(`/curso/${curso.id_curso}`);
    }
  };

  return (
    <div className="p-8 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Mis Compras
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
        {comprasOrdenadas.map((compra) => (
          <div
            key={`${compra.id_pago}-${compra.curso.id_curso}`}
            onClick={() => handleCompraClick(compra.curso)}
            className="flex flex-col sm:flex-row bg-[#0E1C2B] rounded-2xl shadow-lg overflow-hidden hover:scale-[1.01] hover:bg-[#122437] transition-transform duration-300 border border-gray-700 cursor-pointer"
          >
            <div className="sm:w-48 w-full h-48 sm:h-auto">
              <img
                src={
                  compra.curso.imagen ||
                  "https://cdn-icons-png.flaticon.com/512/2920/2920244.png"
                }
                alt={compra.curso.nombre}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {compra.curso.nombre}
                </h2>
                <p className="text-sm text-gray-400 mb-3 line-clamp-3">
                  {compra.curso.descripcion || "Curso sin descripción"}
                </p>

                <div className="flex flex-col gap-2 text-gray-300">
                  <p className="flex items-center gap-2 text-lg font-semibold text-white">
                    <FaMoneyBillWave className="text-white" /> S/.{" "}
                    {Number(compra.precio).toFixed(2)}
                  </p>
                  <p className="flex items-center gap-2 text-gray-400">
                    <FaCalendarAlt className="text-white" />{" "}
                    {ajustarFechaPeru(compra.fecha_pago)}
                  </p>
                </div>
              </div>
                <div className="mt-4 flex justify-start">
    <CircularProgress percentage={compra.progreso || 0} />
  </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
