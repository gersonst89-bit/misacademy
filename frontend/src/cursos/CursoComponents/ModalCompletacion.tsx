import React from "react";
import { MdCelebration } from "react-icons/md";

interface Props {
  curso: {
    nombre: string;
    progreso_total: number;
    lecciones_completadas: number;
    total_lecciones: number;
  };
  leccion: {
    titulo: string;
  };
  onContinuar?: () => void;
  onCerrar?: () => void;
}

const ModalCompletacion: React.FC<Props> = ({ curso, leccion, onContinuar, onCerrar }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none backdrop-blur-md">
      <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-4 sm:p-8 max-w-xs sm:max-w-md w-full text-center pointer-events-auto" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.18)'}}>
        <div className="flex justify-center mb-2"><MdCelebration className="text-4xl text-green-600 opacity-90" /></div>
        <h2 className="text-lg sm:text-xl font-bold mb-2 opacity-90">¡Lección completada!</h2>
        <div className="mb-4 text-gray-700 opacity-90 text-base sm:text-lg">Has completado <b>{leccion.titulo}</b></div>
        <div className="mb-4 text-sm sm:text-base">
          <div className="text-sm text-gray-500 mb-1">Progreso total del curso</div>
          <div className="w-full h-3 bg-gray-200 rounded-full mb-2">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(curso.progreso_total)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{curso.lecciones_completadas} de {curso.total_lecciones} lecciones completadas</span>
            <span>{Math.round(curso.progreso_total)}% del curso</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">Este porcentaje representa tu avance global en el curso, sumando todas las lecciones vistas.</div>
        </div>
        <div className="flex flex-col gap-2 items-center mt-4">
          <button
            className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 bg-opacity-90 text-white rounded font-bold hover:bg-blue-700 text-sm sm:text-base"
            onClick={onContinuar}
          >
            Ir a la siguiente lección
          </button>
          <button
            className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-200 bg-opacity-80 text-gray-700 rounded font-bold hover:bg-gray-300 text-sm sm:text-base"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCompletacion;
