"use client";

import React, { useEffect, useState } from "react";
import type { Modulo, Curso } from "../../types/models";
import InputComponent from "../Components/InputComponent";
import { apiClient } from "../../services/apiClient";
import AdminModal from "../Components/AdminModal";
import SearchableSelect from "../Components/SearchableSelect";

type EstadoUI = "Activo" | "Inactivo" | "Publicado";

const toUi = (api: string): EstadoUI => {
  if (api === "Publicado") return "Publicado";
  if (api === "Inactivo" || api === "Archivado") return "Inactivo";
  return "Activo";
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  modulo: Modulo;
  onSave: (editado: Modulo) => Promise<boolean>;
}

export const EditModuloModal: React.FC<Props> = ({
  isOpen,
  onClose,
  modulo,
  onSave,
}) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursoId, setCursoId] = useState<number | "">(modulo.id_curso);
  const [titulo, setTitulo] = useState(modulo.titulo);
  const [descripcion, setDescripcion] = useState(modulo.descripcion || "");
  const [orden, setOrden] = useState<number | "">(modulo.orden);
  const [estado, setEstado] = useState<EstadoUI>(toUi((modulo as any).estado));
  const [saving, setSaving] = useState(false);
  const [errorOrden, setErrorOrden] = useState<string>("");

  const fetchAllCursos = async (): Promise<Curso[]> => {
    let todos: Curso[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await apiClient.get(`/admin/cursos`, {
        params: { page }
      });
      const data = res.data;
      todos = [...todos, ...(data.data || [])];
      lastPage = data.last_page || 1;
      page++;
    } while (page <= lastPage);
    return todos;
  };

  const fetchAllModulos = async (): Promise<Modulo[]> => {
    let todos: Modulo[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await apiClient.get(`/admin/modulos`, {
        params: { page }
      });
      const data = res.data;
      todos = [...todos, ...(data.data || [])];
      lastPage = data.last_page || 1;
      page++;
    } while (page <= lastPage);
    return todos;
  };

  useEffect(() => {
    if (!isOpen) return;
    setCursoId(modulo.id_curso);
    setTitulo(modulo.titulo);
    setDescripcion(modulo.descripcion || "");
    setOrden(modulo.orden);
    setEstado(toUi((modulo as any).estado));
    setErrorOrden("");

    const cargarDatos = async () => {
      try {
        const [c, m] = await Promise.all([fetchAllCursos(), fetchAllModulos()]);
        setCursos(c);
        setModulos(m);
      } catch (err) {
        console.error(err);
      }
    };
    cargarDatos();
  }, [isOpen, modulo]);

  const handleSave = async () => {
    setErrorOrden("");
    if (!cursoId) return setErrorOrden("Selecciona un curso.");
    if (!titulo.trim()) return setErrorOrden("El título es obligatorio.");
    if (!orden || Number(orden) < 1) return setErrorOrden("El orden debe ser ≥ 1.");

    const ordenExiste = modulos.some(
      (m) =>
        m.id_curso === cursoId &&
        m.orden === Number(orden) &&
        m.id_modulo !== modulo.id_modulo
    );
    if (ordenExiste) return setErrorOrden(`El orden ${orden} ya está en uso.`);

    const editado: Modulo = {
      ...modulo,
      id_curso: Number(cursoId),
      titulo: titulo.trim(),
      descripcion: descripcion || null,
      orden: Number(orden),
      estado,
      fecha_actualizacion: new Date().toISOString(),
    };

    setSaving(true);
    const ok = await onSave(editado);
    setSaving(false);
    if (ok) onClose();
    else setErrorOrden("Error al actualizar módulo.");
  };

  const opciones = cursos.map((c) => ({ value: c.id_curso, label: c.nombre }));

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizar Módulo Académico"
      footer={
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="px-8 py-3 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
          >
            Descartar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className={`px-10 py-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-amber-500/20 transition-all active:scale-95 border border-white/10 shadow-lg shadow-amber-900/10 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "Guardando..." : "Actualizar Módulo"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Sección: Identidad del Módulo (Modo Edición) */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Modificando Identidad</label>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Curso Perteneciente</label>
            <SearchableSelect
              value={cursoId}
              onChange={setCursoId as any}
              options={opciones}
              placeholder="Buscar curso..."
            />
          </div>

          <div>
            <InputComponent
              label="Título del Módulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título descriptivo del módulo"
            />
          </div>
        </div>

        {/* Sección: Contenido */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50">
          <div className="flex items-center gap-3 mb-4 ml-1">
            <div className="w-1.5 h-4 bg-slate-400 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Descripción del Contenido</label>
          </div>
          
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all text-[13px] font-medium h-32 text-slate-700 placeholder:text-slate-300 resize-none shadow-sm"
            placeholder="Describe los objetivos de este módulo..."
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
              value={String(orden)}
              onChange={(e) => setOrden(Number(e.target.value))}
            />
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado del Módulo</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoUI)}
                className="w-full px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all text-[11px] font-black uppercase tracking-widest text-slate-700 cursor-pointer shadow-sm"
              >
                <option value="Publicado">Publicado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {errorOrden && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.15em]">{errorOrden}</p>
          </div>
        )}
      </div>
    </AdminModal>
  );
};
