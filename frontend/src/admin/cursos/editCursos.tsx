"use client";

import React, { useState, useEffect } from "react";
import InputComponent from "../Components/InputComponent";
import TextareaComponent from "../Components/TextareaComponent";
import SelectComponent from "../Components/SelectComponent";
import AdminModal from "../Components/AdminModal";
import SearchableSelect from "../Components/SearchableSelect";
import type { Curso, RutaAcademica } from "../../types/models";
import { API_URL } from "../../config/api";
import { IoBookOutline, IoTimeOutline, IoWalletOutline, IoLayersOutline, IoSaveOutline, IoSparklesOutline } from "react-icons/io5";

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso;
  onSave: (cursoActualizado: Curso) => Promise<boolean>;
}

export const EditCursoModal: React.FC<EditCursoModalProps> = ({
  isOpen,
  onClose,
  curso,
  onSave,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [descripcionCorta, setDescripcionCorta] = useState("");
  const [descripcionLarga, setDescripcionLarga] = useState("");
  const [imagen, setImagen] = useState("");
  const [video, setVideo] = useState("");
  const [loQueAprenderas, setLoQueAprenderas] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [duracion, setDuracion] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [precio, setPrecio] = useState("");
  const [nivel, setNivel] = useState("Principiante");
  const [estado, setEstado] = useState<"Publicado" | "Activo" | "Inactivo" | "Archivado">("Publicado");
  const [destacado, setDestacado] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [idRutaSeleccionada, setIdRutaSeleccionada] = useState<number | "">("");

  const [docentes, setDocentes] = useState<{ id_usuario: number; nombre: string; apellido: string }[]>([]);
  const [idDocenteSeleccionado, setIdDocenteSeleccionado] = useState<number | "">("");

  useEffect(() => {
    if (isOpen && curso) {
      setNombre(curso.nombre);
      setDescripcion(curso.descripcion ?? "");
      setDescripcionCorta(curso.descripcion_corta ?? "");
      setDescripcionLarga(curso.descripcion_larga ?? "");
      setImagen(curso.imagen ?? "");
      setVideo(curso.video_previsualizacion ?? "");
      setLoQueAprenderas(curso.lo_que_aprenderas ?? "");
      setRequisitos(curso.requisitos ?? "");
      setDuracion((curso.duracion_horas || curso.duracion)?.toString() ?? "");
      setTiempo(curso.tiempo?.toString() ?? "");
      setPrecio(curso.precio?.toString() ?? "");
      setNivel(curso.nivel ?? "Principiante");
      setEstado(curso.estado as any);
      setDestacado(curso.destacado === true || curso.destacado === 1);
      
      const docId = curso.id_docente || curso.docente?.id_usuario || "";
      setIdDocenteSeleccionado(docId as number | "");
      
      if (curso.rutas && curso.rutas.length > 0) {
        const firstRuta = curso.rutas[0];
        setIdRutaSeleccionada(typeof firstRuta === 'object' ? (firstRuta as any).id_ruta : (firstRuta as number));
      }
    }
  }, [isOpen, curso]);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const res = await fetch(`${API_URL}/rutas-academicas`);
        const data = await res.json();
        setRutas(data.data || []);
      } catch (error) {
        console.error("Error cargando rutas académicas:", error);
      }
    };
    if (isOpen) fetchRutas();
  }, [isOpen]);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {

        const res = await fetch(`${API_URL}/admin/usuarios`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const docentesFiltrados = (data.data || []).filter((u: any) => (u.id_rol === 2 || u.id_rol === 1) && u.estado === "Activo");
        setDocentes(docentesFiltrados.map((d: any) => ({ id_usuario: d.id_usuario, nombre: d.nombre, apellido: d.apellido })));
      } catch (error) {
        console.error("Error al obtener docentes:", error);
      }
    };
    if (isOpen) fetchDocentes();
  }, [isOpen]);

  const handleSave = async () => {
    if (!nombre.trim()) return alert("El nombre del curso es obligatorio.");
    if (!duracion || parseInt(duracion) <= 0) return alert("La duración debe ser mayor a 0.");

    const cursoActualizado: Curso = {
      ...curso,
      nombre,
      descripcion,
      descripcion_corta: descripcionCorta || null,
      descripcion_larga: descripcionLarga || null,
      imagen: imagen || null,
      video_previsualizacion: video || null,
      lo_que_aprenderas: loQueAprenderas || null,
      requisitos: requisitos || null,
      duracion_horas: parseInt(duracion, 10),
      tiempo: tiempo ? parseInt(tiempo, 10) : null,
      precio: precio ? parseFloat(precio) : 0,
      nivel,
      estado,
      destacado: !!destacado,
      id_docente: idDocenteSeleccionado ? Number(idDocenteSeleccionado) : undefined,
      fecha_actualizacion: new Date().toISOString(),
      rutas: idRutaSeleccionada ? [idRutaSeleccionada] as any : curso.rutas,
    };

    setIsSaving(true);
    const fueExitosa = await onSave(cursoActualizado);
    setIsSaving(false);
    if (fueExitosa) onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Curso"
      maxWidth="max-w-3xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-sky-600 font-extrabold text-[10px] uppercase tracking-widest bg-sky-50 px-4 py-2 rounded-xl border border-sky-100/50 animate-pulse w-full md:w-auto justify-center md:justify-start md:mr-auto">
            <IoSparklesOutline className="animate-spin-slow" /> 
            <span>Campos premium activados</span>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-sky-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-white/5 text-sm"
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
        {/* Section 1: Basic Info */}
        <div className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
              <IoBookOutline size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-sky-600/70">Módulo 01</h3>
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Información Principal</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputComponent label="Nombre del Curso" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Especialista en Power BI" />
          
          <SearchableSelect 
            label="Docente Asignado"
            value={idDocenteSeleccionado}
            onChange={(v) => setIdDocenteSeleccionado(v)}
            options={docentes.map(d => ({ value: d.id_usuario, label: `${d.nombre} ${d.apellido}` }))}
            placeholder="Selecciona docente..."
          />

          <SearchableSelect 
            label="Ruta Académica"
            value={idRutaSeleccionada}
            onChange={(v) => setIdRutaSeleccionada(v)}
            options={rutas.map(r => ({ value: r.id_ruta, label: r.nombre }))}
            placeholder="Selecciona ruta..."
          />

          <SelectComponent 
            label="Nivel"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            options={[
              { value: "Principiante", label: "Principiante" },
              { value: "Intermedio", label: "Intermedio" },
              { value: "Avanzado", label: "Avanzado" }
            ]}
          />
        </div>
      </div>

        {/* Section 2: Descriptions */}
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

          <TextareaComponent 
            label="Descripción General (Breve)" 
            maxLength={300} 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)} 
            placeholder="Breve resumen..." 
            className="h-28"
          />

          <InputComponent 
            label="Descripción Corta" 
            maxLength={150} 
            value={descripcionCorta} 
            onChange={(e) => setDescripcionCorta(e.target.value)} 
            placeholder="Subtítulo o frase corta" 
          />
          
          <TextareaComponent 
            label="Descripción Detallada" 
            maxLength={5000} 
            value={descripcionLarga} 
            onChange={(e) => setDescripcionLarga(e.target.value)} 
            placeholder="Contenido extenso..." 
            className="h-36"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputComponent label="Imagen de Portada (URL)" value={imagen} onChange={(e) => setImagen(e.target.value)} placeholder="URL de la imagen" />
            <InputComponent label="Video Promocional (URL)" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="URL del video" />
          </div>
        </div>

        {/* Section 3: Specs and Pricing */}
        <div className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-sm border border-amber-100/50">
              <IoTimeOutline size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-600/70">Módulo 03</h3>
              <span className="text-[13px] font-black text-slate-900 tracking-tight">Detalles de Valor</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputComponent label="Duración (Horas)" type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="Ej: 40" />
            <InputComponent label="Semanas Est." type="number" value={tiempo} onChange={(e) => setTiempo(e.target.value)} placeholder="Ej: 4" />
            <InputComponent label="Precio (S/)" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: 199.00" />
          </div>
        </div>

        {/* Section 4: Settings */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <SelectComponent 
              label="Estado del Curso"
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
              options={[
                { value: "Publicado", label: "Publicado" },
                { value: "Activo", label: "Activo (Borrador)" },
                { value: "Inactivo", label: "Inactivo" },
                { value: "Archivado", label: "Archivado" }
              ]}
              className="!py-2.5 !px-5 text-sm"
            />
            
            <label className="flex items-center gap-3 cursor-pointer group pt-6">
              <div className="relative">
                <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="sr-only" />
                <div className={`w-12 h-6 rounded-full transition-colors ${destacado ? "bg-sky-500" : "bg-gray-200"}`} />
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${destacado ? "translate-x-6" : ""}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-sky-600 transition-colors">¿Destacado?</span>
            </label>
          </div>
        </div>
      </div>
    </AdminModal>
  );
};
