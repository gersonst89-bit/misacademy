"use client";

import React, { useState, useEffect } from "react";
import InputComponent from "../Components/InputComponent";
import TextareaComponent from "../Components/TextareaComponent";
import AdminModal from "../Components/AdminModal";
import type { LineaAcademica } from "../../types/models";
import { IoLayersOutline, IoImageOutline, IoSaveOutline, IoSparklesOutline } from "react-icons/io5";

interface EditLineaAcademicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  linea: LineaAcademica;
  onSave: (updatedLinea: LineaAcademica) => Promise<boolean>;
}

export const EditLineaAcademicaModal: React.FC<EditLineaAcademicaModalProps> = ({ 
  isOpen, 
  onClose, 
  linea, 
  onSave 
}) => {
  const [nombre, setNombre] = useState(linea.nombre);
  const [descripcion, setDescripcion] = useState(linea.descripcion ?? "");
  const [imagen, setImagen] = useState(linea.imagen ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (linea) {
      setNombre(linea.nombre);
      setDescripcion(linea.descripcion ?? "");
      setImagen(linea.imagen ?? "");
    }
  }, [linea]);

  const handleSave = async () => {
    if (!nombre.trim()) return alert("El nombre es obligatorio.");

    const updatedLinea: LineaAcademica = {
      ...linea,
      nombre,
      descripcion: descripcion.trim() === "" ? null : descripcion,
      imagen: imagen.trim() === "" ? null : imagen,
      fecha_actualizacion: new Date().toISOString(),
    };

    setIsSaving(true);
    const fueExitosa = await onSave(updatedLinea);
    setIsSaving(false);

    if (fueExitosa) {
      onClose();
    } else {
      alert("Ocurrió un error al guardar los cambios.");
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Línea Académica"
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Editando Línea Académica
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-white/5 text-sm"
          >
            <IoSaveOutline size={18} /> {isSaving ? "Cargando..." : "Guardar Cambios"}
          </button>
          <button onClick={onClose} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm">
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-4 md:space-y-6">
        {/* Module 1: Core Structure */}
        <div className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
              <IoLayersOutline size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-sky-600/70">Módulo 01</h3>
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Estructura Académica</span>
            </div>
          </div>
 
          <div className="space-y-4">
            <InputComponent
              label="Nombre de la Línea"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Análisis de Datos y BI"
            />
 
            <TextareaComponent
              label="Descripción Estratégica"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={150}
              placeholder="Describe el propósito de esta línea académica..."
              className="h-28"
            />
          </div>
        </div>

          {/* Module 2: Visual Identity */}
        <div className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
              <IoImageOutline size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600/70">Módulo 02</h3>
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Identidad Visual</span>
            </div>
          </div>
 
          <InputComponent
            label="URL de la Imagen de Portada"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>
    </AdminModal>
  );
};
