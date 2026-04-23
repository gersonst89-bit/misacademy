"use client";

import React, { useState, useEffect } from "react";
import InputComponent from "../components/InputComponent";
import type { Curso, RutaAcademica } from "../../types/models";
import { API_URL } from "../../config/api";

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
  const [estado, setEstado] = useState<"Publicado" | "Archivado">("Publicado");
  const [destacado, setDestacado] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [busquedaRuta, setBusquedaRuta] = useState("");
  const [mostrarSugerenciasRuta, setMostrarSugerenciasRuta] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] =
    useState<Partial<RutaAcademica> | null>(null);

  const [docentes, setDocentes] = useState<
    { id_usuario: number; nombre: string; apellido: string }[]
  >([]);
  const [busquedaDocente, setBusquedaDocente] = useState("");
  const [mostrarSugerenciasDocente, setMostrarSugerenciasDocente] =
    useState(false);
  const [idDocenteSeleccionado, setIdDocenteSeleccionado] = useState<
    number | null
  >(null);

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
      setDuracion(curso.duracion?.toString() ?? "");
      setTiempo(curso.tiempo?.toString() ?? "");
      setPrecio(curso.precio?.toString() ?? "");
      setNivel(curso.nivel ?? "Principiante");
      setEstado(
        curso.estado === "Archivado" || curso.estado === "Publicado"
          ? curso.estado
          : "Publicado"
      );
      setDestacado(curso.destacado === true || curso.destacado === 1);
      setIdDocenteSeleccionado(curso.id_docente || curso.docente?.id_docente || null);
      setBusquedaDocente(curso.docente?.nombre || "");
    }
  }, [isOpen, curso]);

  
