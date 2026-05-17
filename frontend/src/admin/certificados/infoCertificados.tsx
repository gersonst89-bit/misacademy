"use client";

import React from "react";
import AdminModal from "../Components/AdminModal";
import { IoRibbonOutline, IoSchoolOutline, IoCalendarOutline, IoMailOutline, IoTimeOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import type {
  Certificacion,
  CertificacionEmpresa,
  CertificacionAdicional,
} from "../../types/models";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: (Certificacion & { curso_nombre?: string; usuario_nombre?: string }) | null;
}

export function InfoCertificadoModal({ isOpen, onClose, item }: Props) {
  if (!item) return null;

  const isEmpresa = item.tipo_certificado === "empresa";

  const formatDateLocal = (date: string | null) => {
    if (!date) return "—";
    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return parsedDate.toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateOriginal = (date: string | null) => {
    if (!date) return "—";
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de Certificación"
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5"
        >
          Cerrar Vista
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col items-center justify-center py-8 md:py-12 bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl shadow-slate-900/20 mx-1 md:mx-0">
           <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 flex items-center justify-center text-sky-400 mb-4 md:mb-6 relative z-10 backdrop-blur-md transition-transform duration-700 group-hover:scale-110">
              <IoRibbonOutline size={40} className="md:size-[48px] animate-pulse" />
           </div>
           <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter mb-3 relative z-10 uppercase text-center px-4">{item.codigo_certificado}</h3>
           <div className={`px-4 md:px-6 py-2 rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] border backdrop-blur-md relative z-10
             ${isEmpresa ? "bg-sky-500/20 text-sky-300 border-sky-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}
           `}>
              Certificado {isEmpresa ? "Oficial" : "Externo"}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
           <div className="p-6 md:p-8 bg-slate-50/40 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100/50 space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-sky-300">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner flex-shrink-0"><IoSchoolOutline size={22} /></div>
                 <div className="min-w-0">
                    <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Titular / Estudiante</label>
                    <p className="text-sm md:text-[15px] font-bold text-slate-700 leading-tight truncate">{item.usuario_nombre || "—"}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-emerald-300">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0"><IoCheckmarkCircleOutline size={22} /></div>
                 <div className="flex-1 min-w-0">
                    <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Programa Acreditado</label>
                    <p className="text-[12px] md:text-[13px] font-bold text-slate-700 leading-tight truncate md:whitespace-normal">{item.curso_nombre || "—"}</p>
                 </div>
              </div>
           </div>

           <div className="p-6 md:p-8 bg-slate-50/40 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100/50 space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-amber-300">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner flex-shrink-0"><IoCalendarOutline size={22} /></div>
                 <div>
                    <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fecha de Emisión</label>
                    <p className="text-sm md:text-[15px] font-bold text-slate-700 leading-tight">{formatDateOriginal(item.fecha_emision)}</p>
                 </div>
              </div>
              {!isEmpresa && (
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-purple-300">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner flex-shrink-0"><IoTimeOutline size={22} /></div>
                   <div>
                      <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Carga Académica</label>
                      <p className="text-sm md:text-[15px] font-bold text-slate-700 leading-tight">{(item as CertificacionAdicional).total_horas} Horas</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {!isEmpresa && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-1 md:px-2">
             <div className="p-4 md:p-6 bg-slate-100/50 rounded-2xl md:rounded-3xl border border-slate-200/50 flex items-center gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0"><IoCalendarOutline size={18} /></div>
                <div className="min-w-0">
                   <label className="block text-[8px] md:text-[9px] font-black text-sky-600 uppercase tracking-[0.2em] mb-0.5">Rango Académico</label>
                   <p className="text-[11px] md:text-xs font-black text-slate-600 truncate">{formatDateLocal(item.fecha_inicio)} – {formatDateLocal(item.fecha_fin)}</p>
                </div>
             </div>
             <div className="p-4 md:p-6 bg-slate-100/50 rounded-2xl md:rounded-3xl border border-slate-200/50 flex items-center gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0"><IoMailOutline size={18} /></div>
                <div className="min-w-0">
                   <label className="block text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Canal de Envío</label>
                   <p className="text-[11px] md:text-xs font-black text-slate-600 truncate">{(item as CertificacionAdicional).email_destinatario}</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </AdminModal>
  );
}

export default InfoCertificadoModal;
