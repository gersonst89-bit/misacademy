"use client";

import React, { useEffect, useState } from "react";
import type { Curso } from "../../types/models";
import InputComponent from "../components/InputComponent";
import { API_URL } from "../../config/api";

const API_PUBLIC = API_URL;

type EstadoEval = "Publicado" | "Archivado";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evaluacion: any;
  onSave: (evActualizada: any) => Promise<boolean>;
}

export const EditEvaluacionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  evaluacion,
  onSave,
}) => {
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

  useEffect(() => {
    if (!isOpen) return;

    setTipoLibre(evaluacion?.tipo || "");
    setIdCurso(evaluacion?.id_curso || "");
    setTitulo(evaluacion?.titulo || "");
    setDescripcion(evaluacion?.descripcion || "");
    setPuntuacion(evaluacion?.puntuacion_requerida || "");
    setDuracion(evaluacion?.duracion || "");
    setIntentos(evaluacion?.intentos_maximos || "");
    setEstado(
      evaluacion?.estado === "Archivado" ? "Archivado" : "Publicado"
    );

    (async () => {
      try {
        let pagina = 1;
        let ultima = 1;
        let todos: Curso[] = [];

        do {
          const r = await fetch(`${API_PUBLIC}/cursos?page=${pagina}`);
          const d = await r.json();
          const pageItems: Curso[] = d.data || d || [];
          todos = [...todos, ...pageItems];
          ultima = d.last_page || 1;
          pagina++;
        } while (pagina <= ultima);

        setCursos(todos);
      } catch {
        setCursos([]);
      }
    })();
  }, [isOpen, evaluacion]);

  const handleSave = async () => {
    if (!idCurso) return alert("Selecciona un curso.");
    if (!titulo.trim()) return alert("El título es obligatorio.");
    if (!puntuacion || Number(puntuacion) < 1)
      return alert("La puntuación requerida debe ser >= 1.");
    if (!intentos || Number(intentos) < 1)
      return alert("Los intentos máximos deben ser >= 1.");

    const tipoParaEnviar = tipoLibre.trim() === "" ? null : tipoLibre.trim();

    const payload = {
      id_evaluacion: evaluacion.id_evaluacion,
      id_curso: Number(idCurso),
      titulo: titulo.trim(),
      tipo: tipoParaEnviar,
      descripcion: descripcion.trim() || null,
      puntuacion_requerida: Number(puntuacion),
      duracion: duracion === "" ? null : Number(duracion),
      intentos_maximos: Number(intentos),
      estado: estado, 
      fecha_actualizacion: new Date().toISOString(),
    };

    setSaving(true);
    const ok = await onSave(payload);
    setSaving(false);

    if (ok) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto animate-fade-in">

        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Editar Evaluación
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">Curso</label>
          <select
            value={idCurso}
            onChange={(e) => setIdCurso(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          >
            <option value="">Selecciona un curso…</option>
            {cursos.map((c) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Tipo 
          </label>
          <input
            value={tipoLibre}
            onChange={(e) => setTipoLibre(e.target.value)}
            placeholder='Ej.: "test", "final"'
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          />
        </div>

        <InputComponent
          label="Título"
          value={titulo}
                      placeholder="Título de la evaluación"

          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
            placeholder="Opcional"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputComponent
            label="Puntuación requerida"
            type="number"
            value={String(puntuacion)}
                        placeholder="Puntuación"

            onChange={(e) =>
              setPuntuacion(e.target.value === "" ? "" : Number(e.target.value))
            }
            min={1}
            required
          />
          <InputComponent
            label="Duración (min)"
            type="number"
            value={String(duracion)}
            onChange={(e) =>
              setDuracion(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Opcional"
            min={1}
          />
          <InputComponent
            label="Intentos máximos"
            type="number"
                        placeholder="Intentos"

            value={String(intentos)}
            onChange={(e) =>
              setIntentos(e.target.value === "" ? "" : Number(e.target.value))
            }
            min={1}
            required
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-semibold text-gray-700">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoEval)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          >
            <option value="Publicado">Publicado</option>
            <option value="Archivado">Archivado</option>
          </select>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-sky-600 rounded text-white hover:bg-sky-700 transition"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
