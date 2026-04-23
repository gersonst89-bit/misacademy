"use client";

import React, { useState, useEffect } from "react";
import InputComponent from "../components/InputComponent";
import type { Curso, RutaAcademica } from "../../types/models";
import { apiUrl,API_URL } from "../../config/api";

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
  const [estado, setEstado] = useState<"Publicado" | "Archivado">("Archivado");
  const [destacado, setDestacado] = useState(false);

  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [busquedaRuta, setBusquedaRuta] = useState("");
  const [mostrarSugerenciasRuta, setMostrarSugerenciasRuta] = useState(false);
  const [idRutaSeleccionada, setIdRutaSeleccionada] = useState<number | null>(null);

  const [docentes, setDocentes] = useState<{ id_usuario: number; nombre: string; apellido: string }[]>([]);
  const [busquedaDocente, setBusquedaDocente] = useState("");
  const [mostrarSugerenciasDocente, setMostrarSugerenciasDocente] = useState(false);
  const [idDocenteSeleccionado, setIdDocenteSeleccionado] = useState<number | null>(null);

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
      setBusquedaRuta("");
      setIdRutaSeleccionada(null);
      setBusquedaDocente("");
      setIdDocenteSeleccionado(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const res = await fetch(apiUrl("/rutas"));
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/usuarios`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      const docentesFiltrados = (data.data || []).filter(
        (u: any) => u.id_rol === 3 && u.estado === "Activo"
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
      setDocentes([]);
    }
  };

  if (isOpen) fetchDocentes();
}, [isOpen]);


  const handleSave = async () => {
    if (!nombre.trim()) return alert("El nombre del curso es obligatorio.");
    if (!duracion || parseInt(duracion) <= 0) return alert("La duración debe ser mayor a 0.");
    if (!precio || parseFloat(precio) < 0) return alert("El precio debe ser válido.");
    if (!idRutaSeleccionada) return alert("Selecciona una ruta académica.");
    if (!idDocenteSeleccionado) return alert("Selecciona un docente asignado.");

    const nuevoCurso: Omit<Curso, "id_curso" | "fecha_creacion" | "fecha_actualizacion"> = {
      nombre,
      descripcion,
      descripcion_corta: descripcionCorta || null,
      descripcion_larga: descripcionLarga || null,
      imagen: imagen || null,
      video_previsualizacion: video || null,
      lo_que_aprenderas: loQueAprenderas || null,
      requisitos: requisitos || null,
      duracion: parseInt(duracion, 10),
      tiempo: tiempo ? parseInt(tiempo, 10) : null,
      precio: parseFloat(precio),
      nivel,
      estado,
      destacado: destacado ? 1 : 0,
      id_docente: idDocenteSeleccionado,
      docente: null,
      rutas: [idRutaSeleccionada],
    };

    const fueExitosa = await onSave(nuevoCurso);
    if (fueExitosa) onClose();
    else alert("Ocurrió un error al agregar el curso.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Agregar Nuevo Curso</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Ruta Académica</label>
          <div className="relative">
            <input
              type="text"
              value={busquedaRuta}
              onChange={(e) => { setBusquedaRuta(e.target.value); setMostrarSugerenciasRuta(true); }}
              onFocus={() => setMostrarSugerenciasRuta(true)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600"
              placeholder="Buscar ruta..."
            />
            {mostrarSugerenciasRuta && busquedaRuta.length > 0 && (
              <ul className="absolute z-50 bg-white border w-full rounded shadow max-h-40 overflow-y-auto mt-1">
                {rutas.filter(r => r.nombre.toLowerCase().includes(busquedaRuta.toLowerCase())).map(ruta => (
                  <li
                    key={ruta.id_ruta}
                    className="p-2 hover:bg-sky-100 cursor-pointer"
                    onClick={() => { setIdRutaSeleccionada(ruta.id_ruta); setBusquedaRuta(ruta.nombre); setMostrarSugerenciasRuta(false); }}
                  >
                    {ruta.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Docente Asignado</label>
          <div className="relative">
            <input
              type="text"
              value={busquedaDocente}
              onChange={(e) => { setBusquedaDocente(e.target.value); setMostrarSugerenciasDocente(true); }}
              onFocus={() => setMostrarSugerenciasDocente(true)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600"
              placeholder="Buscar docente..."
            />
            {mostrarSugerenciasDocente && busquedaDocente.length > 0 && (
              <ul className="absolute z-50 bg-white border w-full rounded shadow max-h-40 overflow-y-auto mt-1">
                {docentes
                  .filter((d) =>
                    `${d.nombre} ${d.apellido}`.toLowerCase().includes(busquedaDocente.toLowerCase())
                  )
                  .map((d) => (
                    <li
                      key={d.id_usuario}
                      className="p-2 hover:bg-sky-100 cursor-pointer"
                      onClick={() => {
                        setIdDocenteSeleccionado(d.id_usuario);
                        setBusquedaDocente(`${d.nombre} ${d.apellido}`);
                        setMostrarSugerenciasDocente(false);
                      }}
                    >
                      {d.nombre} {d.apellido}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        <InputComponent label="Nombre del Curso" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Curso de React Avanzado" />
        <div className="mb-3">
           <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea      maxLength={48} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="mt-2 p-2 w-full border border-gray-300 rounded-md h-24 resize-none" placeholder="Descripción general del curso" /> 
            <p className="text-sm text-gray-500 mt-1">
            {descripcion.length}/48 caracteres
          </p>
          </div>
     <div className="mb-3">
           <InputComponent label="Descripción corta"     maxLength={50} value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)}     placeholder="Ingresa descripción corta"/> 
           <p className="text-sm text-gray-500 mt-1">
            {descripcionCorta.length}/50 caracteres
          </p>
           </div>
        <div className="mb-3">
           <label className="block text-sm font-semibold text-gray-700">
            Descripción larga
          </label>
        <textarea   maxLength={70} value={descripcionLarga} onChange={(e) => setDescripcionLarga(e.target.value)} className="mt-2 p-2 w-full border border-gray-300 rounded-md h-32 resize-none" placeholder="Descripción larga" /> 
          <p className="text-sm text-gray-500 mt-1">
            {descripcionLarga.length}/70 caracteres
          </p>
        </div>
        <InputComponent label="Imagen (URL)" value={imagen} onChange={(e) => setImagen(e.target.value)}     placeholder="Ingresa imagen"/>
        <InputComponent label="Video (URL)" value={video} onChange={(e) => setVideo(e.target.value)}     placeholder="Ingresa URL del video"/>
        <InputComponent label="Lo que aprenderás" value={loQueAprenderas} onChange={(e) => setLoQueAprenderas(e.target.value)}     placeholder="Ingresa lo que se aprenderá en el curso"/>
        <InputComponent label="Requisitos" value={requisitos} onChange={(e) => setRequisitos(e.target.value)}     placeholder="Ingresa requisitos del curso"/>
        <InputComponent label="Duración (horas)" type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)}     placeholder="Ingresa duración del curso"/>
        <InputComponent label="Tiempo estimado (semanas)" type="number" value={tiempo} onChange={(e) => setTiempo(e.target.value)}     placeholder="Ingresa tiempo de duración del curso" />
        <InputComponent label="Precio (S/)" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)}     placeholder="Ingresa precio del curso"/>

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">Nivel</label>
          <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="mt-1 p-2 w-full border border-gray-300 rounded-md">
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as "Publicado" | "Archivado")} className="mt-1 p-2 w-full border border-gray-300 rounded-md">
            <option value="Publicado">Publicado</option>
            <option value="Archivado">Archivado</option>
          </select>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} id="destacado" className="w-4 h-4 text-sky-600 border-gray-300 rounded" />
          <label htmlFor="destacado" className="text-sm text-gray-700">¿Marcar como destacado?</label>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Agregar</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
        </div>
      </div>
    </div>
  );
};
