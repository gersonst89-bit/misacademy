import React from "react";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { useNavigate } from "react-router-dom";

interface Props {
  idCurso: number | string;
  navegacion: {
    leccionAnterior?: { id_leccion?: number | string; id?: number | string; titulo: string; estado?: string };
    leccionSiguiente?: { id_leccion?: number | string; id?: number | string; titulo: string; estado?: string };
  };
  puedeAccederSiguiente?: boolean;
}

const NavegacionRapida: React.FC<Props> = ({ idCurso, navegacion, puedeAccederSiguiente }) => {
  const navigate = useNavigate();
  const puedeIrAnterior = !!navegacion.leccionAnterior;
  const puedeIrSiguiente = !!navegacion.leccionSiguiente && puedeAccederSiguiente;

  const getIdLeccion = (leccion?: { id_leccion?: number | string; id?: number | string }) => {
    return leccion?.id_leccion ?? leccion?.id;
  };

  return (
    <div className="flex justify-between items-center mt-8 mb-4 gap-4">
      <button
        className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${puedeIrAnterior ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        disabled={!puedeIrAnterior}
        onClick={() => {
          if (puedeIrAnterior) navigate(`/curso/${idCurso}/leccion/${getIdLeccion(navegacion.leccionAnterior)}`);
        }}
      >
        <MdArrowBack className="text-base" /> {navegacion.leccionAnterior?.titulo || "Anterior"}
      </button>
      <button
        className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${puedeIrSiguiente ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        disabled={!puedeIrSiguiente}
        title={!puedeIrSiguiente ? "Debes completar al menos el 90% de la lección actual para avanzar" : undefined}
        onClick={() => {
          if (puedeIrSiguiente) navigate(`/curso/${idCurso}/leccion/${getIdLeccion(navegacion.leccionSiguiente)}`);
        }}
      >
        {navegacion.leccionSiguiente?.titulo || "Siguiente"} <MdArrowForward className="text-base" />
      </button>
    </div>
  );
};

export default NavegacionRapida;
