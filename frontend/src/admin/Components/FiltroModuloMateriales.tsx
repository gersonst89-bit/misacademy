import { useState, useRef, useEffect, useMemo } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import type { Modulo } from "../../types/models";

interface FiltroModuloProps {
  value: number | "";
  onChange: (v: number | "") => void;
  modulos: Modulo[];
}

export function FiltroModulo({ value, onChange, modulos }: FiltroModuloProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const labelActual =
    (value !== "" && modulos.find((m) => m.id_modulo === value)?.titulo) ||
    "Todos los módulos";

  const opciones = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return modulos;
    return modulos.filter((m) => m.titulo.toLowerCase().includes(t));
  }, [q, modulos]);

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
              placeholder="Buscar módulo…"
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
              Todos los módulos
            </button>

            {opciones.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Sin resultados
              </div>
            )}

            {opciones.map((m) => (
              <button
                key={m.id_modulo}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  onChange(m.id_modulo);
                  setOpen(false);
                }}
              >
                {m.titulo}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
