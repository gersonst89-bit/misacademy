"use client";

import React from "react";
import AdminModal from "../Components/AdminModal";
import type { LineaAcademica } from "../../types/models";
import { IoInformationCircleOutline, IoCalendarOutline, IoLayersOutline } from "react-icons/io5";

interface InfoLineaModalProps {
  isOpen: boolean;
  onClose: () => void;
  linea: LineaAcademica | null;
}

export const InfoLineaModal: React.FC<InfoLineaModalProps> = ({
  isOpen,
  onClose,
  linea,
}) => {
  if (!linea) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "No disponible";
    const dateObject = new Date(date.replace(" ", "T"));
    if (isNaN(dateObject.getTime())) return "No disponible";
    return dateObject.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Información de la Línea"
      maxWidth="max-w-2xl"
      footer={
        <button onClick={onClose} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5">
          Entendido
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {/* Banner with Image */}
        <div className="relative h-48 md:h-64 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/10">
          {linea.imagen ? (
            <img src={linea.imagen} alt={linea.nombre} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest text-xs">Sin imagen</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-5 md:bottom-8 left-5 md:left-8 right-5 md:left-8">
             <div className="flex items-center gap-2 mb-2 md:mb-3">
               <span className={`px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5
                ${linea.estado === "Publicado" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}
              `}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${linea.estado === "Publicado" ? "bg-emerald-400" : "bg-rose-400"}`} />
                {linea.estado}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 backdrop-blur-md border border-sky-400/30 text-sky-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                Academic Unit
              </span>
            </div>
            <h3 className="text-xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg">{linea.nombre}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-2">
          {/* Info Card */}
          <div className="bg-slate-50/40 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
                <IoInformationCircleOutline size={20} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Información</h4>
                <span className="text-[13px] md:text-[14px] font-black text-slate-900 tracking-tight">Descripción Estratégica</span>
              </div>
            </div>
 
            <div className="space-y-4">
              <div>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Objetivo Académico</span>
                <p className="text-[12px] md:text-[13px] text-slate-600 leading-relaxed mt-2.5 font-medium italic">
                  "{linea.descripcion || "Esta línea académica no cuenta con una descripción detallada por el momento."}"
                </p>
              </div>
            </div>
          </div>

          {/* Chronology Card */}
          <div className="bg-slate-50/40 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
                <IoCalendarOutline size={20} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Cronología</h4>
                <span className="text-[13px] md:text-[14px] font-black text-slate-900 tracking-tight">Registro de Sistema</span>
              </div>
            </div>
 
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-sky-500">
                  <IoLayersOutline size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Creado el</span>
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">{formatDate(linea.fecha_creacion)}</span>
                </div>
              </div>
 
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                  <IoCalendarOutline size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Actualización</span>
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">{formatDate(linea.fecha_actualizacion)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  );
};
