import { useState, useMemo, useEffect, useRef } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import type { Curso } from "../../types/models";

export default function FiltroCurso({
  value,
  onChange,
  cursos,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  cursos: Curso[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const labelActual =
    value !== ""
      ? cursos.find((c) => Number(c.id_curso) === Number(value))?.nombre
      : "Todos los cursos";

  const opciones = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return cursos;
    return cursos.filter((c) => c.nombre.toLowerCase().includes(t));
  }, [q, cursos]);

  // Cerrar al click afuera
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{labelActual}</span>
        <FaChevronDown className="ml-2 opacity-70" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 px-2 pt-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar curso…"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {q && (
              <button
                title="Limpiar"
                onClick={() => setQ("")}
                className="p-2 rounded hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-auto py-1">
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Todos los cursos
            </button>

            {opciones.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Sin resultados
              </div>
            )}

            {opciones.map((c) => (
              <button
                key={c.id_curso}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  onChange(Number(c.id_curso));
                  setOpen(false);
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
