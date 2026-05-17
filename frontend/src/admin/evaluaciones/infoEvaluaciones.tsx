"use client";

import React from "react";
import AdminModal from "../Components/AdminModal";
import { 
  IoSchoolOutline, 
  IoRibbonOutline, 
  IoTimeOutline, 
  IoReloadOutline,
  IoDocumentTextOutline,
  IoFlashOutline
} from "react-icons/io5";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evaluacion: any;
  cursoNombre?: string;
}

const formatTipo = (raw: any): string => {
  if (!raw || raw === "null" || raw === "") return "General";
  return String(raw);
};

export const InfoEvaluacionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  evaluacion,
  cursoNombre,
}) => {
  if (!evaluacion) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Técnica de Evaluación"
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="px-10 py-3 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/10"
        >
          Cerrar Vista
        </button>
      }
    >
      <div className="space-y-8 p-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                 <span className="w-8 h-[2px] bg-sky-500 rounded-full" />
                 <label className="text-[9px] font-black text-sky-600 uppercase tracking-[0.25em]">Control de Calidad Académica</label>
              </div>
              <h3 className="text-2xl font-black text-[#0E1C2B] leading-tight tracking-tight">{evaluacion.titulo}</h3>
           </div>
           
           <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
              ${evaluacion.estado === "Publicado" 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"}
            `}>
              <div className={`w-2 h-2 rounded-full ${evaluacion.estado === "Publicado" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 animate-pulse"}`} />
              {evaluacion.estado}
            </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-sky-500">
                <IoSchoolOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Curso Vinculado</label>
                <p className="text-[13px] font-bold text-slate-700 leading-snug">{cursoNombre || evaluacion.id_curso}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500">
                <IoFlashOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo de Evaluación</label>
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                  {formatTipo(evaluacion.tipo)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#0E1C2B] rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl shadow-slate-900/10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-sky-400 border border-white/5">
                <IoRibbonOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Umbral de Aprobación</label>
                <p className="text-xl font-black text-white">{evaluacion.puntaje_aprobatorio} <span className="text-[10px] text-sky-400 uppercase ml-1">Puntos Mínimos</span></p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-emerald-400 border border-white/5">
                <IoReloadOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Configuración de Intentos</label>
                <p className="text-[13px] font-bold text-white leading-snug">Máximo {evaluacion.intentos_permitidos} oportunidades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-slate-50/40 rounded-[2rem] border border-slate-100/50 flex items-center gap-4">
             <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm">
                <IoTimeOutline size={18} />
             </div>
             <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Tiempo Límite</label>
                <p className="text-[12px] font-black text-slate-700">
                  {evaluacion.duracion_minutos ? `${evaluacion.duracion_minutos} MINUTOS` : "SIN RESTRICCIÓN"}
                </p>
             </div>
          </div>

          <div className="p-5 bg-slate-50/40 rounded-[2rem] border border-slate-100/50 flex items-center gap-4">
             <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm">
                <IoDocumentTextOutline size={18} />
             </div>
             <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Estado Operativo</label>
                <p className="text-[12px] font-black text-slate-700 uppercase tracking-widest">{evaluacion.estado}</p>
             </div>
          </div>
        </div>

        {/* Description / Instructions */}
        <div className="relative group">
          <div className="flex items-center gap-3 mb-4 ml-1">
             <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                <IoDocumentTextOutline size={14} />
             </div>
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Instrucciones Generales</label>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100" />
            <p className="text-slate-600 text-[14px] leading-relaxed font-medium">
              {evaluacion.descripcion || "Esta evaluación representa un hito fundamental. Actualmente no se han cargado instrucciones específicas para los estudiantes."}
            </p>
          </div>
        </div>
      </div>
    </AdminModal>
  );
};
