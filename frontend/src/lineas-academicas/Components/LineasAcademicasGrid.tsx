import type { FC } from "react";
import type { RutaAcademica, LineaAcademica } from "../../types/models";
import LineaAcademicaCard from "./LineaAcademicaCard";

interface Props {
  lineas: RutaAcademica[];
  linea: LineaAcademica;
  lineaNombre?: string;
}

const LineasAcademicasGrid: FC<Props> = ({ lineas, linea, lineaNombre }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {lineas.map((ruta) => (
        <LineaAcademicaCard key={ruta.id_ruta} ruta={ruta} linea={linea} lineaNombre={lineaNombre || linea.nombre} />
      ))}
    </div>
  );
};

export default LineasAcademicasGrid;
