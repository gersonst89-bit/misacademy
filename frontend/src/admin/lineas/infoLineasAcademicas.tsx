import React from "react";
import type { LineaAcademica } from "../../types/models";

interface InfoLineaModalProps {
  isOpen: boolean;
  onClose: () => void;
  linea: LineaAcademica | null;
}

export const InfoLineaModal: React.FC<InfoLineaModalProps> = ({
  isOpen,
  onClose,
  linea,
}) => {
  if (!isOpen || !linea) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "No disponible";

    const formattedDate = date.replace(" ", "T");
    const dateObject = new Date(formattedDate);

    if (isNaN(dateObject.getTime())) return "No disponible";

    return dateObject.toLocaleDateString("es-ES");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Información de la Línea Académica
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          {linea.imagen ? (
            <div className="flex flex-row">
              <img
                src={linea.imagen}
                alt="Imagen asociada"
                className="w-full h-60 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-row">
              <strong>Imagen:</strong>
              <p className="ml-1">No hay imagen disponible.</p>
            </div>
          )}
          <p>
            <strong>Nombre:</strong> {linea.nombre}
          </p>

          <p>
            <strong>Descripción:</strong> {linea.descripcion ?? "No disponible"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                linea.estado === "Publicado"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {linea.estado}
            </span>
          </p>
          <p>
            <strong>Fecha de creación:</strong>{" "}
            {formatDate(linea.fecha_creacion)}
          </p>
          <p>
            <strong>Última actualización:</strong>{" "}
            {formatDate(linea.fecha_actualizacion)}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
