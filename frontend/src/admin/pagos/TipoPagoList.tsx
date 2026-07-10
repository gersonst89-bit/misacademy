import { useEffect, useState } from "react";
import { IoSearchOutline, IoAddOutline, IoCreateOutline, IoWalletOutline } from "react-icons/io5";
import AgregarTipoPagoModal from "./AgregarTipoPagoModal";
import EditarTipoPagoModal from "./EditarTipoPagoModal";
import { apiClient } from "../../services/apiClient";

interface TipoPago {
  id_tipo_pago: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean | number;
  comision?: number | string | null;
  codigo_referencia?: string | null;
}

export default function TipoPagoList() {
  const [tipos, setTipos] = useState<TipoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPago | null>(null);



  useEffect(() => {
    obtenerTipos();
  }, []);

  const obtenerTipos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tipos-pagos`);

      const data = response.data;
      const lista = Array.isArray(data.tipos_pagos) ? data.tipos_pagos : [];
      setTipos(lista);
    } catch (err) {
      console.error("❌ Error al obtener tipos de pago:", err);
      setError("Error al cargar los tipos de pago");
    } finally {
      setLoading(false);
    }
  };

  const tiposFiltrados = tipos
    .filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      const activoA = Boolean(a.activo);
      const activoB = Boolean(b.activo);
      if (activoA && !activoB) return -1;
      if (!activoA && activoB) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative w-full md:max-w-md group">
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" size={20} />
          <input
            type="text"
            placeholder="Buscar método de pago..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button
          onClick={() => setMostrarAgregar(true)}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-[10px] md:text-[11px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-lg group whitespace-nowrap"
        >
          <IoAddOutline size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Nuevo Método
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Vista Desktop (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Método de Pago</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Descripción</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 text-center">Comisión</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sincronizando métodos...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-rose-500 font-bold uppercase tracking-widest text-[10px]">{error}</td>
                </tr>
              ) : tiposFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center gap-2 grayscale opacity-40">
                        <IoWalletOutline size={40} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-500">No se encontraron métodos</span>
                     </div>
                  </td>
                </tr>
              ) : (
                tiposFiltrados.map((tipo) => (
                  <tr key={tipo.id_tipo_pago} className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-[1.25rem] bg-slate-100 text-slate-600 flex items-center justify-center border border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                           <IoWalletOutline size={22} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">{tipo.nombre}</span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: #{tipo.id_tipo_pago}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xs">{tipo.descripcion || "Sin descripción adicional"}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-black text-slate-900 leading-none">{Number(tipo.comision || 0).toFixed(2)}%</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Service Fee</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.12em] border backdrop-blur-md transition-all duration-500
                        ${tipo.activo 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                          : "bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-[0_0_20px_rgba(100,116,139,0.1)]"}
                      `}>
                        <div className={`w-2 h-2 rounded-full ${tipo.activo ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-400"}`} />
                        {tipo.activo ? "Activo" : "Inactivo"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() => setTipoSeleccionado(tipo)}
                        className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-sky-500 hover:shadow-xl hover:shadow-slate-200 transition-all duration-500 active:scale-90 border border-transparent hover:border-slate-100"
                        title="Editar Método"
                      >
                        <IoCreateOutline size={20} />
                      </button>
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
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronizando...</span>
            </div>
          ) : tiposFiltrados.length === 0 ? (
             <div className="p-10 text-center text-slate-400 font-medium italic">Sin métodos de pago</div>
          ) : (
            tiposFiltrados.map((tipo) => (
              <div key={tipo.id_tipo_pago} className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center border border-white shadow-sm">
                       <IoWalletOutline size={24} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                       <span className="text-[15px] font-black text-slate-900 tracking-tight leading-tight truncate">{tipo.nombre}</span>
                       <div className="flex items-center gap-2 mt-1">
                          <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border
                            ${tipo.activo ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600 border-slate-500/20"}
                          `}>
                             {tipo.activo ? "Activo" : "Inactivo"}
                          </div>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">ID: #{tipo.id_tipo_pago}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-sm font-black text-slate-900 leading-none">{Number(tipo.comision || 0).toFixed(2)}%</span>
                       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fee</p>
                    </div>
                 </div>

                 {tipo.descripcion && (
                   <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{tipo.descripcion}"</p>
                   </div>
                 )}

                 <div className="flex items-center justify-center bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                   <button onClick={() => setTipoSeleccionado(tipo)} className="p-2.5 text-sky-500 flex-1 flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                     <IoCreateOutline size={18} /> Editar Configuración
                   </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modales */}
      {mostrarAgregar && (
        <AgregarTipoPagoModal
          onClose={() => setMostrarAgregar(false)}
          onSuccess={() => {
            setMostrarAgregar(false);
            obtenerTipos();
          }}
        />
      )}

      {tipoSeleccionado && (
        <EditarTipoPagoModal
          tipoPago={tipoSeleccionado}
          onClose={() => setTipoSeleccionado(null)}
          onSuccess={() => {
            setTipoSeleccionado(null);
            obtenerTipos();
          }}
        />
      )}
    </div>
  );
}
