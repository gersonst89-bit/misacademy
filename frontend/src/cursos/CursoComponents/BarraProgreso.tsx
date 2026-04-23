import React from "react";

interface Props {
  progreso: {
    porcentaje_completado: number;
    tiempo_visualizacion: number;
    duracion_video: number;
  };
}

function formatearTiempo(segundos: number) {
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

const BarraProgreso: React.FC<Props> = ({ progreso }) => {
  const porcentaje = Number(progreso?.porcentaje_completado) || 0;
  const tiempoVisto = Number(progreso?.tiempo_visualizacion) || 0;
  const duracionTotal = Number(progreso?.duracion_video) || 0;
  const faltante = Math.max(0, duracionTotal - tiempoVisto);
  
  return (
    <div className="mb-6">
      <div className="w-full h-3 bg-gray-200 rounded-full mb-2">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatearTiempo(tiempoVisto)} / {formatearTiempo(duracionTotal)} vistos</span>
        <span>{Math.round(porcentaje)}% completado</span>
        <span>Faltan {formatearTiempo(faltante)} para completar</span>
      </div>
    </div>
  );
};

export default BarraProgreso;
