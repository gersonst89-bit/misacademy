import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
  noOptionsMessage = "Sin resultados",
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  options: { value: number; label: string }[];
  placeholder?: string;
  noOptionsMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const labelActual =
    value === "" ? "" : options.find((o) => o.value === value)?.label || "";

  const filtradas = useMemo(() => {
    const t = q.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(t));
  }, [q, options]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        onFocus={() => setOpen(true)}
        value={open ? q : labelActual}
        onChange={(e) => {
          setQ(e.target.value);
          if (!open) setOpen(true);
        }}
        placeholder={placeholder}
        className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600 outline-0"
      />

      {open && (
        <div
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtradas.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              {noOptionsMessage}
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
              className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 border-t border-gray-300"
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
