"use client";

import type { Modulo, Curso } from "../../types/models";
import AdminModal from "../Components/AdminModal";
import { 
  IoCalendarOutline, 
  IoLayersOutline, 
  IoBookOutline, 
  IoTimeOutline,
  IoBookmarkOutline
} from "react-icons/io5";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  modulo: (Modulo & { curso?: Curso }) | null;
  cursoNombre?: string;
}

const formatDate = (d: string | null | undefined) => {
  if (!d) return "—";
  const safe = String(d).replace(" ", "T");
  const dt = new Date(safe);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function InfoModuloModal({
  isOpen,
  onClose,
  modulo,
  cursoNombre,
}: Props) {
  if (!modulo) return null;

  const nombreCurso =
    cursoNombre || modulo.curso?.nombre || String((modulo as any).id_curso);
  const estadoUi =
    (modulo.estado as any) === "Publicado" || (modulo.estado as any) === "Activo"
      ? "Activo"
      : "Inactivo";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Técnica del Módulo"
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
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                 <span className="w-8 h-[2px] bg-sky-500 rounded-full" />
                 <label className="text-[9px] font-black text-sky-600 uppercase tracking-[0.25em]">Módulo Académico</label>
              </div>
              <h3 className="text-2xl font-black text-[#0E1C2B] leading-tight tracking-tight">{modulo.titulo}</h3>
           </div>
           
           <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
              ${estadoUi === "Activo" 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"}
            `}>
              <div className={`w-2 h-2 rounded-full ${estadoUi === "Activo" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 animate-pulse"}`} />
              {estadoUi}
            </div>
        </div>

        {/* Technical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-slate-50/40 rounded-[2rem] border border-slate-100/50 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-sky-500">
                <IoBookOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Curso Vinculado</label>
                <p className="text-[13px] font-bold text-slate-700 leading-snug">{nombreCurso}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500">
                <IoLayersOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Posición en el Plan</label>
                <p className="text-[13px] font-black text-slate-900">Módulo Orden #{modulo.orden}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50/40 rounded-[2rem] border border-slate-100/50 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                <IoCalendarOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Registro</label>
                <p className="text-[13px] font-bold text-slate-600">{formatDate(modulo.fecha_creacion)}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                <IoTimeOutline size={20} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Edición</label>
                <p className="text-[13px] font-bold text-slate-600">{formatDate(modulo.fecha_actualizacion)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="relative group">
          <div className="flex items-center gap-3 mb-4 ml-1">
             <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                <IoBookmarkOutline size={14} />
             </div>
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Objetivos y Contenido</label>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100" />
            <p className="text-slate-600 text-[14px] leading-relaxed font-medium">
              {modulo.descripcion || "Este módulo define una etapa clave en el aprendizaje, aunque actualmente no cuenta con una descripción detallada cargada en el sistema."}
            </p>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

export default InfoModuloModal;
