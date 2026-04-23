import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { BsBarChartFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import type { RutaAcademica, LineaAcademica } from "../../types/models";
import { apiUrl } from "../../config/api";

type Curso = {
  id_curso: number;
  estado: string;
  rutas: { id_ruta: number }[];
};

type Props = {
  ruta: RutaAcademica;
  linea: LineaAcademica;
};

function slugify(s: string) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const LineaAcademicaCard: React.FC<Props> = ({ ruta, linea }) => {
  const { id_ruta, nombre, descripcion, imagen, nivel } = ruta;
  const [cantidadCursos, setCantidadCursos] = useState<number>(0);

  const lineaSlug = slugify(linea?.nombre || "linea");
  const rutaSlug = slugify(nombre || "ruta");
  const detalleHref = `/lineas-academicas/${lineaSlug}/${rutaSlug}`;

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch(
          apiUrl("/cursos")
        );
        const data = await res.json();

        const cursosRuta = data.data.filter(
          (curso: Curso) =>
            curso.estado === "Publicado" &&
            curso.rutas.some((r) => r.id_ruta === id_ruta)
        );

        setCantidadCursos(cursosRuta.length);
      } catch (error) {
        console.error("Error al obtener cursos:", error);
      }
    };

    fetchCursos();
  }, [id_ruta]);

  return (
    <div className="flex flex-col text-white">
      <Link to={detalleHref}>
        <img
          src={imagen || "/default-image.jpg"}
          alt={nombre}
          className="w-full h-44 object-cover rounded-xl"
          loading="lazy"
        />
      </Link>
      <div className="py-2 flex flex-col flex-1">
        <div>
          <h3 className="text-lg font-semibold mb-1 text-left">{nombre}</h3>
          <p className="text-sm text-gray-300 mb-3 text-justify">
            {descripcion || "Sin descripción disponible."}
          </p>
        </div>
        <div className="flex flex-row gap-6 text-gray-300 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span>
              {cantidadCursos} {cantidadCursos === 1 ? "curso" : "cursos"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BsBarChartFill className="w-4 h-4 text-yellow-400" />
            <span>{nivel || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineaAcademicaCard;
