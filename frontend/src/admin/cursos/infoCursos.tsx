"use client";

import { useEffect, useState } from "react";
import AdminModal from "../Components/AdminModal";
import { API_URL } from "../../config/api";
import type { Curso } from "../../types/models";
import { IoInformationCircleOutline, IoPersonOutline, IoLocationOutline, IoStatsChartOutline } from "react-icons/io5";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
}

export function InfoCursoModal({ isOpen, onClose, curso }: Props) {
  const [nombreRuta, setNombreRuta] = useState<string>("No asignada");

  useEffect(() => {
    if (!curso) return;

    if (curso.rutas && curso.rutas.length > 0) {
      const primeraRuta = curso.rutas[0];
      if (typeof primeraRuta === "object" && "nombre" in primeraRuta) {
        setNombreRuta(primeraRuta.nombre || "No asignada");
      }
    }
  }, [curso]);

  if (!curso) return null;

  const docente = curso.docente;
  const nombreDocente = docente ? `${docente.nombre} ${docente.apellido || ""}` : "Sin docente asignado";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Información del Curso"
      maxWidth="max-w-3xl"
      footer={
        <button onClick={onClose} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5">
          Entendido
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {/* Banner Image */}
        <div className="relative h-48 md:h-64 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/10">
          {curso.imagen ? (
            <img
              src={
                typeof curso.imagen === "string" && curso.imagen.startsWith("http")
                  ? curso.imagen
                  : typeof curso.imagen === "string"
                  ? `${API_URL}/${curso.imagen.startsWith("/") ? curso.imagen.slice(1) : curso.imagen}`
                  : curso.imagen
              }
              alt={curso.nombre}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest">
              Sin imagen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-5 md:bottom-8 left-5 md:left-8 right-5 md:right-8">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 backdrop-blur-md border border-sky-400/30 text-sky-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                {curso.nivel || "Nivel General"}
              </span>
              {curso.estado === "Publicado" && (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En Línea
                </span>
              )}
            </div>
            <h3 className="text-xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">{curso.nombre}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Details */}
          <div className="bg-slate-50/40 p-6 rounded-[2rem] border border-slate-100/50 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
                <IoInformationCircleOutline size={20} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Académico</h4>
                <span className="text-[14px] font-black text-slate-900 tracking-tight">Detalles del Curso</span>
              </div>
            </div>
 
            <div className="space-y-5">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Descripción</span>
                <p className="text-[13px] text-slate-600 leading-relaxed mt-1.5 font-medium">{curso.descripcion || "No disponible"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Duración</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{(curso.duracion_horas || curso.duracion) || "—"} horas</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tiempo Est.</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{curso.tiempo || "—"} semanas</p>
                </div>
              </div>
 
              <div className="pt-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ruta Académica</span>
                <p className="text-sm font-black text-sky-600 mt-0.5">{nombreRuta}</p>
              </div>
            </div>
          </div>

          {/* Instructor & Stats */}
          <div className="bg-slate-50/40 p-6 rounded-[2rem] border border-slate-100/50 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
                <IoStatsChartOutline size={20} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Financiero</h4>
                <span className="text-[14px] font-black text-slate-900 tracking-tight">Estado y Valor</span>
              </div>
            </div>
 
            <div className="bg-white rounded-[2rem] p-6 space-y-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inversión</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">
                  {curso.precio ? `S/ ${curso.precio}` : "Gratis"}
                </span>
              </div>
 
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estado Actual</span>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                  ${curso.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}
                `}>
                  {curso.estado}
                </span>
              </div>
 
              <div className="pt-5 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                    <IoPersonOutline size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Docente a Cargo</span>
                    <span className="text-[13px] font-black text-slate-900 tracking-tight">{nombreDocente}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
