import React, { useState, useEffect } from "react";
import InputComponent from "../components/InputComponent";
import type { LineaAcademica } from "../../types/models";

interface AddLineaAcademicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newLinea: Omit<LineaAcademica, "id_linea">) => Promise<boolean>;
}

export const AddLineaAcademicaModal: React.FC<AddLineaAcademicaModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");

  const fechaCreacion = new Date().toISOString();
  const fechaActualizacion = null;

  useEffect(() => {
    if (isOpen) {
      setNombre("");
      setDescripcion("");
      setImagen("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    const nuevaLinea: Omit<LineaAcademica, "id_linea"> = {
      nombre,
      descripcion: descripcion.trim() === "" ? null : descripcion,
      imagen: imagen.trim() === "" ? null : imagen,
      estado: "Publicado",
      fecha_creacion: fechaCreacion,
      fecha_actualizacion: fechaActualizacion,
    };

    const fueExitosa = await onSave(nuevaLinea);

    if (fueExitosa) {
      onClose();
    } else {
      alert("Ocurrió un error al agregar la línea académica.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Agregar Nueva Línea Académica
        </h2>

        {/* Nombre */}
        <InputComponent
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingresa el nombre de la línea académica"
        />

        {/* Descripción */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={50}
            className="mt-1 p-2 w-full border border-gray-300 focus:ring-2 h-32 resize-none overflow-auto rounded-lg shadow-sm focus:outline-none focus:ring-sky-600 focus:border-sky-600"
            placeholder="Ingresa la descripción de la línea académica"
          />
          <p className="text-sm text-gray-500 mt-1">
            {descripcion.length}/50 caracteres
          </p>
        </div>

        {/* Imagen */}
        <InputComponent
          label="Imagen"
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
          placeholder="Ingresa la URL de la imagen"
        />

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700 transition text-white text-md"
          >
            Agregar
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
