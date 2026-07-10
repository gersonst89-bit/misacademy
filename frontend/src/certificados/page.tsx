"use client";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { API_URL } from "../config/api";
import { apiClient } from "../services/apiClient";

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

interface CertificadoCardProps {
  c: Certificacion;
  ajustarFechaPeru: (f: string) => string;
  solicitarCertificado: (id: number) => Promise<void>;
}

const CertificadoCard: React.FC<CertificadoCardProps> = ({ c, ajustarFechaPeru, solicitarCertificado }) => {
  const aprobado = c.calificacion_final !== null;
          
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col sm:flex-row bg-gradient-to-br from-[#0E1C2B] to-[#0a1120] rounded-2xl shadow-2xl overflow-hidden border border-white/10 group cursor-default"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="sm:w-56 w-full h-56 sm:h-auto relative overflow-hidden" style={{ transform: "translateZ(20px)" }}>
        <img
          src={c.curso.imagen || "/sinCurso.jpg"}
          alt={c.curso.nombre}
          onError={(e) => (e.currentTarget.src = "/sinCurso.jpg")}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-sky-950/20" />
      </div>

      <div className="flex-1 p-8 flex flex-col justify-between relative" style={{ transform: "translateZ(30px)" }}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-sky-400 font-bold">Certificado Oficial</span>
            <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-3 group-hover:text-sky-300 transition-colors">
            {c.curso.nombre}
          </h2>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-gray-400 text-sm">
              <FaCalendarAlt className="text-sky-500" />
              Emitido el {ajustarFechaPeru(c.fecha_emision)}
            </p>

            <p className="text-gray-400 text-sm font-mono">
              <span className="text-gray-500">ID:</span> {c.codigo_certificado}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4 relative z-10">
          <button
            disabled={!aprobado}
            onClick={() => solicitarCertificado(c.curso.id_curso)}
            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg
            ${
              aprobado
                ? "bg-sky-600 hover:bg-sky-500 text-white hover:shadow-sky-500/20 active:scale-95"
                : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
            }`}
          >
            {aprobado ? "Ver Certificado" : "Pendiente"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

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
    // Eliminamos la comprobación manual de cookies por ser HttpOnly.

    try {
      const response = await apiClient.post("/certificaciones/solicitar", { id_curso: certificadoId }).catch((err: any) => {
        alert(err?.response?.data?.message || "No se pudo cargar el certificado");
        return null;
      });

      if (!response) return;

      const data = response.data;

      if (data.codigo_certificado) {
        // Redirigir a la página de visualización del certificado
        navigate(`/certificado/${data.codigo_certificado}`);
      } else {
        alert(data.message || "No se pudo cargar el certificado");
      }
    } catch (error) {
      alert("Hubo un error al solicitar el certificado.");
    }
  };

  useEffect(() => {
    const fetchCertificados = async () => {
      // Eliminamos la comprobación manual de cookies ya que son HttpOnly y no son visibles para JS.
      // El servidor se encargará de validar la sesión y el interceptor global manejará el 401 si es necesario.
      try {
        const res = await apiClient.get("/certificaciones/mis-certificados");
        const data = res.data;

        // El endpoint mis-certificados devuelve un array directamente
        const allCerts = Array.isArray(data) ? data : (data.data || []);
        setCertificados(allCerts);
      } catch (err) {
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

      <div className="space-y-8 max-w-4xl mx-auto">
        {certificadosOrdenados.map((c) => (
          <CertificadoCard 
            key={c.id_certificacion} 
            c={c} 
            ajustarFechaPeru={ajustarFechaPeru} 
            solicitarCertificado={solicitarCertificado} 
          />
        ))}
      </div>
    </div>
  );
}
