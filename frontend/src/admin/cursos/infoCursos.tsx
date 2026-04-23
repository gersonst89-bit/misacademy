"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import type { Curso } from "../../types/models";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
}

export function InfoCursoModal({ isOpen, onClose, curso }: Props) {
  const [nombreRuta, setNombreRuta] = useState<string>("Cargando...");

  useEffect(() => {
    if (!curso) return;

    if (curso.rutas && curso.rutas.length > 0) {
      const primeraRuta = curso.rutas[0];
      if (typeof primeraRuta === "object" && "nombre" in primeraRuta) {
        setNombreRuta(primeraRuta.nombre || "No asignada");
      } else {
        setNombreRuta("No asignada");
      }
    } else {
      setNombreRuta("No asignada");
    }
  }, [curso]);

  if (!isOpen || !curso) return null;

  const docente = curso.docente;
  const imagenDocente = docente?.imagen || null;
  const nombreDocente = docente
    ? docente.nombre
    : "Sin docente asignado";

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={18} />
        </button>

        {curso.imagen ? (
          <img
            src={curso.imagen}
            alt={curso.nombre}
            className="w-full h-44 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-44 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500 text-sm">
            Sin imagen disponible
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          {curso.nombre}
        </h2>

        <div className="space-y-3 text-gray-700 text-sm">
          <p>
            <strong>Descripción:</strong>{" "}
            {curso.descripcion || "No disponible"}
          </p>
          {curso.descripcion_corta && (
            <p>
              <strong>Descripción corta:</strong> {curso.descripcion_corta}
            </p>
          )}
          {curso.descripcion_larga && (
            <p>
              <strong>Descripción larga:</strong> {curso.descripcion_larga}
            </p>
          )}
          <p>
            <strong>Duración:</strong> {curso.duracion || "N/A"} horas
          </p>
          {curso.tiempo && (
            <p>
              <strong>Tiempo estimado:</strong> {curso.tiempo} semanas
            </p>
          )}
          <p>
            <strong>Precio:</strong>{" "}
            {curso.precio ? `S/ ${curso.precio}` : "Gratis"}
          </p>
          <p>
            <strong>Nivel:</strong> {curso.nivel || "N/A"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`font-semibold ${
                curso.estado === "Publicado"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {curso.estado}
            </span>
          </p>
          <p>
            <strong>Ruta Académica:</strong>{" "}
            <span className="text-sky-700 font-medium">{nombreRuta}</span>
          </p>
          <p>
            <strong>Destacado:</strong>{" "}
            {curso.destacado ? "Sí" : "No"}
          </p>
        </div>

        <div className="mt-6 border-t pt-4 flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {nombreDocente}
            </p>
            <p className="text-gray-500 text-xs">Docente asignado</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
