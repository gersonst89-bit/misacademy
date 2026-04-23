import React, { useState, useEffect } from "react";
import type { Material, Modulo, Curso } from "../../types/models";
import SearchableSelect from "../components/SearchableSelect";
import InputComponent from "../components/InputComponent";
import { apiUrl,API_URL } from "../../config/api";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material;
  onSave: (updatedMaterial: Material) => Promise<boolean>;
}

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
  onSave,
}) => {
  const [nombre, setNombre] = useState(material.nombre);
  const [descripcion, setDescripcion] = useState(material.descripcion ?? "");
  const [urlArchivo, setUrlArchivo] = useState(material.url_archivo ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tamanio, setTamanio] = useState(material.tamanio?.toString() ?? "");
  const [estado, setEstado] = useState<Material["estado"]>(
    material.estado ?? "Publicado"
  );

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(
    null
  );
  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(
    null
  );
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (!isOpen || !material) return;

    setNombre(material.nombre);
    setDescripcion(material.descripcion ?? "");
    setUrlArchivo(material.url_archivo ?? "");
    setTamanio(material.tamanio?.toString() ?? "");
    setEstado(material.estado ?? "Publicado");

    const modulo =
      modulos.find((m) => m.id_modulo === material.id_modulo) || null;
    setModuloSeleccionado(modulo);

    const curso = modulo
      ? cursos.find((c) => c.id_curso === modulo.id_curso) || null
      : null;
    setCursoSeleccionado(curso);

    setError("");
  }, [isOpen, material, modulos, cursos]);

  const handleSave = async () => {
    setError("");

    if (!cursoSeleccionado) {
      setError("Selecciona un curso.");
      return;
    }

    if (!moduloSeleccionado) {
      setError("Selecciona un módulo.");
      return;
    }

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    const updatedMaterial: Material = {
      ...material,
      nombre,
      descripcion: descripcion.trim() || null,
      url_archivo: archivo ? URL.createObjectURL(archivo) : urlArchivo,
      tamanio: tamanio ? parseInt(tamanio, 10) : null,
      estado,
      id_modulo: moduloSeleccionado.id_modulo,
      fecha_creacion: material.fecha_creacion,
    };

    const exito = await onSave(updatedMaterial);
    if (exito) onClose();
  };

  const cursoOptions = cursos.map((c) => ({
    value: c.id_curso,
    label: c.nombre,
  }));

  const modulosOptions = modulos
    .filter(
      (m) => !cursoSeleccionado || m.id_curso === cursoSeleccionado.id_curso
    )
    .map((m) => ({
      value: m.id_modulo,
      label: m.titulo,
    }));

  const handleCursoChange = (id: number | "") => {
    const curso = cursos.find((c) => c.id_curso === id) || null;
    setCursoSeleccionado(curso);

    if (
      !curso ||
      (moduloSeleccionado && moduloSeleccionado.id_curso !== curso.id_curso)
    ) {
      setModuloSeleccionado(null);
    }
  };

  const handleModuloChange = (id: number | "") => {
    const modulo = modulos.find((m) => m.id_modulo === id) || null;
    setModuloSeleccionado(modulo);

    if (modulo) {
      const curso = cursos.find((c) => c.id_curso === modulo.id_curso) || null;
      setCursoSeleccionado(curso);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Editar Material
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Curso
          </label>
          <SearchableSelect
            value={cursoSeleccionado?.id_curso || ""}
            onChange={handleCursoChange}
            options={cursoOptions}
            placeholder="Selecciona un curso…"
            noOptionsMessage="No hay cursos"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Módulo
          </label>
          <SearchableSelect
            value={moduloSeleccionado?.id_modulo || ""}
            onChange={handleModuloChange}
            options={modulosOptions}
            placeholder="Selecciona un módulo…"
            noOptionsMessage="No hay módulos"
          />
        </div>

        <InputComponent
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingresa el nombre del material"
        />

        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ingresa la descripción del material"
            className="mt-1 p-2 w-full border border-gray-300 focus:ring-2 h-32 resize-none overflow-auto rounded-lg shadow-sm focus:outline-none focus:ring-sky-600 focus:border-sky-600"
          />
        </div>

        {/* Subir archivo */}
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

        {/* Mostrar archivo cargado */}
        {urlArchivo && (
          <div className="mt-2 mb-2 text-sm text-gray-300">
            <strong>Archivo seleccionado: </strong>
            <a href={urlArchivo} target="_blank" rel="noopener noreferrer">
              Ver archivo
            </a>
          </div>
        )}

        {error && (
          <div className="mb-4 text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700 transition text-white text-md"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
