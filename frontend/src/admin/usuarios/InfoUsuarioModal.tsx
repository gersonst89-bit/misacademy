"use client";

import AdminModal from "../Components/AdminModal";
import type { Usuario } from "../../types/models";
import { API_URL } from "../../config/api";
import { IoMailOutline, IoShieldCheckmarkOutline, IoCalendarOutline, IoFingerPrintOutline } from "react-icons/io5";

interface Props {
  usuario: Usuario;
  onClose: () => void;
}

export default function InfoUsuarioModal({ usuario, onClose }: Props) {
  const getRolTexto = () => {
    switch (usuario.id_rol) {
      case 1: return "Administrador";
      case 2: return "Docente";
      case 3: return "Estudiante";
      default: return "Usuario";
    }
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title="Perfil de Usuario"
      maxWidth="max-w-xl"
      footer={
        <button onClick={onClose} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5">
          Entendido
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6 p-2 text-center md:text-left">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 text-3xl md:text-4xl font-black shadow-2xl border-4 border-white relative group">
            {usuario.imagen_perfil ? (
              <img 
                src={`${API_URL?.replace(/\/$/, "")}/${usuario.imagen_perfil.replace(/^\/?(api\/)?/, "")}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Perfil"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerText = usuario.nombre?.charAt(0) || "U";
                }}
              />
            ) : (
              <span className="opacity-50">{usuario.nombre?.charAt(0) || "U"}</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">
              {usuario.nombre} <br className="hidden md:block" /> {usuario.apellido}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border backdrop-blur-md
                ${usuario.id_rol === 1 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
                  usuario.id_rol === 2 ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                  "bg-sky-500/10 text-sky-600 border-sky-500/20"}
              `}>
                <IoShieldCheckmarkOutline size={14} />
                {getRolTexto()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/40 border border-slate-100/50 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <IoMailOutline size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Académico</span>
              <span className="text-[13px] font-bold text-slate-700 truncate block">{usuario.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <IoFingerPrintOutline size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Identificación</span>
              <span className="text-[13px] font-bold text-slate-700">{usuario.dni || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .82 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.82A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contacto</span>
              <span className="text-[13px] font-bold text-slate-700">{(usuario as any).telefono || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <IoCalendarOutline size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estado</span>
              <span className={`text-[13px] font-black ${usuario.estado?.toLowerCase() === "activo" ? "text-emerald-600" : "text-rose-600"}`}>
                {usuario.estado}
              </span>
            </div>
          </div>
        </div>

        {usuario.biografia && (
          <div className="px-5 md:px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 mx-2 md:mx-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center md:text-left block">Biografía Profesional</span>
            <p className="text-[12px] md:text-[13px] text-slate-600 leading-relaxed mt-2.5 italic text-center md:text-left">"{usuario.biografia}"</p>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
