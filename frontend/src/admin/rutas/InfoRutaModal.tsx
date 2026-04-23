"use client";

import { useEffect, useState } from "react";
import type { RutaAcademica } from "../../types/models";
import { apiUrl,API_URL } from "../../config/api";

interface LineaAcademica {
  id_linea: number;
  nombre: string;
}

interface InfoRutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruta: RutaAcademica | null;
}

export function InfoRutaModal({ isOpen, onClose, ruta }: InfoRutaModalProps) {
  const [nombreLinea, setNombreLinea] = useState<string>("");

  useEffect(() => {
    const fetchLinea = async () => {
      if (!ruta) return;
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
          console.error("❌ Error al cargar líneas:", res.status);
          return;
        }

        const data = await res.json();
        const linea = (data.data || []).find(
          (l: LineaAcademica) => l.id_linea === ruta.id_linea_academica
        );

        if (linea) {
          setNombreLinea(linea.nombre);
        } else {
          setNombreLinea("No encontrada");
        }
      } catch (error) {
        console.error("Error obteniendo línea académica:", error);
      }
    };

    if (isOpen && ruta) {
      fetchLinea();
    }
  }, [isOpen, ruta]);

  if (!isOpen || !ruta) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          Detalles de la Ruta
        </h2>

        {ruta.imagen && (
          <img
            src={ruta.imagen}
            alt={ruta.nombre}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
        )}

        <div className="space-y-2 text-gray-800 text-sm">
          <p>
            <strong>Nombre:</strong> {ruta.nombre}
          </p>
          <p>
            <strong>Descripción:</strong> {ruta.descripcion || "Sin descripción"}
          </p>
          <p>
            <strong>Nivel:</strong> {ruta.nivel}
          </p>
          <p>
            <strong>Horas Totales:</strong> {ruta.horas_totales}
          </p>
          <p>
            <strong>Precio:</strong> S/. {Number(ruta.precio).toFixed(2)}
          </p>
          <p>
            <strong>Estado:</strong> {ruta.estado}
          </p>

          <p>
            <strong>Línea Académica:</strong>{" "}
            {nombreLinea || "Cargando..."}{" "}
            <span className="text-sm text-gray-500">
            </span>
          </p>

                  <p>
          <strong>Fecha de creación:</strong>{" "}
          {ruta.fecha_creacion
            ? ruta.fecha_creacion.slice(0, 10)
            : "No disponible"}
        </p>
        <p>
          <strong>Fecha de actualización:</strong>{" "}
          {ruta.fecha_actualizacion
            ? ruta.fecha_actualizacion.slice(0, 10)
            : "No disponible"}
        </p>


        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
