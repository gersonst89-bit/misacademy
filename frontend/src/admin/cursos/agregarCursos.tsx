"use client";

import React, { useState, useEffect } from "react";
import InputComponent from "../Components/InputComponent";
import TextareaComponent from "../Components/TextareaComponent";
import SelectComponent from "../Components/SelectComponent";
import AdminModal from "../Components/AdminModal";
import SearchableSelect from "../Components/SearchableSelect";
import type { Curso, RutaAcademica } from "../../types/models";
import { apiUrl, API_URL } from "../../config/api";
import { IoBookOutline, IoTimeOutline, IoWalletOutline, IoLayersOutline, IoSparklesOutline } from "react-icons/io5";

interface AddCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    newCurso: Omit<Curso, "id_curso" | "fecha_creacion" | "fecha_actualizacion">
  ) => Promise<boolean>;
}

export const AddCursoModal: React.FC<AddCursoModalProps> = ({
  isOpen,
  onClose,
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
  const [tiempo, setTiempo] = useState("");
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [nivel, setNivel] = useState("Principiante");
  const [estado, setEstado] = useState<"Publicado" | "Activo" | "Inactivo" | "Archivado">("Archivado");
  const [destacado, setDestacado] = useState(false);

  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [idRutaSeleccionada, setIdRutaSeleccionada] = useState<number | "">("");

  const [docentes, setDocentes] = useState<{ id_usuario: number; nombre: string; apellido: string }[]>([]);
  const [idDocenteSeleccionado, setIdDocenteSeleccionado] = useState<number | "">("");

  useEffect(() => {
    if (isOpen) {
      setNombre("");
      setDescripcion("");
      setDescripcionCorta("");
      setDescripcionLarga("");
      setImagen("");
      setVideo("");
      setLoQueAprenderas("");
      setRequisitos("");
      setTiempo("");
      setDuracion("");
      setPrecio("");
      setNivel("Principiante");
      setEstado("Archivado");
      setDestacado(false);
      setIdRutaSeleccionada("");
      setIdDocenteSeleccionado("");
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const res = await fetch(apiUrl("/rutas-academicas"));
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
        const docentesFiltrados = (data.data || []).filter(
          (u: any) => (u.id_rol === 2 || u.id_rol === 1) && u.estado === "Activo"
        );
        setDocentes(
          docentesFiltrados.map((d: any) => ({
            id_usuario: d.id_usuario,
            nombre: d.nombre,
            apellido: d.apellido,
          }))
        );
      } catch (error) {
        console.error("Error al obtener docentes:", error);
      }
    };
    if (isOpen) fetchDocentes();
  }, [isOpen]);

  const handleSave = async () => {
    if (!nombre.trim()) return alert("El nombre del curso es obligatorio.");
    if (!duracion || parseInt(duracion) <= 0) return alert("La duración debe ser mayor a 0.");
    if (!precio || parseFloat(precio) < 0) return alert("El precio debe ser válido.");
    if (idRutaSeleccionada === "") return alert("Selecciona una ruta académica.");
    if (idDocenteSeleccionado === "") return alert("Selecciona un docente asignado.");

    const nuevoCurso: any = {
      nombre,
      descripcion,
      descripcion_corta: descripcionCorta || undefined,
      descripcion_larga: descripcionLarga || undefined,
      imagen: imagen || undefined,
      video_previsualizacion: video || undefined,
      lo_que_aprenderas: loQueAprenderas || undefined,
      requisitos: requisitos || undefined,
      duracion_horas: parseInt(duracion, 10),
      tiempo: tiempo ? parseInt(tiempo, 10) : undefined,
      precio: parseFloat(precio),
      nivel,
      estado,
      destacado: !!destacado,
      id_docente: Number(idDocenteSeleccionado),
      rutas: [Number(idRutaSeleccionada)],
    };

    const fueExitosa = await onSave(nuevoCurso);
    if (fueExitosa) onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Curso"
      maxWidth="max-w-4xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-sky-500 font-bold text-[10px] md:text-xs animate-pulse bg-sky-50/50 md:bg-transparent w-full md:w-auto justify-center md:justify-start py-2.5 md:py-0 rounded-xl md:mr-auto">
            <IoSparklesOutline /> 
            <span>Campos premium activados</span>
          </div>
          <button 
            onClick={handleSave} 
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-sky-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5 text-sm"
          >
            Crear Curso
          </button>
          <button onClick={onClose} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-sm">
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6 md:space-y-10">
        {/* Section 1: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
              <IoBookOutline size={18} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Información General</h3>
          </div>
          
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

        {/* Section 2: Descriptions */}
        <div className="space-y-8 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
              <IoLayersOutline size={18} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Descripciones y Medios</h3>
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
        <div className="pt-4 space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
              <IoTimeOutline size={18} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Especificaciones y Precio</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InputComponent label="Duración (Horas)" type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="Ej: 40" />
            <InputComponent label="Semanas Est." type="number" value={tiempo} onChange={(e) => setTiempo(e.target.value)} placeholder="Ej: 4" />
            <InputComponent label="Precio (S/)" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: 199.00" />
          </div>
        </div>

        {/* Section 4: Settings */}
        <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <SelectComponent 
              label="Estado Inicial"
              value={estado}
              onChange={(e) => setEstado(e.target.value as "Publicado" | "Archivado")}
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
