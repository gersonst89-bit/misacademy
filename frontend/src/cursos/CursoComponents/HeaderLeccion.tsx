import React from "react";
import { MdAccessTime } from "react-icons/md";

interface Props {
  leccion: {
    titulo: string;
    orden: number;
    descripcion?: string;
    duracion: number;
  };
  curso: {
    nombre: string;
  };
}

const HeaderLeccion: React.FC<Props> = ({ leccion, curso }) => {
  return (
    <div className="mb-6 p-4 rounded-lg bg-[#101A2B] border border-gray-800 shadow-lg">
      <div className="text-sm text-sky-400 mb-1 font-semibold">{curso.nombre}</div>
      <h2 className="text-3xl font-extrabold text-white mb-2">
        {leccion.orden ? `Lección ${leccion.orden}: ` : ""}
        <span className="text-sky-400">{leccion.titulo}</span>
      </h2>
      <div className="flex items-center gap-4 text-gray-300 text-base font-medium">
        <span className="flex items-center gap-1"><MdAccessTime className="text-sky-400 text-lg" /> {Math.floor(leccion.duracion / 60)}:{(leccion.duracion % 60).toString().padStart(2, "0")} min</span>
        {leccion.descripcion && <span className="ml-2 text-gray-400">{leccion.descripcion}</span>}
      </div>
    </div>
  );
};

export default HeaderLeccion;
