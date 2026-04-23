import React, { useEffect, useState } from "react";
import type { Leccion, Modulo, Curso } from "../../types/models";
import { apiUrl,API_URL } from "../../config/api";

interface InfoLeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leccion: Leccion | null;
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
}) => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nombreModulo, setNombreModulo] = useState<string>("");
  const [nombreCurso, setNombreCurso] = useState<string>("");

  useEffect(() => {
    const fetchModulosYCursos = async () => {
      try {
        const token = localStorage.getItem("token");

        // 🔹 MÓDULOS (paginados)
        let allModulos: Modulo[] = [];
        let pageModulo = 1;
        let lastPageModulo = 1;
        do {
          const resModulos = await fetch(
            `${API_URL}/modulos/mis?page=${pageModulo}`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );
          if (!resModulos.ok) {
            console.error("Error al obtener los módulos:", resModulos.status);
            return;
          }
          const dataModulos = await resModulos.json();
          allModulos = [...allModulos, ...(dataModulos.data || [])];
          lastPageModulo = dataModulos.meta?.last_page || 1;
          pageModulo++;
        } while (pageModulo <= lastPageModulo);

        setModulos(allModulos);

        // 🔹 CURSOS (paginados)
        let allCursos: Curso[] = [];
        let pageCurso = 1;
        let lastPageCurso = 1;
        do {
          const resCursos = await fetch(
            `${API_URL}/mis-cursos?page=${pageCurso}`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );
          if (!resCursos.ok) {
            console.error("Error al obtener los cursos:", resCursos.status);
            return;
          }
          const dataCursos = await resCursos.json();

          if (!dataCursos.data || typeof dataCursos.last_page === "undefined") {
            console.error(
              "Error: datos de cursos no válidos o mal formateados",
              dataCursos
            );
            return;
          }

          allCursos = [...allCursos, ...(dataCursos.data || [])];
          lastPageCurso = dataCursos.last_page || 1;
          pageCurso++;
        } while (pageCurso <= lastPageCurso);

        setCursos(allCursos);
      } catch (error) {
        console.error("Error al cargar módulos y cursos:", error);
      }
    };

    if (isOpen) fetchModulosYCursos();
  }, [isOpen]);

  useEffect(() => {
    if (leccion && leccion.id_modulo) {
      const moduloEncontrado = modulos.find(
        (mod) => mod.id_modulo === leccion.id_modulo
      );

      if (moduloEncontrado) {
        setNombreModulo(moduloEncontrado.titulo);

        const cursoEncontrado = cursos.find(
          (curso) => curso.id_curso === moduloEncontrado.id_curso
        );

        if (cursoEncontrado) {
          setNombreCurso(cursoEncontrado.nombre);
        } else {
          setNombreCurso("Curso no encontrado");
        }
      } else {
        setNombreModulo("Módulo no encontrado");
        setNombreCurso("Curso no disponible");
      }
    } else {
      setNombreModulo("No disponible");
      setNombreCurso("No disponible");
    }
  }, [leccion, modulos, cursos]);

  const formatDate = (date: string | null) => {
    if (!date) return "No disponible";
    const formattedDate = date.replace(" ", "T");
    const dateObject = new Date(formattedDate);

    if (isNaN(dateObject.getTime())) return "No disponible";

    return dateObject.toLocaleDateString("es-ES");
  };

  if (!isOpen || !leccion) return null;

  const embedUrl = leccion.url_video ? getEmbedUrl(leccion.url_video) : null;
  const duracionFormateada = formatDurationFromSeconds(leccion.duracion);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Información de la Lección
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          {embedUrl ? (
            <div className="mb-4">
              <div className="w-full h-full mt-1 aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                  title="Video de la lección"
                />
              </div>
            </div>
          ) : (
            <p>No hay video disponible.</p>
          )}

          <p>
            <strong>Curso:</strong> {nombreCurso}
          </p>
          <p>
            <strong>Módulo:</strong> {nombreModulo}
          </p>
          <p>
            <strong>Título:</strong> {leccion.titulo}
          </p>
          <p>
            <strong>Descripción:</strong>{" "}
            {leccion.descripcion ?? "No disponible"}
          </p>

          <p>
            <strong>Duración:</strong>{" "}
            {duracionFormateada
              ? `${duracionFormateada} (mm:ss)`
              : "No especificada"}
          </p>

          <p>
            <strong>Orden:</strong> {leccion.orden}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                leccion.estado === "Publicado"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {leccion.estado}
            </span>
          </p>
          <p>
            <strong>Fecha de creación:</strong>{" "}
            {formatDate(leccion.fecha_creacion)}
          </p>
          <p>
            <strong>Última actualización:</strong>{" "}
            {formatDate(leccion.fecha_actualizacion)}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
