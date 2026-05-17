"use client";

import { useEffect, useState } from "react";
import AdminModal from "../Components/AdminModal";
import { apiUrl } from "../../config/api";
import type { RutaAcademica } from "../../types/models";
import { IoInformationCircleOutline, IoCalendarOutline, IoCashOutline, IoTimeOutline, IoBarChartOutline } from "react-icons/io5";

interface LineaAcademica {
  id_linea: number;
  nombre: string;
}

interface InfoRutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruta: RutaAcademica | null;
}

export function InfoRutaModal({ isOpen, onClose, ruta }: InfoRutaModalProps) {
  const [nombreLinea, setNombreLinea] = useState<string>("Cargando...");

  useEffect(() => {
    const fetchLinea = async () => {
      if (!ruta) return;
      
      // Si ya viene la relación en el objeto, la usamos directamente
      if (ruta.lineaAcademica) {
        setNombreLinea(ruta.lineaAcademica.nombre);
        return;
      }

      try {
        const res = await fetch(apiUrl("/lineas-academicas"), {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const lista = data.data || [];
        const linea = lista.find((l: any) => 
          (l.id_linea_academica === ruta.id_linea_academica) || 
          (l.id_linea === ruta.id_linea_academica)
        );
        setNombreLinea(linea ? linea.nombre : "No encontrada");
      } catch (error) {
        console.error("Error obteniendo línea académica:", error);
        setNombreLinea("Error al cargar");
      }
    };
    if (isOpen && ruta) fetchLinea();
  }, [isOpen, ruta]);

  if (!ruta) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Información de la Ruta"
      maxWidth="max-w-2xl"
      footer={
        <button onClick={onClose} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5">
          Entendido
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {/* Banner with Image */}
        <div className="relative h-48 md:h-56 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/10">
          {ruta.imagen ? (
            <img src={ruta.imagen} alt={ruta.nombre} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest text-xs">Sin imagen</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-5 md:bottom-8 left-5 md:left-8 right-5 md:left-8">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 backdrop-blur-md border border-sky-400/30 text-sky-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                {ruta.nivel || "Ruta General"}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {ruta.estado}
              </span>
            </div>
            <h3 className="text-xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">{ruta.nombre}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Details */}
          <div className="bg-slate-50/40 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
                <IoInformationCircleOutline size={20} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Información</h4>
                <span className="text-[13px] md:text-[14px] font-black text-slate-900 tracking-tight">Descripción de Ruta</span>
              </div>
            </div>
 
            <div className="space-y-4 md:space-y-5">
              <div>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Sobre esta ruta</span>
                <p className="text-[12px] md:text-[13px] text-slate-600 leading-relaxed mt-1.5 font-medium">{ruta.descripcion || "Sin descripción disponible"}</p>
              </div>
 
              <div className="pt-2">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Línea Académica</span>
                <p className="text-sm font-black text-sky-600 mt-0.5">{nombreLinea}</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-slate-50/40 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-amber-500">
                  <IoBarChartOutline size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nivel</span>
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">{ruta.nivel || "N/A"}</span>
                </div>
              </div>
 
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-sky-500">
                  <IoTimeOutline size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Horas Totales</span>
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">{ruta.horas_totales || "0"} horas</span>
                </div>
              </div>
 
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                  <IoCashOutline size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inversión</span>
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">S/. {Number(ruta.precio).toFixed(2)}</span>
                </div>
              </div>
 
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <IoCalendarOutline size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Actualización</span>
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">
                    {ruta.fecha_actualizacion ? ruta.fecha_actualizacion.slice(0, 10) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
