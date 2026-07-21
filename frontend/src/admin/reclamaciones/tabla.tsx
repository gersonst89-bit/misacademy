"use client";

import { useEffect, useState, useRef } from "react";
import {
  IoSearchOutline,
  IoEyeOutline,
  IoFilterOutline,
} from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import { BookOpen } from "lucide-react";
import { CustomDatePicker } from "../Components/CustomDatePicker";
import DetalleReclamacionModal from "./DetalleReclamacionModal";
import { apiClient } from "../../services/apiClient";

interface Reclamacion {
  id: number;
  nombre_completo: string;
  dni: string;
  email: string;
  tipo_reclamo: string;
  asunto: string;
  descripcion: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

/* ─── Filtro Estado Dropdown ─── */
function FiltroEstado({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const estados = [
    { value: "", label: "Todos", color: "text-sky-600", bg: "bg-sky-50" },
    { value: "pendiente", label: "Pendiente", color: "text-amber-600", bg: "bg-amber-50" },
    { value: "en_revision", label: "En Revisión", color: "text-sky-600", bg: "bg-sky-50" },
    { value: "resuelto", label: "Resuelto", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const current = estados.find((e) => e.value === value) || estados[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            value === "resuelto"
              ? "bg-emerald-500 animate-pulse"
              : value === "en_revision"
              ? "bg-sky-500"
              : value === "pendiente"
              ? "bg-amber-500"
              : "bg-slate-400"
          }`}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">
          {current.label}
        </span>
        <FaChevronDown
          className={`text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180 text-sky-500" : ""
          }`}
          size={10}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => {
                onChange(e.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${
                  value === e.value
                    ? `${e.bg} ${e.color} shadow-sm`
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  e.value === "resuelto"
                    ? "bg-emerald-500"
                    : e.value === "en_revision"
                    ? "bg-sky-500"
                    : e.value === "pendiente"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              />
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Filtro Tipo Reclamo Dropdown ─── */
function FiltroTipo({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const tipos = [
    { value: "", label: "Todos los tipos" },
    { value: "Producto/Servicio", label: "Producto/Servicio" },
    { value: "Pago", label: "Pago" },
    { value: "Otros", label: "Otros" },
  ];

  const current = tipos.find((t) => t.value === value) || tipos[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <IoFilterOutline size={14} className="text-slate-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">
          {current.label}
        </span>
        <FaChevronDown
          className={`text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180 text-sky-500" : ""
          }`}
          size={10}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          {tipos.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                onChange(t.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1
                ${
                  value === t.value
                    ? "bg-sky-50 text-sky-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Estado Badge ─── */
function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { color: string; dot: string; label: string }> = {
    pendiente: {
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
      dot: "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]",
      label: "Pendiente",
    },
    en_revision: {
      color: "bg-sky-500/10 text-sky-600 border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]",
      dot: "bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]",
      label: "En Revisión",
    },
    resuelto: {
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
      dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
      label: "Resuelto",
    },
  };

  const c = config[estado] || config.pendiente;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.12em] border backdrop-blur-md transition-all duration-500 ${c.color}`}
    >
      <div className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </div>
  );
}

