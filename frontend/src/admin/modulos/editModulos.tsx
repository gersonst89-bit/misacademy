"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Modulo, Curso } from "../../types/models";
import InputComponent from "../components/InputComponent";
import { API_URL } from "../../config/api";

const API_PUBLIC = API_URL;
type EstadoUI = "Activo" | "Inactivo";

const toUi = (api: string): EstadoUI =>
  api === "Activo" || api === "Publicado"
    ? "Activo"
    : api === "Inactivo" || api === "Archivado"
    ? "Inactivo"
    : "Activo";

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
}: {
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const labelActual = options.find((o) => o.value === value)?.label || "";

  const filtradas = useMemo(() => {
    const t = q.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(t));
  }, [q, options]);

  return (
    <div className="relative">
      <input
        onFocus={() => setOpen(true)}
        value={open ? q : labelActual}
        onChange={(e) => {
          setQ(e.target.value);
          if (!open) setOpen(true);
        }}
        placeholder={placeholder}
        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
      />
      {open && (
        <div
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtradas.map((o) => (
            <button
              key={o.value}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                onChange(o.value);
                setQ("");
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [cursoId, setCursoId] = useState<number>(modulo.id_curso);
  const [titulo, setTitulo] = useState(modulo.titulo);
  const [descripcion, setDescripcion] = useState(modulo.descripcion || "");
  const [orden, setOrden] = useState<number>(modulo.orden);
  const [estado, setEstado] = useState<EstadoUI>(toUi((modulo as any).estado));
  const [saving, setSaving] = useState(false);
  const [errorOrden, setErrorOrden] = useState<string>("");

  const fetchAllCursos = async (): Promise<Curso[]> => {
    let todos: Curso[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await fetch(`${API_PUBLIC}/cursos?page=${page}`);
      const data = await res.json();
      const pageCursos: Curso[] = data.data || [];
      todos = [...todos, ...pageCursos];
      lastPage = data.last_page || 1;
      page++;
    } while (page <= lastPage);

    return todos;
  };

  const fetchAllModulos = async (): Promise<Modulo[]> => {
    const token = localStorage.getItem("token");

    let todos: Modulo[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await fetch(`${API_PUBLIC}/modulos?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al cargar módulos privados");

      const data = await res.json();
      console.log("MODULOS DATA:", data);

      const pageMods: Modulo[] = data.data || [];
      todos = [...todos, ...pageMods];

      lastPage = data.last_page || 1;
      page++;
    } while (page <= lastPage);

    return todos;
  };

  useEffect(() => {
    if (!isOpen) return;

    // Reset values
    setCursoId(modulo.id_curso);
    setTitulo(modulo.titulo);
    setDescripcion(modulo.descripcion || "");
    setOrden(modulo.orden);
    setEstado(toUi((modulo as any).estado));
    setErrorOrden("");

    const cargarDatos = async () => {
      try {
        const cursosData = await fetchAllCursos();
        setCursos(cursosData);
      } catch {
        setCursos([]);
      }

      try {
        const modulosData = await fetchAllModulos();
        setModulos(modulosData);
      } catch {
        setModulos([]);
      }
    };

    cargarDatos();
  }, [isOpen, modulo]);

  const handleSave = async () => {
    setErrorOrden("");

    if (!cursoId) return setErrorOrden("Selecciona un curso.");
    if (!titulo.trim()) return setErrorOrden("El título es obligatorio.");
    if (!orden || Number(orden) < 1)
      return setErrorOrden("El orden debe ser ≥ 1.");

    const ordenExiste = modulos.some(
      (m) =>
        m.id_curso === cursoId &&
        m.orden === Number(orden) &&
        m.id_modulo !== modulo.id_modulo
    );
    if (ordenExiste)
      return setErrorOrden(
        `El orden ${orden} ya está asignado a otro módulo en este curso.`
      );

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

  if (!isOpen) return null;

  const opciones = cursos.map((c) => ({ value: c.id_curso, label: c.nombre }));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Editar Módulo
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Curso
          </label>
          <SearchableSelect
            value={cursoId}
            onChange={setCursoId}
            options={opciones}
            placeholder="Selecciona un curso…"
          />
        </div>

        <InputComponent
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg h-28 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 outline-none shadow-sm"
            placeholder="Descripción (opcional)"
          />
        </div>

        <InputComponent
          label="Orden"
          type="number"
          value={String(orden)}
          onChange={(e) => setOrden(Number(e.target.value))}
        />

        <div className="mb-1">
          <label className="block text-sm font-semibold text-gray-700">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoUI)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {errorOrden && (
          <div className="mb-4 text-red-600 font-medium text-center">
            {errorOrden}
          </div>
        )}

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded text-white text-md transition ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {saving ? "Guardando" : "Guardar Cambios"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
