import React, { useEffect, useState } from "react";
import type { Material, Modulo, Curso } from "../../types/models";
import { apiUrl,API_URL } from "../../config/api";

interface InfoMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export const InfoMaterialModal: React.FC<InfoMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nombreModulo, setNombreModulo] = useState<string>("");
  const [nombreCurso, setNombreCurso] = useState<string>("");

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");

      let allModulos: Modulo[] = [];
      let moduloPage = 1;
      let moduloTotalPages = 1;

      while (moduloPage <= moduloTotalPages) {
        const resModulos = await fetch(
          `${API_URL}/modulos/mis?page=${moduloPage}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!resModulos.ok) {
          console.error("Error al obtener los módulos:", resModulos.status);
          break;
        }

        const dataModulos = await resModulos.json();
        allModulos = [...allModulos, ...dataModulos.data];
        moduloTotalPages = dataModulos.meta?.last_page || 1;
        moduloPage++;
      }
      setModulos(allModulos);

      // Cargar todos los cursos
      let allCursos: Curso[] = [];
      let cursoPage = 1;
      let cursoTotalPages = 1;

      while (cursoPage <= cursoTotalPages) {
        const resCursos = await fetch(
          `${API_URL}/mis-cursos?page=${cursoPage}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!resCursos.ok) {
          console.error("Error al obtener los cursos:", resCursos.status);
          break;
        }

        const dataCursos = await resCursos.json();
        allCursos = [...allCursos, ...dataCursos.data];
        cursoTotalPages = dataCursos.meta?.last_page || 1;
        cursoPage++;
      }
      setCursos(allCursos);
    };

    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (material && material.id_modulo) {
      const moduloEncontrado = modulos.find(
        (mod) => mod.id_modulo === material.id_modulo
      );

      if (moduloEncontrado) {
        setNombreModulo(moduloEncontrado.titulo);

        // Buscar el curso asociado al módulo
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
  }, [material, modulos, cursos]);

  // Formatear la fecha
  const formatDate = (date: string | null) => {
    if (!date) return "No disponible";
    const formattedDate = date.replace(" ", "T");
    const dateObject = new Date(formattedDate);

    if (isNaN(dateObject.getTime())) return "No disponible";

    return dateObject.toLocaleDateString("es-ES");
  };

  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Información del Material
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          {material.url_archivo ? (
            <div className="mb-4 flex justify-center items-center">
              <a
                href={material.url_archivo}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir archivo"
              >
                <img
                  src="/pdf.png"
                  alt="Archivo PDF"
                  className="w-14 h-14 object-contain cursor-pointer"
                />
              </a>
            </div>
          ) : (
            <p>No hay archivo disponible.</p>
          )}

          <p>
            <strong>Curso:</strong> {nombreCurso}
          </p>
          <p>
            <strong>Módulo:</strong> {nombreModulo}
          </p>
          <p>
            <strong>Nombre:</strong> {material.nombre}
          </p>
          <p>
            <strong>Descripción:</strong>{" "}
            {material.descripcion ?? "No disponible"}
          </p>

          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                material.estado === "Publicado"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {material.estado}
            </span>
          </p>
          <p>
            <strong>Fecha de creación:</strong>{" "}
            {formatDate(material.fecha_creacion)}
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
