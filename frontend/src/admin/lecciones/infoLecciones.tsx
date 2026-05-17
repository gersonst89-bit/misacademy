import React, { useEffect, useState } from "react";
import { IoPlayCircleOutline } from "react-icons/io5";
import type { Leccion, Modulo, Curso } from "../../types/models";
import { apiUrl, API_URL } from "../../config/api";
import AdminModal from "../Components/AdminModal";

interface InfoLeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leccion: Leccion | null;
  modulos?: Modulo[];
  cursos?: Curso[];
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  const ytMatch = url.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  return url;
}

function formatDurationFromSeconds(seconds?: number | null): string | null {
  if (!seconds || Number.isNaN(seconds)) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const InfoLeccionModal: React.FC<InfoLeccionModalProps> = ({
  isOpen,
  onClose,
  leccion,
  modulos: initialModulos,
  cursos: initialCursos,
}) => {
  const [modulos, setModulos] = useState<Modulo[]>(initialModulos || []);
  const [cursos, setCursos] = useState<Curso[]>(initialCursos || []);
  const [nombreModulo, setNombreModulo] = useState<string>("Cargando...");
  const [nombreCurso, setNombreCurso] = useState<string>("Cargando...");

  useEffect(() => {
    const fetchModulosYCursos = async () => {
      try {
        // 🔹 MÓDULOS (admin) - Solo si no vienen por props
        if (!initialModulos || initialModulos.length === 0) {
          const resModulos = await fetch(apiUrl("/admin/modulos?per_page=500"), {
            headers: { Accept: "application/json" },
          });
          if (resModulos.ok) {
            const dataModulos = await resModulos.json();
            setModulos(dataModulos.data || dataModulos || []);
          }
        } else {
          setModulos(initialModulos);
        }

        // 🔹 CURSOS (admin) - Solo si no vienen por props
        if (!initialCursos || initialCursos.length === 0) {
          const resCursos = await fetch(apiUrl("/admin/cursos?per_page=500"), {
            headers: { Accept: "application/json" },
          });
          if (resCursos.ok) {
            const dataCursos = await resCursos.json();
            setCursos(dataCursos.data || dataCursos || []);
          }
        } else {
          setCursos(initialCursos);
        }
      } catch (error) {
        console.error("Error al cargar módulos y cursos:", error);
      }
    };

    if (isOpen) fetchModulosYCursos();
  }, [isOpen, initialModulos, initialCursos]);

  useEffect(() => {
    if (!leccion) return;

    // 1. Intentar obtener de objetos anidados (si el backend los incluyó vía Eloquent)
    const moduloDirecto = (leccion as any).modulo;
    const cursoDirecto = moduloDirecto?.curso;

    if (moduloDirecto && cursoDirecto) {
      setNombreModulo(moduloDirecto.titulo || moduloDirecto.nombre || "Sin título");
      setNombreCurso(cursoDirecto.nombre || cursoDirecto.titulo || "Sin título");
      return;
    }

    // 2. Si no hay objetos anidados, buscar en las listas de cursos y módulos
    const modId = leccion.id_modulo || (leccion as any).modulo_id;

    if (modId) {
      const moduloEncontrado = modulos.find(
        (mod) => Number(mod.id_modulo) === Number(modId)
      );

      if (moduloEncontrado) {
        setNombreModulo(moduloEncontrado.titulo);
        const cursoEncontrado = cursos.find(
          (curso) => Number(curso.id_curso) === Number(moduloEncontrado.id_curso)
        );
        setNombreCurso(cursoEncontrado ? cursoEncontrado.nombre : "Curso no encontrado");
      } else {
        setNombreModulo("Módulo no encontrado");
        setNombreCurso("Curso no disponible");
      }
    } else {
      setNombreModulo("ID de módulo ausente");
      setNombreCurso("Curso no disponible");
    }
  }, [leccion, modulos, cursos]);

  const formatDate = (date: string | null) => {
    if (!date) return "No disponible";
    const formattedDate = date.replace(" ", "T");
    const dateObject = new Date(formattedDate);
    if (isNaN(dateObject.getTime())) return "No disponible";
    return dateObject.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!leccion) return null;

  const embedUrl = leccion.url_video ? getEmbedUrl(leccion.url_video) : null;
  const duracionFormateada = formatDurationFromSeconds(leccion.duracion);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Información de la Lección"
      footer={
        <button
          onClick={onClose}
          className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5"
        >
          Cerrar Vista
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {embedUrl ? (
          <div className="rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl bg-slate-900 aspect-video group relative mx-1 md:mx-0">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video de la lección"
              className="relative z-10"
            />
          </div>
        ) : (
          <div className="py-10 md:py-16 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 transition-all hover:bg-slate-50 mx-1 md:mx-0">
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-300">
               <IoPlayCircleOutline size={30} className="md:size-[38px] opacity-40" />
             </div>
             <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Recurso Multimedia no disponible</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="p-5 md:p-6 bg-slate-50/40 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-5">
            <div>
              <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Título de la Lección</label>
              <p className="text-[14px] md:text-[15px] font-black text-slate-900 leading-tight">{leccion.titulo}</p>
            </div>
            <div className="h-[1px] bg-slate-100" />
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Curso</label>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-600 leading-tight truncate md:whitespace-normal">{nombreCurso}</p>
              </div>
              <div className="min-w-0">
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Módulo</label>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-600 leading-tight truncate md:whitespace-normal">{nombreModulo}</p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6 bg-slate-50/40 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-5 flex flex-col justify-between">
             <div className="flex items-center justify-between gap-4">
              <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</label>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] border
                ${leccion.estado === "Publicado" 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"}
              `}>
                <div className={`w-1.5 h-1.5 rounded-full ${leccion.estado === "Publicado" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                {leccion.estado}
              </div>
            </div>
            <div className="h-[1px] bg-slate-100" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Duración</label>
                <p className="text-xs md:text-[13px] font-black text-sky-600">{duracionFormateada ? `${duracionFormateada} min` : "N/D"}</p>
              </div>
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Orden</label>
                <p className="text-xs md:text-[13px] font-black text-slate-900">#{leccion.orden}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 md:pt-6 border-t border-slate-100">
          <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Descripción del Contenido</label>
          <div className="text-[12px] md:text-[13px] text-slate-600 leading-relaxed bg-slate-50 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 italic relative overflow-hidden group">
            <div className="absolute left-0 top-0 w-1 h-full bg-sky-500 opacity-20" />
            {leccion.descripcion || "Sin descripción proporcionada para esta lección."}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 px-2 gap-3">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Creado: {formatDate(leccion.fecha_creacion)}</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizado: {formatDate(leccion.fecha_actualizacion)}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
           </div>
        </div>
      </div>
    </AdminModal>
  );
};
