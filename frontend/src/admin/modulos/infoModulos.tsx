"use client";

import { FaTimes } from "react-icons/fa";
import type { Modulo, Curso } from "../../types/models";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  modulo: (Modulo & { curso?: Curso }) | null;
  cursoNombre?: string;
}

const formatDate = (d: string | null | undefined) => {
  if (!d) return "—";
  const safe = String(d).replace(" ", "T");
  const dt = new Date(safe);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function InfoModuloModal({
  isOpen,
  onClose,
  modulo,
  cursoNombre,
}: Props) {
  if (!isOpen || !modulo) return null;

  const nombreCurso =
    cursoNombre || modulo.curso?.nombre || String((modulo as any).id_curso);
  const estadoUi =
    (modulo.estado as any) === "Publicado"
      ? "Activo"
      : (modulo.estado as any) === "Archivado"
      ? "Inactivo"
      : (modulo.estado as any);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Información del Módulo
        </h2>

        <div className="space-y-3 text-gray-700 text-sm">
          <p>
            <strong>Curso:</strong> {nombreCurso}
          </p>
          <p>
            <strong>Título:</strong> {modulo.titulo}
          </p>
          <p>
            <strong>Descripción:</strong>{" "}
            {modulo.descripcion ? modulo.descripcion : "—"}
          </p>
          <p>
            <strong>Orden:</strong> {modulo.orden}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                estadoUi === "Activo"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {estadoUi}
            </span>
          </p>
          <p>
            <strong>Fecha de creación:</strong>{" "}
            {formatDate(modulo.fecha_creacion)}
          </p>
          <p>
            <strong>Última actualización:</strong>{" "}
            {formatDate(modulo.fecha_actualizacion)}
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoModuloModal;