useEffect(() => {
  const fetchRutas = async () => {
    try {
      const res = await fetch(`${API_URL}/rutas`);
      const data = await res.json();

      const todas = data.data || [];
      const activas = todas.filter(
        (r: any) =>
          r.estado &&
          r.estado.toLowerCase() === "activa" // asegura coincidencia sin importar mayúsculas
      );

      setRutas(activas);
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


  useEffect(() => {
    if (curso && rutas.length > 0) {
      if (curso.rutas && curso.rutas.length > 0) {
        const primeraRuta = curso.rutas[0];
        if (typeof primeraRuta === "object" && "id_ruta" in primeraRuta) {
          setRutaSeleccionada({
            id_ruta: primeraRuta.id_ruta,
            nombre: primeraRuta.nombre || "Ruta desconocida",
          });
          setBusquedaRuta(primeraRuta.nombre || "");
        } else {
          const rutaEncontrada = rutas.find(
            (r) => r.id_ruta === (primeraRuta as number)
          );
          if (rutaEncontrada) {
            setRutaSeleccionada(rutaEncontrada);
            setBusquedaRuta(rutaEncontrada.nombre);
          }
        }
      } else {
        setRutaSeleccionada(null);
        setBusquedaRuta("");
      }
    }
  }, [curso, rutas]);

  // Guardar cambios
  const handleSave = async () => {
    if (!nombre.trim()) return alert("El nombre del curso es obligatorio.");
    if (!duracion || parseInt(duracion) <= 0)
      return alert("La duración debe ser mayor a 0.");
    if (!precio || parseFloat(precio) < 0)
      return alert("El precio debe ser válido.");
    if (!rutaSeleccionada && (!curso.rutas || curso.rutas.length === 0))
      return alert("Selecciona una ruta académica.");
    if (!idDocenteSeleccionado)
      return alert("Selecciona un docente asignado al curso.");

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
      duracion: parseInt(duracion, 10),
      tiempo: tiempo ? parseInt(tiempo, 10) : null,
      precio: precio ? parseFloat(precio) : 0,
      nivel,
      estado,
      destacado: destacado ? 1 : 0,
      id_docente: idDocenteSeleccionado,
      fecha_actualizacion: new Date().toISOString(),
      rutas: rutaSeleccionada
        ? ([rutaSeleccionada.id_ruta] as unknown as {
            id_ruta: number;
            nombre: string;
          }[])
        : (curso.rutas as { id_ruta: number; nombre: string }[]),
    };

    setIsSaving(true);
    const fueExitosa = await onSave(cursoActualizado);
    setIsSaving(false);

    if (fueExitosa) onClose();
    else alert("Ocurrió un error al guardar los cambios del curso.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Editar Curso
        </h2>

        {/* Ruta académica */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Ruta Académica
          </label>
          <div className="relative">
            <input
              type="text"
              value={busquedaRuta}
              onChange={(e) => {
                setBusquedaRuta(e.target.value);
                setMostrarSugerenciasRuta(true);
              }}
              onFocus={() => setMostrarSugerenciasRuta(true)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600"
              placeholder="Buscar ruta..."
            />
            {mostrarSugerenciasRuta && busquedaRuta.length > 0 && (
              <ul className="absolute z-50 bg-white border w-full rounded shadow max-h-40 overflow-y-auto mt-1">
                {rutas
                  .filter((r) =>
                    r.nombre.toLowerCase().includes(busquedaRuta.toLowerCase())
                  )
                  .map((ruta) => (
                    <li
                      key={ruta.id_ruta}
                      className="p-2 hover:bg-sky-100 cursor-pointer"
                      onClick={() => {
                        setRutaSeleccionada(ruta);
                        setBusquedaRuta(ruta.nombre);
                        setMostrarSugerenciasRuta(false);
                      }}
                    >
                      {ruta.nombre}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* Docente */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Docente Asignado
          </label>
          <div className="relative">
            <input
              type="text"
              value={busquedaDocente}
              onChange={(e) => {
                setBusquedaDocente(e.target.value);
                setMostrarSugerenciasDocente(true);
              }}
              onFocus={() => setMostrarSugerenciasDocente(true)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600"
              placeholder="Buscar docente..."
            />
            {mostrarSugerenciasDocente && busquedaDocente.length > 0 && (
              <ul className="absolute z-50 bg-white border w-full rounded shadow max-h-40 overflow-y-auto mt-1">
                {docentes
                  .filter((d) =>
                    `${d.nombre} ${d.apellido}`
                      .toLowerCase()
                      .includes(busquedaDocente.toLowerCase())
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

        <InputComponent
          label="Nombre del Curso"
          placeholder="Ingresa el nombre del curso"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            placeholder="Ingresa una breve descripción"
            maxLength={48}
            onChange={(e) => setDescripcion(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md h-24 resize-none focus:ring-2 focus:ring-sky-600"
          />
          <p className="text-sm text-gray-500 mt-1">
            {descripcion.length}/48 caracteres
          </p>
        </div>

        <div className="mb-3">
  <InputComponent
    label="Descripción corta"
    placeholder="Ingresa descripción corta"
    maxLength={50}
    value={descripcionCorta}
    onChange={(e) => setDescripcionCorta(e.target.value)}
  />
  <p className="text-sm text-gray-500 mt-1">
    {descripcionCorta.length}/50 caracteres
  </p>
</div>


        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción larga
          </label>
          <textarea
            value={descripcionLarga}           
            placeholder="Ingresa descripción larga"            
             maxLength={70}
            onChange={(e) => setDescripcionLarga(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md h-24 resize-none focus:ring-2 focus:ring-sky-600"
          />
           <p className="text-sm text-gray-500 mt-1">
    {descripcionLarga.length}/70 caracteres
  </p>
        </div>

        <InputComponent label="Imagen (URL)"  placeholder="Ingresa imagen" value={imagen} onChange={(e) => setImagen(e.target.value)} />
        <InputComponent label="Video (URL)"   placeholder="Ingresa url del video"value={video} onChange={(e) => setVideo(e.target.value)} />
        <InputComponent label="Lo que aprenderás"   placeholder="Ingresa lo que se aprenderá en el curso" value={loQueAprenderas} onChange={(e) => setLoQueAprenderas(e.target.value)} />
        <InputComponent label="Requisitos"     placeholder="Ingresa los requisitos para el curso"value={requisitos} onChange={(e) => setRequisitos(e.target.value)} />
        <InputComponent label="Duración (horas)"   placeholder="Ingresa la duración del curso" type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} />
        <InputComponent label="Tiempo estimado (semanas)"             placeholder="Ingresa el tiempo de duración del curso" type="number" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
        <InputComponent label="Precio (S/)"    placeholder="Ingresa el precio del curso" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} />

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Nivel
          </label>
          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value as "Publicado" | "Archivado")
            }
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="Publicado">Publicado</option>
            <option value="Archivado">Archivado</option>
          </select>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            id="destacado"
            className="w-4 h-4 text-sky-600 border-gray-300 rounded"
          />
          <label htmlFor="destacado" className="text-sm text-gray-700">
            ¿Marcar como destacado?
          </label>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded text-white transition ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