/* ─── Componente Principal ─── */
export default function ReclamacionesAdmin() {
  const [reclamaciones, setReclamaciones] = useState<Reclamacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [seleccionada, setSeleccionada] = useState<Reclamacion | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEffect(() => {
    obtenerReclamaciones();
  }, [pagina, estadoFiltro, tipoFiltro, fechaInicio, fechaFin]);

  const obtenerReclamaciones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/reclamaciones", {
        params: {
          page: pagina,
          per_page: 15,
          estado: estadoFiltro || undefined,
          tipo_reclamo: tipoFiltro || undefined,
          search: busqueda || undefined,
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
        },
      });
      const data = response.data;
      setReclamaciones(data.data || []);
      setTotalPaginas(data.last_page || 1);
      setTotalRegistros(data.total || 0);
    } catch (err) {
      console.error(err);
      setReclamaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPagina(1);
    obtenerReclamaciones();
  };

  const pendientes = reclamaciones.filter((r) => r.estado === "pendiente").length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-sm border border-red-100">
            <BookOpen size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              Gestión Legal
            </span>
            <span className="text-lg font-black text-slate-900 leading-tight tracking-tight">
              Libro de Reclamaciones
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {pendientes > 0 && (
            <div className="bg-amber-50 px-5 py-3 rounded-[1.25rem] border border-amber-100 flex items-center gap-4 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                  Pendientes
                </span>
                <span className="text-sm font-black text-amber-700 leading-none">
                  {pendientes} Reclamos
                </span>
              </div>
            </div>
          )}
          <div className="bg-white px-5 py-3 rounded-[1.25rem] border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Total Histórico
              </span>
              <span className="text-sm font-black text-slate-900 leading-none">
                {totalRegistros} Reclamaciones
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100">
        <FiltroEstado value={estadoFiltro} onChange={setEstadoFiltro} />
        <FiltroTipo value={tipoFiltro} onChange={setTipoFiltro} />

        <div className="w-full">
          <CustomDatePicker
            value={fechaInicio}
            onChange={setFechaInicio}
            placeholder="Fecha Inicio"
          />
        </div>

        <div className="w-full">
          <CustomDatePicker
            value={fechaFin}
            onChange={setFechaFin}
            placeholder="Fecha Fin"
          />
        </div>

        <div className="relative">
          <IoSearchOutline
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            placeholder="Nombre, DNI..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>

        <button
          onClick={handleBuscar}
          className="bg-sky-500 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 py-3 md:py-3.5"
        >
          <IoSearchOutline size={18} /> Filtrar
        </button>
      </div>

      {/* Tabla Desktop + Cards Mobile */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  ID
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Reclamante
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Tipo
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Asunto
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Estado
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Fecha
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 font-medium uppercase text-[10px] font-black tracking-widest">
                        Cargando reclamaciones...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : reclamaciones.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest"
                  >
                    No se encontraron reclamaciones con estos filtros
                  </td>
                </tr>
              ) : (
                reclamaciones.map((rec) => (
                  <tr
                    key={rec.id}
                    className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative"
                  >
                    <td className="px-6 py-5">
                      <span className="text-[13px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight">
                        REC-{String(rec.id).padStart(5, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-white shadow-sm">
                          {rec.nombre_completo.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 tracking-tight leading-tight">
                            {rec.nombre_completo}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-0.5">
                            DNI: {rec.dni}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {rec.tipo_reclamo}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-600 leading-tight line-clamp-2 max-w-[200px] block">
                        {rec.asunto}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <EstadoBadge estado={rec.estado} />
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                        {new Date(rec.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setSeleccionada(rec)}
                          className="p-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all duration-300 bg-white border border-slate-100 shadow-sm"
                          title="Ver Detalle"
                        >
                          <IoEyeOutline
                            size={18}
                            className="hover:scale-110 transition-transform"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-10 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                Cargando...
              </span>
            </div>
          ) : reclamaciones.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-medium italic">
              Sin reclamaciones registradas
            </div>
          ) : (
            reclamaciones.map((rec) => (
              <div
                key={rec.id}
                className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-900 leading-tight">
                      REC-{String(rec.id).padStart(5, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(rec.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <EstadoBadge estado={rec.estado} />
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 font-black shadow-sm border border-slate-100 flex-shrink-0">
                    {rec.nombre_completo.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-700 leading-tight truncate">
                      {rec.nombre_completo}
                    </span>
                    <span className="text-[8px] text-sky-500 font-black uppercase tracking-widest mt-0.5">
                      {rec.tipo_reclamo} · DNI: {rec.dni}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                  <span className="font-black text-slate-700">{rec.asunto}</span>{" "}
                  — {rec.descripcion}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setSeleccionada(rec)}
                    className="w-full py-2.5 text-sky-500 bg-sky-50 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky-100 transition-colors"
                  >
                    <IoEyeOutline size={16} /> Ver Detalle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Página{" "}
                <span className="text-sky-600">{pagina}</span> de{" "}
                {totalPaginas}
              </span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Registros: {totalRegistros}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || loading}
              className="flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas || loading}
              className="flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 transition-all shadow-md disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {seleccionada && (
        <DetalleReclamacionModal
          reclamacion={seleccionada}
          onClose={() => setSeleccionada(null)}
          onUpdated={obtenerReclamaciones}
        />
      )}
    </div>
  );
}
