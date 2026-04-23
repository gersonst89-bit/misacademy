import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaBroom } from "react-icons/fa";
import { API_URL } from "../config/api";

type Status = "idle" | "loading" | "success" | "error";

type Certificacion = {
  id_certificacion: number;
  id_usuario: number;
  id_curso: number;
  fecha_emision: string;
  codigo_certificado: string;
  calificacion_final: number | string;
  url_certificado: string | null;
  tipo_certificado: string;
  nombre_curso: string | null;
  nombre_estudiante: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  total_horas: number | string | null;
  email_destinatario: string | null;
  usuario?: any;
  curso?: any;
};

const API_BASE = API_URL;

/* =======================
   Helpers
======================= */

function fmt(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function fmtDate(value: any) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

function getNombreCompleto(usuario: any) {
  if (!usuario) return null;
  const nombre = usuario?.nombre ?? "";
  const apellido = usuario?.apellido ?? "";
  const full = `${nombre} ${apellido}`.trim();
  return full || null;
}

function getCursoNombre(curso: any) {
  if (!curso) return null;
  return (
    curso?.nombre ??
    curso?.nombre_curso ??
    curso?.titulo ??
    curso?.title ??
    null
  );
}

/* =======================
   Component
======================= */

export default function ConsultarCertificado() {
  const [codigo, setCodigo] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<Certificacion[]>([]);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  /* =======================
     Toast auto hide
  ======================= */
  useEffect(() => {
    if (status !== "idle" && message) {
      setIsMessageVisible(true);
      const timer = setTimeout(() => setIsMessageVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, message]);

  /* =======================
     Campos a mostrar
  ======================= */
  const fields = useMemo(
    () => [
      { label: "ID Certificación", getValue: (d: Certificacion) => fmt(d.id_certificacion) },
      { label: "Código del Certificado", getValue: (d: Certificacion) => fmt(d.codigo_certificado) },
      { label: "Tipo de Certificado", getValue: (d: Certificacion) => fmt(d.tipo_certificado) },
      { label: "Fecha de Emisión", getValue: (d: Certificacion) => fmtDate(d.fecha_emision) },
      { label: "Calificación Final", getValue: (d: Certificacion) => fmt(d.calificacion_final) },
      {
        label: "Estudiante",
        getValue: (d: Certificacion) =>
          fmt(d.nombre_estudiante ?? getNombreCompleto(d.usuario)),
      },
      {
        label: "Correo Electrónico",
        getValue: (d: Certificacion) =>
          fmt(d.email_destinatario ?? d.usuario?.email),
      },
      {
        label: "Curso",
        getValue: (d: Certificacion) =>
          fmt(d.nombre_curso ?? getCursoNombre(d.curso)),
      },
    ],
    []
  );

  /* =======================
     Buscar certificados
  ======================= */
  const buscar = async (c?: string) => {
    const code = (c ?? codigo).trim();

    if (!code) {
      setStatus("error");
      setMessage("Ingresa un código o nombre para buscar.");
      setData([]);
      return;
    }

    setStatus("loading");
    setMessage("Buscando certificados...");
    setData([]);

    try {
      const res = await fetch(
        `${API_BASE}/certificaciones/buscar?buscar=${encodeURIComponent(code)}`,
        {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }
      );

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setMessage(payload?.message ?? "Error consultando certificados.");
        return;
      }

      if (Array.isArray(payload) && payload.length > 0) {
        setData(payload);
        setStatus("success");
        setMessage(`Se encontraron ${payload.length} certificados.`);
      } else {
        setStatus("error");
        setMessage("No se encontraron certificados.");
        setData([]);
      }
    } catch {
      setStatus("error");
      setMessage("No se pudo conectar con el servidor.");
      setData([]);
    }
  };

  /* =======================
     Limpiar
  ======================= */
  const limpiar = () => {
    setCodigo("");
    setStatus("idle");
    setMessage("");
    setData([]);
  };

  /* =======================
     Autoload por URL
  ======================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("codigo");
    if (c) {
      setCodigo(c);
      void buscar(c);
    }
  }, []);

  /* =======================
     Agrupar por persona
  ======================= */
  const certificadosPorPersona = useMemo(() => {
    return data.reduce((acc: Record<string, Certificacion[]>, cert) => {
      const persona =
        cert.nombre_estudiante ??
        getNombreCompleto(cert.usuario) ??
        "Sin nombre";

      if (!acc[persona]) acc[persona] = [];
      acc[persona].push(cert);
      return acc;
    }, {});
  }, [data]);

  /* =======================
     Render
  ======================= */
  return (
    <div className="min-h-[85vh] w-full px-6 py-14 text-white bg-gradient-to-br from-[#0E1C2B] via-[#0B1623] to-[#060D18]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-3">
          Consulta de Certificados
        </h1>
        <p className="text-center text-gray-300 mb-10">
          Ingresa el código o nombre completo para validar certificados.
        </p>

        {/* Buscar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-6">
          <input
            className="w-full rounded-xl px-4 py-3 bg-[#0B1523] border border-sky-500/30 outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Buscar por código o nombre completo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void buscar()}
          />

          <button
            onClick={() => void buscar()}
            disabled={status === "loading"}
            className="rounded-xl px-6 py-3 bg-sky-400 hover:bg-sky-500 font-semibold transition flex items-center gap-2 disabled:opacity-50"
          >
            <FaSearch />
            {status === "loading" ? "Buscando..." : "Buscar"}
          </button>

          <button
            onClick={limpiar}
            className="rounded-xl px-6 py-3 bg-gray-400 hover:bg-gray-500 font-semibold transition flex items-center gap-2"
          >
            <FaBroom />
            Limpiar
          </button>
        </div>

        {/* Toast */}
        {status !== "idle" && message && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg border-l-4 z-50 transition-opacity duration-500
              ${
                status === "error"
                  ? "border-red-500 text-red-300 bg-[#1A0E12]"
                  : status === "success"
                  ? "border-emerald-500 text-emerald-300 bg-[#0E1A16]"
                  : "border-sky-500 text-sky-300 bg-[#0D1A28]"
              }
              ${isMessageVisible ? "opacity-100" : "opacity-0"}
            `}
          >
            {message}
          </div>
        )}

        {/* Resultados */}
        {Object.keys(certificadosPorPersona).length > 0 && (
          <div className="space-y-10 mt-8">
            {Object.entries(certificadosPorPersona).map(
              ([persona, certs]) => (
                <div key={persona} className="space-y-4">
                  <h2 className="text-xl font-bold text-sky-400">
                    {persona}
                  </h2>

                  {certs.map((cert, i) => (
                    <div
                      key={i}
                      className="overflow-x-auto border border-sky-500/20 rounded-xl"
                    >
                      <table className="min-w-full text-sm">
                        <tbody>
                          {fields.map((f, idx) => (
                            <tr key={idx} className="border-t border-sky-500/10">
                              <td className="px-4 py-3 font-semibold text-sky-300 bg-[#0B1523] whitespace-nowrap">
                                {f.label}
                              </td>
                              <td className="px-4 py-3 text-white">
                                {f.getValue(cert)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Sin resultados */}
        {status === "error" && data.length === 0 && (
          <div className="mt-20 text-center text-gray-300">
            <p className="text-lg font-semibold text-white">
              No se encontró información
            </p>
            <p>Verifica los datos e inténtalo nuevamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
