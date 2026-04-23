"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Modulo, Curso } from "../../types/models";
import InputComponent from "../components/InputComponent";
import { API_URL } from "../../config/api";

const API_PUBLIC = API_URL;
type EstadoUI = "Activo" | "Inactivo";

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  options: { value: number; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const labelActual =
    value === "" ? "" : options.find((o) => o.value === value)?.label || "";

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
          {filtradas.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Sin resultados
            </div>
          )}
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
          {value !== "" && (
            <button
              className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 border-t"
              onClick={() => {
                onChange("");
                setQ("");
                setOpen(false);
              }}
            >
              Limpiar selección
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("token");

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
      // =================== CURSOS ===================
      try {
        let lista: Curso[] = [];
        let pagina = 1;
        let ultimaPagina = 1;

        do {
          const res = await fetch(`${API_PUBLIC}/cursos?page=${pagina}`);
          const data = await res.json();

          const paginaCursos: Curso[] = data.data || [];
          lista = [...lista, ...paginaCursos];

          ultimaPagina = data.last_page || 1;
          pagina++;
        } while (pagina <= ultimaPagina);

        setCursos(lista);
      } catch {
        setCursos([]);
      }

      // =================== MODULOS PRIVADOS ===================
      try {
        let lista: Modulo[] = [];
        let pagina = 1;
        let ultimaPagina = 1;

        do {
          const res = await fetch(
            `${API_PUBLIC}/modulos?page=${pagina}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (!res.ok) throw new Error("Error en módulos");

          const data = await res.json();
          console.log("MODULOS DATA:", data);

          const paginaModulos: Modulo[] = data.data || [];
          lista = [...lista, ...paginaModulos];

          ultimaPagina = data.last_page || 1;
          pagina++;
        } while (pagina <= ultimaPagina);

        setModulos(lista);
      } catch {
        setModulos([]);
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
        setErrorOrden(
          `El orden ${orden} ya está asignado a otro módulo en este curso.`
        );
        hasError = true;
      }
    }

    if (hasError) return;

    const payload: Omit<
      Modulo,
      "id_modulo" | "fecha_creacion" | "fecha_actualizacion"
    > = {
      id_curso: Number(cursoId),
      titulo: titulo.trim(),
      descripcion: descripcion || null,
      orden: Number(orden),
      estado,
    } as any;

    const ok = await onSave(payload);
    if (ok) onClose();
    else setErrorTitulo("Ocurrió un error al crear el módulo.");
  };

  if (!isOpen) return null;

  const opciones = cursos.map((c) => ({ value: c.id_curso, label: c.nombre }));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Agregar Módulo
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
          {errorCurso && (
            <div className="mb-2 text-red-600 font-medium text-center">
              {errorCurso}
            </div>
          )}
        </div>

        <InputComponent
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej.: Introducción"
        />
        {errorTitulo && (
          <div className="mb-2 text-red-600 font-medium text-center">
            {errorTitulo}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg h-28 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 outline-none shadow-sm"
            placeholder="Descripción del módulo (opcional)"
          />
        </div>

        <InputComponent
          label="Orden"
          type="number"
          value={orden === "" ? "" : orden}
          onChange={(e) =>
            setOrden(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Ej.: 1"
        />
        {errorOrden && (
          <div className="mb-2 text-red-600 font-medium text-center">
            {errorOrden}
          </div>
        )}

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

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700 transition text-white text-md"
          >
            Agregar
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
