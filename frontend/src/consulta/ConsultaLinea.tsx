import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaTimes, FaExternalLinkAlt, FaUser, FaIdCard, FaAward } from "react-icons/fa";
import { API_URL } from "../config/api";
import { apiClient } from "../services/apiClient";

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
  const [tipo, setTipo] = useState<"nombre" | "dni" | "codigo">("codigo");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<Certificacion[]>([]);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const placeholderText = useMemo(() => {
    if (tipo === "nombre") return "Nombres y apellidos del estudiante...";
    if (tipo === "dni") return "DNI del estudiante...";
    return "Código del certificado (ej: CERT-XXXX o MIS-XXXX)...";
  }, [tipo]);

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
  const buscar = async (c?: string, explicitTipo?: string) => {
    const code = (c ?? codigo).trim();
    const activeTipo = explicitTipo ?? tipo;

    if (!code) {
      setStatus("error");
      const errorMsg =
        activeTipo === "nombre"
          ? "Ingresa nombres y apellidos para buscar."
          : activeTipo === "dni"
          ? "Ingresa un DNI para buscar."
          : "Ingresa un código de certificado para buscar.";
      setMessage(errorMsg);
      setData([]);
      return;
    }

    setStatus("loading");
    setMessage("Buscando certificados...");
    setData([]);

    try {
      const res = await apiClient.get(`/certificaciones/buscar?buscar=${encodeURIComponent(code)}&tipo=${activeTipo}`).catch((err: any) => {
        const payload = err?.response?.data;
        setStatus("error");
        setMessage(payload?.message ?? "Error consultando certificados.");
        return null;
      });

      if (!res) return;

      const payload = res.data;

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
      void buscar(c, "codigo");
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

  return (
    <div className="min-h-screen w-full px-6 py-24 text-white bg-[#03070C] relative overflow-hidden">
      {/* Elementos decorativos / Glows de fondo */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[130px] -z-0 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] -z-0 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Consulta de <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Certificados</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Valida la autenticidad de tus logros académicos seleccionando el tipo de búsqueda e ingresando el dato correspondiente.
          </p>
        </div>

        {/* Selector de Tipo de Búsqueda (Fila limpia de 3 columnas de igual ancho) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 max-w-2xl mx-auto bg-white/[0.01] border border-white/5 p-2 rounded-3xl backdrop-blur-xl">
          {(["codigo", "dni", "nombre"] as const).map((t) => {
            const isActive = tipo === t;
            let Icon = FaAward;
            let label = "Código";
            if (t === "dni") {
              Icon = FaIdCard;
              label = "DNI Estudiante";
            } else if (t === "nombre") {
              Icon = FaUser;
              label = "Nombre Completo";
            }
            return (
              <button
                key={t}
                onClick={() => {
                  setTipo(t);
                  setStatus("idle");
                  setMessage("");
                }}
                className={`flex items-center justify-center gap-2.5 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/10 scale-102"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-gray-500"} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador Premium con Limpieza Integrada de forma elegante */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 mb-12">
          <div className="relative flex-1 w-full group flex items-center">
            <FaSearch className="absolute left-6 text-gray-500 group-focus-within:text-sky-400 transition-colors" />
            <input
              className="w-full bg-transparent border-none rounded-2xl pl-14 pr-12 py-4 text-base md:text-lg font-medium outline-none focus:ring-0 placeholder:text-gray-600 transition-all text-white"
              placeholder={placeholderText}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void buscar()}
            />
            {codigo && (
              <button
                onClick={limpiar}
                className="absolute right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                title="Limpiar"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>

          <div className="w-full md:w-auto p-1 md:p-0">
            <button
              onClick={() => void buscar()}
              disabled={status === "loading"}
              className="w-full md:w-auto rounded-[1.5rem] px-10 py-4.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:scale-[1.02] font-black uppercase text-xs tracking-[0.2em] text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-500/20 active:scale-95"
            >
              {status === "loading" ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaSearch />
              )}
              {status === "loading" ? "Buscando" : "Validar"}
            </button>
          </div>
        </div>

        {/* Toast Notificación */}
        {status !== "idle" && message && (
          <div
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl border backdrop-blur-xl z-50 transition-all duration-500 shadow-2xl flex items-center gap-3
              ${
                status === "error"
                  ? "border-rose-500/50 text-rose-200 bg-rose-500/10"
                  : status === "success"
                  ? "border-emerald-500/50 text-emerald-200 bg-emerald-500/10"
                  : "border-sky-500/50 text-sky-200 bg-sky-500/10"
              }
              ${isMessageVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}
            `}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              status === "error" ? "bg-rose-500" : status === "success" ? "bg-emerald-500" : "bg-sky-500"
            }`} />
            <span className="text-sm font-bold tracking-tight">{message}</span>
          </div>
        )}

        {/* Listado de Resultados */}
        {Object.keys(certificadosPorPersona).length > 0 && (
          <div className="space-y-24 mt-32 animate-fadeIn pb-32">
            {Object.entries(certificadosPorPersona).map(
              ([persona, certs]) => (
                <div key={persona} className="space-y-16">
                  <div className="flex items-center gap-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
                    <h2
                      className="text-xl md:text-3xl font-black text-white uppercase px-8 text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      style={{ letterSpacing: '0.4em' }}
                    >
                      {persona}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-sky-500/30 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {certs.map((cert, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-sky-500/40 transition-all duration-500 group relative"
                      >
                        <button
                          onClick={() => window.open(`/certificado/${cert.codigo_certificado}`, '_blank')}
                          className="absolute top-0 right-0 p-8 z-20 group/btn"
                        >
                          <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover/btn:scale-110 group-hover/btn:bg-sky-500 group-hover/btn:text-black transition-all">
                            <FaExternalLinkAlt size={18} />
                          </div>
                        </button>

                        <div className="p-10 space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                            {fields.map((f, idx) => (
                              <div key={idx} className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500/60">
                                  {f.label}
                                </span>
                                <span className="text-sm md:text-base font-bold text-gray-200 group-hover:text-white transition-colors">
                                  {f.getValue(cert)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => window.open(`/certificado/${cert.codigo_certificado}`, '_blank')}
                            className="w-full mt-4 py-4 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-black border border-sky-500/20 hover:border-sky-500 font-black uppercase text-xs tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 group/btn2"
                          >
                            <FaExternalLinkAlt size={14} className="group-hover/btn2:rotate-12 transition-transform" />
                            Ver Diploma Oficial
                          </button>
                        </div>
                        <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Documento Verificado</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Sin resultados */}
        {status === "error" && data.length === 0 && (
          <div className="mt-32 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <FaSearch size={32} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Sin resultados</h3>
            <p className="text-gray-500 font-medium">Verifica los datos e inténtalo nuevamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
