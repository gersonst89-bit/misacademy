"use client";

import React, { useState, useEffect } from "react";
import type { RutaAcademica } from "../../types/models";
import InputComponent from "../components/InputComponent";
import { apiUrl,API_URL } from "../../config/api";

interface LineaAcademica {
  id_linea: number;
  nombre: string;
}

interface AddRutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevaRuta: Omit<RutaAcademica, "id_ruta">) => Promise<boolean>;
}

export function AddRutaModal({ isOpen, onClose, onSave }: AddRutaModalProps) {
  const [formData, setFormData] = useState<Omit<RutaAcademica, "id_ruta">>({
    nombre: "",
    descripcion: "",
    id_linea_academica: 0,
    imagen: "",
    horas_totales: 0,
    nivel: "Principiante",
    precio: 0,
    estado: "Activa",
    destacado: false,
    fecha_creacion: "",
    fecha_actualizacion: "",
  });

  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [busquedaLinea, setBusquedaLinea] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/lineas`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) {
          console.error("❌ Error al obtener las líneas:", res.status);
          return;
        }

        const data = await res.json();
        console.log("📦 Líneas recibidas:", data);
        setLineas(data.data || []);
      } catch (error) {
        console.error("Error cargando líneas académicas:", error);
      }
    };

    if (isOpen) fetchLineas();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLineaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusquedaLinea(e.target.value);
    setMostrarSugerencias(true);
  };

  const seleccionarLinea = (linea: LineaAcademica) => {
    setBusquedaLinea(linea.nombre);
    setFormData({ ...formData, id_linea_academica: linea.id_linea });
    setMostrarSugerencias(false);
  };

  const handleSubmit = async () => {
    if (formData.id_linea_academica === 0) {
      alert("Selecciona una línea académica antes de guardar.");
      return;
    }

    const success = await onSave(formData);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          Agregar Ruta Académica
        </h2>

        <div className="space-y-3">
          <InputComponent
            label="Nombre de la ruta"
            name="nombre"
            placeholder="Ingresa nombre de la ruta"
            value={formData.nombre || ""}
            onChange={handleChange}
          />

          <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion || ""}
            onChange={handleChange}
            placeholder="Ingresa breve descripción"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md h-24 resize-none focus:ring-2 focus:ring-sky-600"
          />
          </div>

          <InputComponent
            label="Horas Totales"
            name="horas_totales"
            placeholder="Ingresa horas totales de la ruta"
            value={formData.horas_totales || 0}
            onChange={handleChange}
          />

          <InputComponent
            placeholder="Ingresa precio de la ruta"
            label="Precio"
            name="precio"
            value={formData.precio || 0}
            onChange={handleChange}
          />

          <label className="block text-sm font-semibold text-gray-700">Nivel</label>
          <select
            name="nivel"
            value={formData.nivel || ""}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>

          <InputComponent
            label="Imagen (URL)"
            name="imagen"
            placeholder="Ingresa imagen"
            value={formData.imagen || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <label className="block text-sm font-semibold text-gray-700">Línea Académica</label>
          <div className="relative">
            <input
              type="text"
              value={busquedaLinea}
              onChange={handleLineaChange}
              onFocus={() => setMostrarSugerencias(true)}
              placeholder="Escribe para buscar..."
            className="mt-1 p-2 w-full border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-sky-600"
            />
            {mostrarSugerencias && busquedaLinea.length > 0 && (
              <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-40 overflow-y-auto">
                {lineas
                  .filter((l) =>
                    l.nombre.toLowerCase().includes(busquedaLinea.toLowerCase())
                  )
                  .map((linea) => (
                    <li
                      key={linea.id_linea}
                      className="p-2 hover:bg-sky-100 cursor-pointer"
                      onClick={() => seleccionarLinea(linea)}
                    >
                      {linea.nombre}
                    </li>
                  ))}
                {lineas.filter((l) =>
                  l.nombre.toLowerCase().includes(busquedaLinea.toLowerCase())
                ).length === 0 && (
                  <li className="p-2 text-gray-500">No hay resultados</li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
