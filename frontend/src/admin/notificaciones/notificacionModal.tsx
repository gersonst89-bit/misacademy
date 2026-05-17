"use client";

import AdminModal from "../Components/AdminModal";
import { IoShieldCheckmarkOutline, IoPersonOutline, IoCubeOutline, IoTimeOutline, IoLinkOutline } from "react-icons/io5";

interface Props {
  data: any;
  onClose: () => void;
}

const traducirAccion = (accion: string) => {
  switch (accion) {
    case "updated": return "Actualización";
    case "created": return "Creación";
    case "deleted": return "Eliminación";
    default: return accion;
  }
};

const formatearValor = (valor: any) => {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "string" && valor.match(/^\d{4}-\d{2}-\d{2}/)) {
     const dt = new Date(valor);
     if (!isNaN(dt.getTime())) return dt.toLocaleString();
  }
  return String(valor);
};

export const NotificacionModal = ({ data, onClose }: Props) => {
  const oldValues = data.old_values || {};
  const newValues = data.new_values || {};

  const claves = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]))
    .filter(k => k !== "updated_at" && k !== "created_at");

  const formatearFechaLocal = (fecha: string) => {
    if (!fecha) return "—";
    const fechaISO = fecha.includes(" ") ? fecha.replace(" ", "T") : fecha;
    const dt = new Date(fechaISO);
    return isNaN(dt.getTime()) ? "Fecha no válida" : dt.toLocaleString();
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title="Detalles de Auditoría"
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="w-full md:w-auto px-8 py-4 bg-[#0E1C2B] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-sky-900/20 transition-all active:scale-95 border border-white/5"
        >
          Cerrar Registro
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {/* User Summary Responsivo */}
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-6 md:p-8 bg-gray-50/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 text-center sm:text-left">
           <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center text-[#0E1C2B] shrink-0">
              <IoPersonOutline size={28} className="md:size-8" />
           </div>
           <div className="min-w-0">
              <h3 className="text-base md:text-lg font-black text-[#0E1C2B] truncate">{data.user_name}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{data.user_rol} • {data.user_email}</p>
           </div>
        </div>

        {/* Action Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
           <div className="space-y-4 md:space-y-5">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <IoShieldCheckmarkOutline className="text-sky-500" size={16} />
                 </div>
                 <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Tipo de Evento</label>
                    <p className="text-xs md:text-sm font-bold text-[#0E1C2B]">{traducirAccion(data.event)}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <IoCubeOutline className="text-amber-500" size={16} />
                 </div>
                 <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Entidad</label>
                    <p className="text-xs md:text-sm font-bold text-[#0E1C2B]">{data.model ? data.model.replace("App\\Models\\", "") : "Sistema"}</p>
                 </div>
              </div>
           </div>
           <div className="space-y-4 md:space-y-5">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <IoTimeOutline className="text-purple-500" size={16} />
                 </div>
                 <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</label>
                    <p className="text-xs md:text-sm font-bold text-[#0E1C2B]">{formatearFechaLocal(data.created_at)}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <IoLinkOutline className="text-emerald-500" size={16} />
                 </div>
                 <div className="min-w-0 flex-1">
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Origen</label>
                    <p className="text-xs md:text-sm font-bold text-[#0E1C2B] truncate">{data.url}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Diff Table responsiva */}
        <div className="space-y-4 pt-4 border-t border-gray-50">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comparativa de Cambios</h4>
              <span className="text-[9px] font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full self-start sm:self-auto">{claves.length} campos afectados</span>
           </div>

           {claves.length === 0 ? (
              <div className="py-10 text-center bg-gray-50/50 rounded-[1.5rem] border border-dashed border-gray-200 italic text-gray-400 text-[11px]">
                 No hay cambios registrados en este evento.
              </div>
           ) : (
              <div className="space-y-3">
                 {claves.map((clave) => (
                    <div key={clave} className="p-4 md:p-5 bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:border-sky-100 transition-colors">
                       <div className="flex items-center gap-2 mb-3 border-b border-gray-50 pb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{clave.replace("_", " ")}</span>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100/50">
                             <span className="block text-[7px] font-black text-rose-400 uppercase mb-1 tracking-widest">Valor Anterior</span>
                             <p className="text-[11px] font-medium text-gray-500 line-through opacity-60 break-words">{formatearValor(oldValues[clave])}</p>
                          </div>
                          <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50">
                             <span className="block text-[7px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Valor Nuevo</span>
                             <p className="text-[11px] font-bold text-[#0E1C2B] break-words">{formatearValor(newValues[clave])}</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>
    </AdminModal>
  );
};
