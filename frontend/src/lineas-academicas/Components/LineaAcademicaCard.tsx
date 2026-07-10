import React, { useEffect, useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { RutaAcademica, LineaAcademica } from "../../types/models";
import { apiClient } from "../../services/apiClient";

type Curso = {
  id_curso: number;
  estado: string;
  rutas: { id_ruta: number }[];
};

type Props = {
  ruta: RutaAcademica;
  linea: LineaAcademica;
  lineaNombre?: string;
};

const getAccent = (nombre: string) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("ia") || n.includes("inteligencia")) return {
    hoverBorder: "hover:border-purple-500/40",
    hoverShadow: "hover:shadow-[0_20px_50px_-15px_rgba(168,85,247,0.25)]",
    badge: "bg-purple-500/20 border-purple-500/30 text-purple-300",
    titleHover: "group-hover:text-purple-400",
    bookIcon: "text-purple-400",
    arrowHover: "group-hover:bg-purple-500",
  };
  if (n.includes("teacher") || n.includes("docente") || n.includes("educa")) return {
    hoverBorder: "hover:border-emerald-500/40",
    hoverShadow: "hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.25)]",
    badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    titleHover: "group-hover:text-emerald-400",
    bookIcon: "text-emerald-400",
    arrowHover: "group-hover:bg-emerald-500",
  };
  if (n.includes("business") || n.includes("negocio") || n.includes("empresa")) return {
    hoverBorder: "hover:border-amber-500/40",
    hoverShadow: "hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.25)]",
    badge: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    titleHover: "group-hover:text-amber-400",
    bookIcon: "text-amber-400",
    arrowHover: "group-hover:bg-amber-500",
  };
  return {
    hoverBorder: "hover:border-sky-500/40",
    hoverShadow: "hover:shadow-[0_20px_50px_-15px_rgba(14,165,233,0.25)]",
    badge: "bg-sky-500/20 border-sky-500/30 text-sky-300",
    titleHover: "group-hover:text-sky-400",
    bookIcon: "text-sky-400",
    arrowHover: "group-hover:bg-sky-500",
  };
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

const LineaAcademicaCard: React.FC<Props> = ({ ruta, linea, lineaNombre }) => {
  const { id_ruta, nombre, descripcion, imagen, nivel, cursos } = ruta;
  const [cantidadCursos, setCantidadCursos] = useState<number>(cursos?.length || 0);
  const accent = getAccent(lineaNombre || linea?.nombre || "");

  const lineaSlug = slugify(linea?.nombre || "linea");
  const rutaSlug = slugify(nombre || "ruta");
  const detalleHref = `/lineas-academicas/${lineaSlug}/${rutaSlug}`;

  useEffect(() => {
    if (cursos && Array.isArray(cursos)) {
      setCantidadCursos(cursos.length);
      return;
    }

    const fetchCursos = async () => {
      try {
        const res = await apiClient.get("/cursos");
        const data = res.data;

        const parseList = (json: any): any[] => {
          if (Array.isArray(json)) return json;
          if (Array.isArray(json?.data)) return json.data;
          if (Array.isArray(json?.items)) return json.items;
          if (Array.isArray(json?.cursos)) return json.cursos;
          return [];
        };

        const cursosData = parseList(data);
        const cursosRuta = cursosData.filter((curso: Curso) => {
          const isPublicado = !curso.estado || ["Publicado", "Activo", "Activa"].includes(curso.estado);
          const isInRuta = curso.rutas && curso.rutas.some((r: any) => (r.id_ruta || r.id || r) === id_ruta);
          return isPublicado && isInRuta;
        });

        setCantidadCursos(cursosRuta.length);
      } catch (error) {
        console.error("Error al obtener cursos:", error);
      }
    };

    fetchCursos();
  }, [id_ruta, cursos]);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={detalleHref}
        className={`flex flex-col text-white group cursor-pointer h-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-xl backdrop-blur-sm ${accent.hoverBorder} ${accent.hoverShadow} hover:bg-white/[0.05]`}
      >
        <div className="relative overflow-hidden aspect-video">
          <img
            src={imagen || "/ejemplo2.jpg"}
            alt={nombre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03070c] via-transparent to-transparent opacity-80" />

          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1 rounded-full border backdrop-blur-md text-[10px] font-bold uppercase tracking-widest ${accent.badge}`}>
              {nivel || "Todos los niveles"}
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col flex-1">
          <div className="mb-6">
            <h3 className={`text-xl font-bold mb-3 transition-colors leading-tight ${accent.titleHover}`}>
              {nombre}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-light group-hover:text-slate-300 transition-colors">
              {descripcion || "Explora los fundamentos y técnicas avanzadas en esta ruta de especialización diseñada por expertos."}
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className={accent.bookIcon} />
                <span className="text-xs font-bold">{cantidadCursos} Cursos</span>
              </div>
            </div>

            <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:text-white transition-all duration-500 ${accent.arrowHover}`}>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default LineaAcademicaCard;
