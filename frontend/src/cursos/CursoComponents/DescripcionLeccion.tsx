import React from "react";

interface Props {
  leccion: {
    descripcion?: string;
  };
}

const DescripcionLeccion: React.FC<Props> = ({ leccion }) => {
  if (!leccion.descripcion) return null;
  return (
    <div className="mb-6 p-4 bg-[#101A2B] rounded-lg shadow-lg text-gray-300 text-base border border-gray-800">
      {leccion.descripcion}
    </div>
  );
};

export default DescripcionLeccion;
