import React from "react";
import { MdLock, MdMenuBook } from "react-icons/md";

interface Props {
  leccionRequerida?: {
    titulo: string;
    progreso_porcentaje?: number;
    tiempo_restante?: string;
  };
  onIrALeccion?: () => void;
  onClose?: () => void;
}

const ModalBloqueo: React.FC<Props> = ({ leccionRequerida, onIrALeccion, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-2"><MdLock className="text-4xl text-gray-600" /></div>
        <h2 className="text-xl font-bold mb-2">Lección bloqueada</h2>
        <div className="mb-4 text-gray-700">Debes completar primero:</div>
        {leccionRequerida && (
          <div className="mb-2">
            <div className="font-semibold text-blue-900 flex items-center gap-2"><MdMenuBook className="text-xl" /> {leccionRequerida.titulo}</div>
            {leccionRequerida.progreso_porcentaje !== undefined && (
              <div className="text-sm text-gray-500">Progreso: {leccionRequerida.progreso_porcentaje}%</div>
            )}
            {leccionRequerida.tiempo_restante && (
              <div className="text-sm text-gray-500">Te falta: {leccionRequerida.tiempo_restante}</div>
            )}
          </div>
        )}
        <div className="flex gap-4 justify-center mt-6">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
            onClick={onIrALeccion}
          >
            Ir a esa lección
          </button>
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalBloqueo;
