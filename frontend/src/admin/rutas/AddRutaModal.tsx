"use client";

import React, { useState, useEffect } from "react";
import type { RutaAcademica } from "../../types/models";
import InputComponent from "../Components/InputComponent";
import AdminModal from "../Components/AdminModal";
import SearchableSelect from "../Components/SearchableSelect";
import { apiUrl } from "../../config/api";
import { IoMapOutline, IoTimeOutline, IoCashOutline, IoLayersOutline } from "react-icons/io5";

interface LineaAcademica {
  id_linea: number;
  nombre: string;
}

interface AddRutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevaRuta: Omit<RutaAcademica, "id_ruta">) => Promise<boolean>;
}

export function AddRutaModal({ isOpen, onClose, onSave }: AddRutaModalProps) {
  const [formData, setFormData] = useState<Omit<RutaAcademica, "id_ruta">>({
    nombre: "",
    descripcion: "",
    id_linea_academica: 0,
    imagen: "",
    horas_totales: 0,
    nivel: "Principiante",
    precio: 0,
    estado: "Activa",
    destacado: false,
    fecha_creacion: "",
    fecha_actualizacion: "",
  });

  const [lineas, setLineas] = useState<LineaAcademica[]>([]);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const res = await fetch(apiUrl("/lineas-academicas"), {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const mapped = (data.data || []).map((l: any) => ({
          ...l,
          id_linea: l.id_linea || l.id_linea_academica
        }));
        setLineas(mapped);
      } catch (error) {
        console.error("Error cargando líneas académicas:", error);
      }
    };
    if (isOpen) fetchLineas();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    if (formData.id_linea_academica === 0) {
      alert("Selecciona una línea académica antes de guardar.");
      return;
    }
    const success = await onSave({
      ...formData,
      horas_totales: Number(formData.horas_totales),
      precio: Number(formData.precio),
    });
    if (success) onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Ruta Académica"
      maxWidth="max-w-3xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Nueva Ruta Académica
          </div>
          <button 
            onClick={handleSubmit} 
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5 text-sm"
          >
            Crear Ruta
          </button>
          <button onClick={onClose} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm">
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-4 md:space-y-6">
        {/* Module 1: Structure */}
        <div className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
              <IoMapOutline size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-sky-600/70">Módulo 01</h3>
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Estructura de la Ruta</span>
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputComponent label="Nombre de la Ruta" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Especialista en Excel" />
            
            <SearchableSelect 
              label="Línea Académica"
              value={formData.id_linea_academica || ""}
              onChange={(v) => setFormData({ ...formData, id_linea_academica: Number(v) })}
              options={lineas.map(l => ({ value: l.id_linea, label: l.nombre }))}
              placeholder="Selecciona línea..."
            />
 
            <div className="md:col-span-2">
              <div className="flex flex-col gap-2 w-full group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">
                  Nivel de Dificultad
                </label>
                <select name="nivel" value={formData.nivel} onChange={handleChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-900 font-medium">
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Media */}
        <div className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
              <IoLayersOutline size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600/70">Módulo 02</h3>
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Contenido y Medios</span>
            </div>
          </div>
 
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción de la Ruta</label>
              <textarea name="descripcion" value={formData.descripcion || ""} onChange={handleChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-900 font-medium h-24 resize-none" placeholder="Describe el objetivo de esta ruta..." />
            </div>
 
            <InputComponent label="Imagen de Portada (URL)" name="imagen" value={formData.imagen || ""} onChange={handleChange} placeholder="URL de la imagen" />
          </div>
        </div>

        {/* Module 3: Specs */}
        <div className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-sm border border-amber-100/50">
              <IoTimeOutline size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-600/70">Módulo 03</h3>
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Especificaciones</span>
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputComponent label="Horas Totales" name="horas_totales" type="number" value={formData.horas_totales} onChange={handleChange} placeholder="Ej: 120" />
            <InputComponent label="Precio de la Ruta (S/)" name="precio" type="number" value={formData.precio} onChange={handleChange} placeholder="Ej: 450.00" />
          </div>
        </div>
      </div>
    </AdminModal>
  );
}


