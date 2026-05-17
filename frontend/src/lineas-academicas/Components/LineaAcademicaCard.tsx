import React, { useEffect, useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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
          apiUrl("/cursos"),
          { credentials: "include" }
        );
        const data = await res.json();

        const parseList = (json: any): any[] => {
          if (Array.isArray(json)) return json;
          if (Array.isArray(json?.data)) return json.data;
          if (Array.isArray(json?.items)) return json.items;
          if (Array.isArray(json?.cursos)) return json.cursos;
          return [];
        };

        const cursosData = parseList(data);

        const cursosRuta = cursosData.filter(
          (curso: Curso) => {
            const isPublicado = !curso.estado || ["Publicado", "Activo", "Activa"].includes(curso.estado);
            const isInRuta = curso.rutas && curso.rutas.some((r: any) => (r.id_ruta || r.id || r) === id_ruta);
            return isPublicado && isInRuta;
          }
        );

        setCantidadCursos(cursosRuta.length);
      } catch (error) {
        console.error("Error al obtener cursos:", error);
      }
    };

    fetchCursos();
  }, [id_ruta]);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link 
        to={detalleHref} 
        className="flex flex-col text-white group cursor-pointer h-full bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/10 hover:border-sky-500/30 transition-all duration-500 shadow-xl backdrop-blur-sm"
      >
        <div className="relative overflow-hidden aspect-video">
          <img
            src={imagen || "/ejemplo2.jpg"}
            alt={nombre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1C2B] via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 backdrop-blur-md text-[10px] font-bold text-sky-300 uppercase tracking-widest">
              {nivel || "Todos los niveles"}
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col flex-1">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 group-hover:text-sky-400 transition-colors leading-tight">
              {nombre}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-light">
              {descripcion || "Explora los fundamentos y técnicas avanzadas en esta ruta de especialización diseñada por expertos."}
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-sky-500" />
                <span className="text-xs font-bold">{cantidadCursos} Cursos</span>
              </div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default LineaAcademicaCard;

