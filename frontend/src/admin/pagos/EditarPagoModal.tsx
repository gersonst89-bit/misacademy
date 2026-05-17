"use client";

import { useState } from "react";
import AdminModal from "../Components/AdminModal";
import SelectComponent from "../Components/SelectComponent";
import type { Pago } from "../../types/models";
import { IoReceiptOutline, IoPersonOutline, IoCalendarOutline, IoCashOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { BASE_URL } from "../../config/api";

interface EditarPagoModalProps {
  pago: Pago | null;
  onClose: () => void;
  onActualizar: (id: number, nuevoEstado: string) => void;
}

export default function EditarPagoModal({ pago, onClose, onActualizar }: EditarPagoModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState(pago?.estado || "");
  const [loading, setLoading] = useState(false);

  if (!pago) return null;

  const handleUpdate = async () => {
    setLoading(true);
    await onActualizar(pago.id_pago, nuevoEstado);
    setLoading(false);
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title={`Gestión de Pago #${pago.id_pago}`}
      maxWidth="max-w-xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Sincronización Bancaria
          </div>
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50 text-sm"
          >
            {loading ? "Cargando..." : "Confirmar Estado"}
          </button>
          <button onClick={onClose} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm">
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {/* Transaction Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-sky-400/80 mb-3 md:mb-4 bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20">Monto Transaccionado</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-bold text-slate-400">S/</span>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{Number(pago.monto).toFixed(2)}</h3>
            </div>
            <div className={`mt-6 md:mt-8 px-5 md:px-6 py-2.5 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-lg
              ${pago.estado.toLowerCase() === "completado" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10" : 
                pago.estado.toLowerCase() === "pendiente" ? "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/10" :
                "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-rose-500/10"}
            `}>
              Estado Actual: {pago.estado}
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
              <IoCheckmarkCircleOutline size={18} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Acción Requerida</h4>
          </div>

          <SelectComponent 
            label="Nuevo Estado del Pago"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            options={[
              { value: "Pendiente", label: "Pendiente" },
              { value: "Completado", label: "Completado" },
              { value: "Fallido", label: "Fallido" },
              { value: "Reembolsado", label: "Reembolsado" }
            ]}
          />
        </div>

        <div className="pt-2 md:pt-4 space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200/50 shadow-sm">
              <IoReceiptOutline size={18} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Detalles de Facturación</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/40 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 border border-slate-100/50">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <IoPersonOutline size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cliente / Alumno</span>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-700 truncate block">
                  {pago.usuario ? `${pago.usuario.nombre} ${pago.usuario.apellido}` : "Desconocido"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <IoCalendarOutline size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha Registro</span>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-700">
                  {new Date(pago.fecha_pago).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <IoCashOutline size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Medio de Pago</span>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-700 truncate block">{pago.tipo_pago?.nombre || "No especificado"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <IoReceiptOutline size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Referencia Interna</span>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-700">#{pago.id_pago}</span>
              </div>
            </div>
          </div>

          {/* Comprobante de Pago Section */}
          {(pago.comprobante_url || pago.numero_operacion) && (
            <div className="bg-slate-100/50 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border border-slate-200/50">
              <div className="flex items-center gap-3 mb-6 px-1">
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <IoReceiptOutline size={20} />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Evidencia de Pago</h4>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Validación del Alumno</span>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {pago.numero_operacion && (
                  <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center group transition-all hover:border-sky-300">
                    <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Nº Operación</span>
                    <span className="font-black text-slate-900 tracking-tight text-sm">{pago.numero_operacion}</span>
                  </div>
                )}
                
                {pago.comprobante_url && (
                  <div className="space-y-3 px-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Vista Previa del Comprobante</span>
                    <a 
                      href={pago.comprobante_url.startsWith('http') ? pago.comprobante_url : `${BASE_URL}${pago.comprobante_url}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block group relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <img 
                        src={pago.comprobante_url.startsWith('http') ? pago.comprobante_url : `${BASE_URL}${pago.comprobante_url}`} 
                        alt="Comprobante" 
                        className="w-full h-auto max-h-[350px] object-contain bg-slate-50 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                        </div>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Expandir Recibo</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
