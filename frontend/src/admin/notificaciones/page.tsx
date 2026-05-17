"use client";

import { useEffect, useState } from "react";
import { NotificacionModal } from "./notificacionModal";
import { API_URL } from "../../config/api";
import { IoNotificationsOutline, IoPersonCircleOutline, IoTimeOutline, IoChevronForwardOutline } from "react-icons/io5";

interface Auditoria {
  id: number;
  event: string;
  model: string;
  user_name: string;
  user_email: string;
  user_rol: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  created_at: string;
  url: string;
}

export const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Auditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalData, setModalData] = useState<Auditoria | null>(null);

  useEffect(() => {
    const obtenerNotificaciones = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/auditoria`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!respuesta.ok) return setCargando(false);
        const data = await respuesta.json();
        setNotificaciones(data?.data || []);
      } catch {
        setCargando(false);
      } finally {
        setCargando(false);
      }
    };
    obtenerNotificaciones();
  }, []);

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "Fecha no disponible";
    const fechaISO = fecha.includes(" ") ? fecha.replace(" ", "T") : fecha;
    const dateObj = new Date(fechaISO);
    
    if (isNaN(dateObj.getTime())) return "Fecha no válida";

    return dateObj.toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const obtenerConfig = (n: Auditoria) => {
    const modelo = n.model ? n.model.replace("App\\Models\\", "") : "el sistema";
    switch (n.event) {
      case "created": return { desc: `creó un registro en ${modelo}`, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-100", dot: "bg-emerald-500" };
      case "updated": return { desc: `actualizó ${modelo}`, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-100", dot: "bg-sky-500" };
      case "deleted": return { desc: `eliminó un registro de ${modelo}`, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-100", dot: "bg-rose-500" };
      default: return { desc: `interactuó con ${modelo}`, color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200", dot: "bg-slate-400" };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto py-8 px-4 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#0E1C2B] text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-sky-900/20 shrink-0 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <IoNotificationsOutline size={28} className="relative z-10" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-[#0E1C2B] tracking-tight">Actividad del Sistema</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auditoría Global en Tiempo Real</p>
            </div>
         </div>
         <div className="bg-slate-50/50 px-6 py-4 rounded-[1.5rem] border border-slate-100 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Registros Hoy</span>
              <span className="text-xl font-black text-[#0E1C2B]">{notificaciones.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200 mx-2" />
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
         </div>
      </div>

      {cargando ? (
        <div className="py-32 flex flex-col items-center gap-6">
           <div className="w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-sky-500/20" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando logs...</p>
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-32 text-center border border-slate-100 border-dashed">
           <IoNotificationsOutline size={56} className="mx-auto text-slate-200 mb-6" />
           <p className="text-[14px] font-black text-slate-700 uppercase tracking-widest leading-none">Sin actividad reciente</p>
           <p className="text-[12px] text-slate-400 mt-2 italic">El sistema está operando bajo estándares nominales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notificaciones.map((n) => {
            const config = obtenerConfig(n);
            return (
              <div
                key={n.id}
                onClick={() => setModalData(n)}
                className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] hover:border-sky-100 transition-all cursor-pointer flex items-center gap-6"
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center transition-transform group-hover:scale-110 border ${config.border} relative shadow-sm`}>
                   <IoPersonCircleOutline size={32} />
                   <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${config.dot}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                     <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors uppercase tracking-tight">{n.user_name}</span>
                     <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-xl text-[8px] font-black uppercase tracking-widest border border-slate-200/50 shadow-sm">{n.user_rol}</span>
                  </div>
                  <p className="text-[12px] font-bold text-slate-500 truncate italic bg-slate-50/50 inline-block px-3 py-1 rounded-lg border border-slate-100">
                     {config.desc}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <IoTimeOutline size={14} className="text-sky-500/50" />
                     {formatearFecha(n.created_at)}
                  </div>
                </div>

                <div className="shrink-0 w-12 h-12 rounded-full bg-slate-50 text-slate-300 group-hover:bg-sky-500 group-hover:text-white transition-all flex items-center justify-center shadow-inner group-hover:shadow-xl group-hover:shadow-sky-500/20">
                   <IoChevronForwardOutline size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalData && (
        <NotificacionModal
          data={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
};
