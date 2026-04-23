import React, { useState, useEffect, useMemo } from "react";
import InputComponent from "../components/InputComponent";
import type { Modulo, Curso, Material } from "../../types/models";
import SearchableSelect from "../components/SearchableSelect";
import { apiUrl,API_URL } from "../../config/api";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newMaterial: Omit<Material, "id_material">) => Promise<boolean>;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [urlArchivo, setUrlArchivo] = useState<string>("");
  const [idModulo, setIdModulo] = useState<number | "">("");
  const [idCurso, setIdCurso] = useState<number | "">("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("token");

    // Fetch cursos
    const fetchCursos = async () => {
      let allCursos: Curso[] = [];
      let page = 1;

      while (true) {
        const res = await fetch(
          `${API_URL}/mis-cursos?page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) break;

        const data = await res.json();
        const items = data.data || [];

        if (items.length === 0) break;

        allCursos = [...allCursos, ...items];

        page++;
      }

      setCursos(allCursos);
    };

    // Fetch módulos
    const fetchModulos = async () => {
      try {
        let pagina = 1;
        let todosLosModulos: Modulo[] = [];
        let totalPages = 1;

        do {
          const res = await fetch(
            `${API_URL}/modulos/mis?page=${pagina}`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );

          const data = await res.json();
          todosLosModulos = [...todosLosModulos, ...(data.data || [])];
          totalPages = data.meta?.last_page || 1;
          pagina++;
        } while (pagina <= totalPages);

        setModulos(todosLosModulos);
      } catch (error) {
        console.error("Error cargando módulos:", error);
      }
    };

    fetchCursos();
    fetchModulos();
  }, [isOpen]);

  const modulosFiltrados = useMemo(() => {
    if (idCurso === "") return [];
    return modulos.filter((m) => m.id_curso === Number(idCurso));
  }, [idCurso, modulos]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    if (!archivo) {
      alert("El archivo es obligatorio.");
      return;
    }

    const tamanioKB = archivo.size / 1024;
    if (tamanioKB > 20480) {
      alert("El tamaño del archivo no puede ser mayor a 20 MB.");
      return;
    }

    if (idModulo === "") {
      alert("Debes seleccionar un módulo.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion || "");
    formData.append("url_archivo", urlArchivo || "");
    formData.append("tamanio", tamanioKB.toString());
    formData.append("id_modulo", String(idModulo));
    formData.append("id_curso", String(idCurso));
    formData.append("fecha_creacion", new Date().toISOString());
    formData.append("estado", "Publicado");

    formData.append("archivo", archivo, archivo.name);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/admin/materiales`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error al crear material:", errorData);
        return;
      }

      const data = await res.json();
      console.log("Material creado exitosamente:", data);
      onSave(data);

      onClose();
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Agregar Nuevo Material
        </h2>

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Curso
        </label>
        <SearchableSelect
          value={idCurso}
          onChange={(v) => {
            const cursoId = v === "" ? "" : Number(v);
            setIdCurso(cursoId);
            setIdModulo("");
          }}
          options={cursos.map((c) => ({
            value: c.id_curso,
            label: c.nombre,
          }))}
          placeholder="Selecciona un curso"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1 mt-4">
          Módulo
        </label>
        {!idCurso ? (
          <div className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 mb-4">
            Selecciona un curso primero
          </div>
        ) : (
          <SearchableSelect
            value={idModulo}
            onChange={(v) => setIdModulo(v === "" ? "" : Number(v))}
            options={modulosFiltrados.map((m) => ({
              value: m.id_modulo,
              label: m.titulo,
            }))}
            placeholder="Selecciona un módulo"
          />
        )}

        <label className="block text-sm font-semibold text-gray-700 mt-4">
          Nombre
        </label>
        <input
          type="text"
          value={nombre}
          placeholder="Nombre del material"
          onChange={(e) => setNombre(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 mb-4"
        />

        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 focus:ring-2 h-32 resize-none overflow-auto rounded-lg shadow-sm focus:outline-none focus:ring-sky-600 focus:border-sky-600"
            placeholder="Ingresa la descripción del material"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Subir Archivo
          </label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (file) {
                const validTypes = [
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                ];
                if (!validTypes.includes(file.type)) {
                  alert("El archivo debe ser de tipo JPEG, PNG o PDF.");
                  return;
                }
                setArchivo(file);
                const fileUrl = URL.createObjectURL(file);
                setUrlArchivo(fileUrl);
              } else {
                alert("Debes seleccionar un archivo.");
              }
            }}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600 focus:outline-none active:border-sky-600 active:ring-sky-600"
          />
        </div>

        {urlArchivo && (
          <div className="mt-2 mb-2 text-sm text-gray-300">
            <strong>Archivo seleccionado: </strong>
            <a href={urlArchivo} target="_blank" rel="noopener noreferrer">
              Ver archivo
            </a>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 rounded text-white hover:bg-sky-700"
          >
            Agregar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
