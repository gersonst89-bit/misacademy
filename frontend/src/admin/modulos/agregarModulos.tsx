"use client";

import React, { useEffect, useState } from "react";
import type { Modulo, Curso } from "../../types/models";
import InputComponent from "../Components/InputComponent";
import { apiClient } from "../../services/apiClient";
import AdminModal from "../Components/AdminModal";
import SearchableSelect from "../Components/SearchableSelect";

type EstadoUI = "Activo" | "Inactivo" | "Publicado";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    nuevo: Omit<Modulo, "id_modulo" | "fecha_creacion" | "fecha_actualizacion">
  ) => Promise<boolean>;
}

export const AddModuloModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursoId, setCursoId] = useState<number | "">("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState<number | "">("");
  const [estado, setEstado] = useState<EstadoUI>("Activo");

  const [errorCurso, setErrorCurso] = useState("");
  const [errorTitulo, setErrorTitulo] = useState("");
  const [errorOrden, setErrorOrden] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;



    // Reset
    setCursoId("");
    setTitulo("");
    setDescripcion("");
    setOrden("");
    setEstado("Activo");
    setErrorCurso("");
    setErrorTitulo("");
    setErrorOrden("");

    const cargarDatos = async () => {
      setLoading(true);
      try {
        // CURSOS
        let listaC: Curso[] = [];
        let pC = 1;
        let lastC = 1;
        do {
          const res = await apiClient.get(`/admin/cursos`, {
            params: { page: pC }
          });
          const data = res.data;
          listaC = [...listaC, ...(data.data || [])];
          lastC = data.last_page || 1;
          pC++;
        } while (pC <= lastC);
        setCursos(listaC);

        // MODULOS
        let listaM: Modulo[] = [];
        let pM = 1;
        let lastM = 1;
        do {
          const res = await apiClient.get(`/admin/modulos`, {
            params: { page: pM }
          });
          const data = res.data;
          listaM = [...listaM, ...(data.data || [])];
          lastM = data.last_page || 1;
          pM++;
        } while (pM <= lastM);
        setModulos(listaM);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [isOpen]);

  const handleSave = async () => {
    let hasError = false;

    if (!cursoId) {
      setErrorCurso("Selecciona un curso.");
      hasError = true;
    } else setErrorCurso("");

    if (!titulo.trim()) {
      setErrorTitulo("El título es obligatorio.");
      hasError = true;
    } else setErrorTitulo("");

    if (!orden || Number(orden) < 1) {
      setErrorOrden("El orden debe ser ≥ 1.");
      hasError = true;
    } else setErrorOrden("");

    if (cursoId && orden) {
      const repetido = modulos.some(
        (m) => m.id_curso === Number(cursoId) && m.orden === Number(orden)
      );
      if (repetido) {
        setErrorOrden(`El orden ${orden} ya está en uso en este curso.`);
        hasError = true;
      }
    }

    if (hasError) return;

    const payload: Omit<Modulo, "id_modulo" | "fecha_creacion" | "fecha_actualizacion"> = {
      id_curso: Number(cursoId),
      titulo: titulo.trim(),
      descripcion: descripcion || null,
      orden: Number(orden),
      estado,
    } as any;

    const ok = await onSave(payload);
    if (ok) onClose();
    else setErrorTitulo("Error al crear el módulo.");
  };

  const opcionesCursos = cursos.map((c) => ({ value: c.id_curso, label: c.nombre }));

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Módulo Académico"
      footer={
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="px-8 py-3 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-10 py-3 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/10 shadow-lg shadow-slate-900/10"
          >
            {loading ? "Procesando..." : "Registrar Módulo"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Sección: Identidad del Módulo */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identidad Académica</label>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Curso Perteneciente</label>
            <SearchableSelect
              value={cursoId}
              onChange={setCursoId}
              options={opcionesCursos}
              placeholder="Buscar curso en la base de datos..."
            />
            {errorCurso && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1 animate-pulse">{errorCurso}</p>}
          </div>

          <div>
            <InputComponent
              label="Título del Módulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Fundamentos de Arquitectura Cloud"
            />
            {errorTitulo && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1 ml-1 animate-pulse">{errorTitulo}</p>}
          </div>
        </div>

        {/* Sección: Contenido y Descripción */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50">
          <div className="flex items-center gap-3 mb-4 ml-1">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contenido y Objetivos</label>
          </div>
          
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-[13px] font-medium h-32 text-slate-700 placeholder:text-slate-300 resize-none shadow-sm"
            placeholder="Describe brevemente los temas que se abordarán en este módulo..."
          />
        </div>

        {/* Sección: Configuración Técnica */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50">
          <div className="flex items-center gap-3 mb-4 ml-1">
            <div className="w-1.5 h-4 bg-slate-400 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Configuración Técnica</label>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <InputComponent
              label="Orden de Ejecución"
              type="number"
              value={orden === "" ? "" : orden}
              onChange={(e) => setOrden(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 1"
            />
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado Inicial</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoUI)}
                className="w-full px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-[11px] font-black uppercase tracking-widest text-slate-700 cursor-pointer shadow-sm"
              >
                <option value="Publicado">Publicado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          {errorOrden && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1 animate-pulse">{errorOrden}</p>}
        </div>
      </div>
    </AdminModal>
  );
};
