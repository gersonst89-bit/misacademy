"use client";

import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evaluacion: any;
  cursoNombre?: string;
}

const formatTipo = (raw: any): string => {
  if (!raw || raw === "null" || raw === "") return "—";
  return String(raw);
};

export const InfoEvaluacionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  evaluacion,
  cursoNombre,
}) => {
  if (!isOpen || !evaluacion) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Información de la evaluación
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

          <div>
            <div className="text-gray-500">Título</div>
            <div className="font-semibold">{evaluacion.titulo}</div>
          </div>

          <div>
            <div className="text-gray-500">Tipo</div>
            <div className="font-semibold">
              {formatTipo(evaluacion.tipo)}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Curso</div>
            <div className="font-semibold">
              {cursoNombre || evaluacion.id_curso}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Punt. requerida</div>
            <div className="font-semibold">
              {evaluacion.puntuacion_requerida}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Intentos máximos</div>
            <div className="font-semibold">
              {evaluacion.intentos_maximos}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Duración (min)</div>
            <div className="font-semibold">
              {evaluacion.duracion ?? "—"}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Estado</div>
            <div className="font-semibold">
              {evaluacion.estado}
            </div>
          </div>

        </div>

        {evaluacion.descripcion && (
          <div className="mt-4">
            <div className="text-gray-500 text-sm">Descripción</div>
            <div className="whitespace-pre-wrap">
              {evaluacion.descripcion}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
