"use client";

import React, { useEffect, useState } from "react";
import type { Curso } from "../../types/models";
import InputComponent from "../Components/InputComponent";
import { apiUrl } from "../../config/api";
import AdminModal from "../Components/AdminModal";
import SearchableSelect from "../Components/SearchableSelect";

type EstadoEval = "Publicado" | "Archivado";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nueva: any) => Promise<boolean>;
}

export const AddEvaluacionModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tipoLibre, setTipoLibre] = useState<string>("");
  const [idCurso, setIdCurso] = useState<number | "">("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [puntuacion, setPuntuacion] = useState<number | "">("");
  const [duracion, setDuracion] = useState<number | "">("");
  const [intentos, setIntentos] = useState<number | "">("");
  const [estado, setEstado] = useState<EstadoEval>("Publicado");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTipoLibre("");
    setIdCurso("");
    setTitulo("");
    setDescripcion("");
    setPuntuacion("");
    setDuracion("");
    setIntentos("");
    setEstado("Publicado");
    setError(null);

    (async () => {
      try {
        let pagina = 1, ultima = 1, todos: Curso[] = [];
        do {
          const r = await fetch(apiUrl(`/admin/cursos?page=${pagina}`), { credentials: "include" });
          const d = await r.json();
          todos = [...todos, ...(d.data || [])];
          ultima = d.last_page || 1;
          pagina++;
        } while (pagina <= ultima);
        setCursos(todos);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isOpen]);

  const handleSave = async () => {
    setError(null);
    if (!idCurso) return setError("Debes seleccionar un curso.");
    if (!titulo.trim()) return setError("El título es obligatorio.");
    if (!puntuacion || Number(puntuacion) < 1) return setError("La puntuación debe ser ≥ 1.");
    if (!intentos || Number(intentos) < 1) return setError("Los intentos deben ser ≥ 1.");

    const payload = {
      id_curso: Number(idCurso),
      titulo: titulo.trim(),
      tipo: tipoLibre.trim() || null,
      descripcion: descripcion.trim() || null,
      puntaje_aprobatorio: Number(puntuacion),
      duracion_minutos: duracion === "" ? null : Number(duracion),
      intentos_permitidos: Number(intentos),
      estado: estado,
    };

    setSaving(true);
    const ok = await onSave(payload);
    setSaving(false);
    if (ok) onClose();
    else setError("Ocurrió un error al guardar la evaluación.");
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Nueva Evaluación"
      maxWidth="max-w-3xl"
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
            disabled={saving}
            className={`px-10 py-3 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/10 shadow-lg shadow-slate-900/10 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "Procesando..." : "Registrar Evaluación"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Sección: Identidad del Examen */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identidad Académica</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Curso Vinculado</label>
              <SearchableSelect
                value={idCurso}
                onChange={setIdCurso}
                options={cursos.map(c => ({ value: c.id_curso, label: c.nombre }))}
                placeholder="Selecciona curso..."
              />
            </div>
            <InputComponent
              label="Tipo de Prueba"
              value={tipoLibre}
              onChange={(e) => setTipoLibre(e.target.value)}
              placeholder="Ej: Examen Final, Parcial..."
            />
          </div>

          <InputComponent
            label="Título de la Evaluación"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Evaluación de Certificación Nivel 1"
          />
        </div>

        {/* Sección: Instrucciones */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50">
          <div className="flex items-center gap-3 mb-4 ml-1">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Instrucciones y Descripción</label>
          </div>
          
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-[13px] font-medium h-32 text-slate-700 placeholder:text-slate-300 resize-none shadow-sm"
            placeholder="Escribe las instrucciones que verá el alumno antes de iniciar..."
          />
        </div>

        {/* Sección: Reglas Académicas */}
        <div className="p-6 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 space-y-6">
          <div className="flex items-center gap-3 mb-4 ml-1">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Reglas y Umbrales</label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <InputComponent
              label="Puntaje Mínimo"
              type="number"
              value={String(puntuacion)}
              onChange={(e) => setPuntuacion(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 70"
            />
            <InputComponent
              label="Tiempo (Min)"
              type="number"
              value={String(duracion)}
              onChange={(e) => setDuracion(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Opcional"
            />
            <InputComponent
              label="Intentos Máx."
              type="number"
              value={String(intentos)}
              onChange={(e) => setIntentos(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 3"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Visibilidad Inicial</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoEval)}
              className="w-full px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-[11px] font-black uppercase tracking-widest text-slate-700 cursor-pointer shadow-sm"
            >
              <option value="Publicado">Publicado</option>
              <option value="Archivado">Archivado</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.15em]">{error}</p>
          </div>
        )}
      </div>
    </AdminModal>
  );
};
