"use client";

import { useEffect, useState, useRef } from "react";
import { IoCardOutline, IoWalletOutline, IoCalendarOutline, IoFilterOutline, IoSearchOutline, IoCreateOutline, IoTrashOutline } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import EditarPagoModal from "./EditarPagoModal";
import type { Pago } from "../../types/models";
import TipoPagoList from "./TipoPagoList";
import { CustomDatePicker } from "../Components/CustomDatePicker";
import { apiClient } from "../../services/apiClient";

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
    { value: "", label: "Estados", color: "text-sky-600", bg: "bg-sky-50" },
    { value: "COMPLETADO", label: "Completado", color: "text-emerald-600", bg: "bg-emerald-50" },
    { value: "PENDIENTE", label: "Pendiente", color: "text-amber-600", bg: "bg-amber-50" },
    { value: "REEMBOLSADO", label: "Reembolsado", color: "text-purple-600", bg: "bg-purple-50" },
    { value: "FALLIDO", label: "Fallido", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const current = estados.find(e => e.value === value) || estados[0];

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
        <div className={`w-1.5 h-1.5 rounded-full ${
          value === 'COMPLETADO' ? 'bg-emerald-500 animate-pulse' : 
          value === 'PENDIENTE' ? 'bg-amber-500' : 
          value === 'FALLIDO' ? 'bg-rose-500' : 
          value === 'REEMBOLSADO' ? 'bg-purple-500' : 'bg-sky-500'
        }`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{current.label}</span>
        <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
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
                ${value === e.value 
                  ? `${e.bg} ${e.color} shadow-sm` 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                e.value === 'COMPLETADO' ? 'bg-emerald-500' : 
                e.value === 'PENDIENTE' ? 'bg-amber-500' : 
                e.value === 'FALLIDO' ? 'bg-rose-500' : 
                e.value === 'REEMBOLSADO' ? 'bg-purple-500' : 'bg-sky-500'
              }`} />
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PagosAdminPage() {
  const [vista, setVista] = useState<"pagos" | "tipoPagos">("pagos");
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    if (vista === "pagos") obtenerPagos();
  }, [vista, pagina, estadoFiltro, fechaInicio, fechaFin]);

  const obtenerPagos = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(`/pagos`, {
        params: {
          page: pagina,
          per_page: 15,
          estado: estadoFiltro || undefined,
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined
        }
      });
      
      const data = response.data;
      setPagos(data.data || []);
      setTotalPaginas(data.last_page || 1);
    } catch (err) {
      console.error(err);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const eliminarPago = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente este registro de pago?")) return;
    
    try {
      await apiClient.delete(`/pagos/${id}`);
      obtenerPagos();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el registro");
    }
  };

  const actualizarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await apiClient.patch(`/pagos/${id}`, { estado: nuevoEstado });
      setPagoSeleccionado(null);
      obtenerPagos();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Tabs */}
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
        <div className="flex bg-slate-100/50 p-1 rounded-[1.25rem] border border-slate-200/50 w-full md:w-fit backdrop-blur-sm">
          <button
            onClick={() => setVista("pagos")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-[1rem] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500
              ${vista === "pagos" ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "text-slate-400 hover:text-slate-900 hover:bg-white/50"}
            `}
          >
            <IoCardOutline size={18} /> <span className="hidden sm:inline">Transacciones</span><span className="sm:hidden">Pagos</span>
          </button>
          <button
            onClick={() => setVista("tipoPagos")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-[1rem] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500
              ${vista === "tipoPagos" ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "text-slate-400 hover:text-slate-900 hover:bg-white/50"}
            `}
          >
            <IoWalletOutline size={18} /> <span className="hidden sm:inline">Métodos de Pago</span><span className="sm:hidden">Métodos</span>
          </button>
        </div>

        {vista === "pagos" && (
          <div className="flex items-center gap-3">
             <div className="w-full md:w-auto bg-white px-5 py-3 rounded-[1.25rem] border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Histórico</span>
                  <span className="text-sm font-black text-slate-900 leading-none">{pagos.length} Transacciones</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {vista === "pagos" && (
        <>
          {/* Filters Bar */}
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100">
            <FiltroEstado
              value={estadoFiltro}
              onChange={setEstadoFiltro}
            />

            <div className="w-full sm:w-auto">
              <CustomDatePicker
                value={fechaInicio}
                onChange={setFechaInicio}
                placeholder="Fecha Inicio"
              />
            </div>

            <div className="w-full sm:w-auto">
              <CustomDatePicker
                value={fechaFin}
                onChange={setFechaFin}
                placeholder="Fecha Fin"
              />
            </div>

            <button 
              onClick={obtenerPagos}
              className="bg-sky-500 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 py-3 md:py-3.5"
            >
              <IoSearchOutline size={18} /> Filtrar
            </button>
          </div>

          {/* Table Content */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            {/* Vista Desktop (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Transacción</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Usuario y Medio</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Monto</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Estado</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-gray-500 font-medium uppercase text-[10px] font-black tracking-widest">Cargando registros...</span>
                        </div>
                      </td>
                    </tr>
                  ) : pagos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">No se encontraron pagos con estos filtros</td>
                    </tr>
                  ) : (
                    pagos.map((pago) => (
                      <tr key={pago.id_pago} className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight">#{pago.id_pago}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">
                              {new Date(pago.fecha_pago).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-white shadow-sm">
                              {pago.usuario?.nombre?.charAt(0) || "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 tracking-tight leading-tight">{pago.usuario ? `${pago.usuario.nombre} ${pago.usuario.apellido}` : "Desconocido"}</span>
                              <span className="text-[9px] text-sky-500 font-black uppercase tracking-[0.2em] mt-0.5">{pago.tipo_pago?.nombre}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-base font-black text-slate-900 tracking-tighter leading-none">S/ {Number(pago.monto).toFixed(2)}</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">PEN</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.12em] border backdrop-blur-md transition-all duration-500
                            ${pago.estado.toLowerCase() === "completado" 
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : 
                              pago.estado.toLowerCase() === "pendiente" 
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]" :
                              "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]"}
                          `}>
                            <div className={`w-2 h-2 rounded-full ${
                              pago.estado.toLowerCase() === "completado" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" : 
                              pago.estado.toLowerCase() === "pendiente" ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" : 
                              "bg-rose-500"
                            }`} />
                            {pago.estado}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-500">
                            <button
                              onClick={() => setPagoSeleccionado(pago)}
                              className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all duration-300"
                              title="Editar Estado"
                            >
                              <IoCreateOutline size={18} className="hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => eliminarPago(pago.id_pago)}
                              className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-300"
                              title="Eliminar Pago"
                            >
                              <IoTrashOutline size={18} className="hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="md:hidden divide-y divide-slate-100">
              {loading ? (
                <div className="p-10 text-center">
                  <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Cargando...</span>
                </div>
              ) : pagos.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-medium italic">Sin transacciones registradas</div>
              ) : (
                pagos.map((pago) => (
                  <div key={pago.id_pago} className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[14px] font-black text-slate-900 leading-tight">#{pago.id_pago}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {new Date(pago.fecha_pago).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                       </div>
                       <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border
                          ${pago.estado.toLowerCase() === "completado" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                            pago.estado.toLowerCase() === "pendiente" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                       `}>
                          {pago.estado}
                       </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 font-black shadow-sm border border-slate-100 flex-shrink-0">
                          {pago.usuario?.nombre?.charAt(0) || "U"}
                       </div>
                       <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-700 leading-tight truncate">{pago.usuario ? `${pago.usuario.nombre} ${pago.usuario.apellido}` : "Desconocido"}</span>
                          <span className="text-[8px] text-sky-500 font-black uppercase tracking-widest mt-0.5">{pago.tipo_pago?.nombre}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-sm font-black text-slate-900 tracking-tighter">S/ {Number(pago.monto).toFixed(2)}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                      <button onClick={() => setPagoSeleccionado(pago)} className="p-2.5 text-amber-500 flex-1 flex justify-center"><IoCreateOutline size={20} /></button>
                      <button onClick={() => eliminarPago(pago.id_pago)} className="p-2.5 text-rose-500 flex-1 flex justify-center"><IoTrashOutline size={20} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Paginación Profesional Urban SaaS */}
            <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
                 <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Página <span className="text-sky-600">{pagina}</span> de {totalPaginas}
                    </span>
                 </div>
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registros: {pagos.length}</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1 || loading}
                  className="flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas || loading}
                  className="flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 transition-all shadow-md"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {pagoSeleccionado && (
            <EditarPagoModal
              pago={pagoSeleccionado}
              onClose={() => setPagoSeleccionado(null)}
              onActualizar={actualizarEstado}
            />
          )}
        </>
      )}

      {vista === "tipoPagos" && <TipoPagoList />}
    </div>
  );
}
