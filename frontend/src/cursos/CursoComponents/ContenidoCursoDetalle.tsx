import React from "react";
import { FaList } from "react-icons/fa";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { ImFileText2 } from "react-icons/im";
import type { Modulo, Leccion, Material } from "../../types/models";

interface ContenidoCursoDetalleProps {
  modulos: Modulo[];
  lecciones: Leccion[];
  materiales: Material[];
}

const ContenidoCursoDetalle: React.FC<ContenidoCursoDetalleProps> = ({
  modulos,
  lecciones,
  materiales,
}) => {
  const modulosSafe = Array.isArray(modulos) ? modulos : [];
  const leccionesSafe = Array.isArray(lecciones) ? lecciones : [];
  const materialesSafe = Array.isArray(materiales) ? materiales : [];

  const modulosOrdenados = [...modulosSafe].sort((a, b) => a.orden - b.orden);

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds || seconds <= 0) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const mm = String(mins).padStart(2, "0");
    const ss = String(secs).padStart(2, "0");

    return `${mm}:${ss}`;
  };

  return (
    <section className="mb-3">
      <h2 className="text-2xl font-semibold mb-3 flex items-center">
        <FaList className="mr-2 text-white" />
        Contenido del curso
      </h2>

      {modulosOrdenados.map((modulo) => {
        const leccionesDelModulo = leccionesSafe
          .filter((l) => l.id_modulo === modulo.id_modulo)
          .sort((a, b) => a.orden - b.orden);

        const materialesDelModulo = materialesSafe.filter(
          (m) => m.id_modulo === modulo.id_modulo
        );

        return (
          <details
            key={modulo.id_modulo}
            className="bg-[#0D1A28] rounded-lg p-4 mb-2"
          >
            <summary className="cursor-pointer font-semibold text-sky-400">
              {modulo.titulo}
            </summary>

            <ul className="mt-2 text-sm text-gray-200 list-disc pl-3">
              {leccionesDelModulo.map((leccion, idx) => (
                <li
                  key={`leccion-${leccion.id_leccion}`}
                  className={`flex items-center justify-start ${
                    idx < leccionesDelModulo.length - 1 ||
                    materialesDelModulo.length > 0
                      ? "pb-3"
                      : ""
                  }`}
                >
                  <MdOutlineSlowMotionVideo className="mr-2 text-gray-200 text-xl" />
                  {leccion.titulo}
                  <span className="ml-auto text-gray-400 text-sm pr-1">
                    {formatDuration(leccion.duracion)}
                  </span>
                </li>
              ))}

              {materialesDelModulo.map((material, idx) => (
                <li
                  key={`material-${material.id_material}`}
                  className={`flex items-center justify-start ${
                    idx < materialesDelModulo.length - 1 ? "pb-3" : ""
                  }`}
                >
                  <ImFileText2 className="mr-2 text-gray-200 text-lg" />
                  {material.nombre}
                  <span className="ml-auto text-gray-400 text-sm pr-1">
                    00:00
                  </span>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </section>
  );
};

export default ContenidoCursoDetalle;
