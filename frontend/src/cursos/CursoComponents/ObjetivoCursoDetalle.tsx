import React from "react";
import { FaCheck, FaLightbulb } from "react-icons/fa";

interface ObjetivoCursoDetalleProps {
  aprendizajes: string[];
}

const ObjetivoCursoDetalle: React.FC<ObjetivoCursoDetalleProps> = ({
  aprendizajes,
}) => {
  return (
    <section className="mb-4">
      <h2 className="text-2xl font-semibold mb-3 flex items-center">
        <FaLightbulb className="mr-2 text-white" />
        Lo que aprenderás
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-disc pl-1 text-gray-300 text-sm">
        {aprendizajes.map((item, i) => (
          <li key={i} className="flex items-center">
            <FaCheck className="mr-2 text-green-500" /> {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ObjetivoCursoDetalle;
