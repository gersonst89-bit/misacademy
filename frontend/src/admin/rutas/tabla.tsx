"use client";

import { useState, useEffect } from "react";
import {
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaSearch,
  FaArchive,
} from "react-icons/fa";
import type { RutaAcademica } from "../../types/models";
import { InfoRutaModal } from "./InfoRutaModal";
import { EditRutaModal } from "./EditRutaModal";
import { AddRutaModal } from "./AddRutaModal";
import { EstadoModal } from "../components/EstadoModal2";
import { apiUrl,API_URL } from "../../config/api";

export function RutasAcademicas() {
  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [rutasFiltradas, setRutasFiltradas] = useState<RutaAcademica[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaAcademica | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rutaAEditar, setRutaAEditar] = useState<RutaAcademica | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [rutaEstado, setRutaEstado] = useState<RutaAcademica | null>(null);

  const fetchRutas = async () => {
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_URL}/rutas`);
      if (!response.ok) throw new Error("Error al obtener las rutas académicas");

      const data = await response.json();
      const lista = data.data || data.rutas || data || [];
      setRutas(lista);
      setRutasFiltradas(lista);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Hubo un problema al cargar las rutas académicas.");
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  useEffect(() => {
    let filtradas = [...rutas];

    if (busqueda) {
      filtradas = filtradas.filter((r) =>
        r.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroEstado) {
      filtradas = filtradas.filter((r) => r.estado === filtroEstado);
    }

    setRutasFiltradas(filtradas);
  }, [busqueda, filtroEstado, rutas]);

  const handleEstadoClick = (ruta: RutaAcademica) => {
    setRutaEstado(ruta);
    setIsEstadoModalOpen(true);
  };

  const handleConfirmCambioEstado = async () => {
    if (!rutaEstado) return;
    const nuevoEstado = rutaEstado.estado === "Activa" ? "Inactiva" : "Activa";

    try {
      const response = await fetch(
        `${API_URL}/rutas/${rutaEstado.id_ruta}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...rutaEstado, estado: nuevoEstado }),
        }
      );

      const data = await response.json();
      console.log("Cambio de estado →", data);

      if (!response.ok) {
        alert("Error al cambiar estado: " + (data.message || "Error desconocido"));
        return;
      }

      setRutas((prev) =>
        prev.map((r) =>
          r.id_ruta === rutaEstado.id_ruta ? { ...r, estado: nuevoEstado } : r
        )
      );
      setIsEstadoModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error de conexión al cambiar estado.");
    }
  };

  const handleEditar = (ruta: RutaAcademica) => {
    setRutaAEditar(ruta);
    setIsEditModalOpen(true);
  };

  const handleGuardarEdicion = async (
    rutaActualizada: RutaAcademica
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_URL}/rutas/${rutaActualizada.id_ruta}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rutaActualizada),
        }
      );

      const data = await response.json();
      console.log("Editar ruta →", data);

      if (!response.ok) {
        alert("Error al editar ruta: " + (data.message || "Error desconocido"));
        return false;
      }

      await fetchRutas();
      return true;
    } catch (error) {
      console.error("Error al actualizar ruta:", error);
      return false;
    }
  };

  const crearRuta = async (nuevaRuta: Omit<RutaAcademica, "id_ruta">) => {
    try {
      const response = await fetch(`${API_URL}/rutas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaRuta),
      });

      const data = await response.json();
      console.log("Crear ruta →", data);

      if (!response.ok) {
        alert("Error al crear ruta: " + (data.message || "Error desconocido"));
        return false;
      }

      await fetchRutas();
      return true;
    } catch (error) {
      console.error("Error al crear ruta:", error);
      alert("Error de conexión al crear ruta.");
      return false;
    }
  };

  return (
    <div className="px-8 py-6 text-black flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ruta académica..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700"
        >
          <FaPlus /> Nueva Ruta
        </button>
      </div>

      <div className="flex justify-center gap-4">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todas</option>
          <option value="Activa">Activa</option>
          <option value="Inactiva">Inactiva</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Imagen</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Nivel</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rutasFiltradas.length > 0 ? (
                            [...rutasFiltradas]
                .sort((a, b) => {
                  const orden = ["Activa", "Inactiva"];
                  const ordenA = orden.indexOf(a.estado);
                  const ordenB = orden.indexOf(b.estado);

                  if (ordenA !== ordenB) return ordenA - ordenB;

                  return a.nombre.localeCompare(b.nombre);
                })
                .map((ruta, i) => (
                  <tr
                  key={ruta.id_ruta}
                  className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                >
                  <td className="px-4 py-3">
                    {ruta.imagen ? (
                      <img
                        src={ruta.imagen}
                        alt={ruta.nombre}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">{ruta.nombre}</td>
                  <td className="px-4 py-3">{ruta.nivel}</td>
                  <td className="px-4 py-3">
                    {ruta.precio != null && !isNaN(Number(ruta.precio))
                      ? `S/. ${Number(ruta.precio).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ruta.estado === "Activa"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {ruta.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-4">
                    <button
                      className="text-sky-600 hover:text-sky-800"
                      onClick={() => handleEditar(ruta)}
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => handleEstadoClick(ruta)}
                    >
                      <FaArchive size={18}/>
                    </button>
                    <button
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => {
                        setRutaSeleccionada(ruta);
                        setIsInfoModalOpen(true);
                      }}
                    >
                      <FaInfoCircle size={18}/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  {errorMessage || "No hay rutas registradas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <InfoRutaModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        ruta={rutaSeleccionada}
      />
      <EstadoModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={handleConfirmCambioEstado}
        nombreDocente={rutaEstado?.nombre || ""}
        nuevoEstado={rutaEstado?.estado === "Activa" ? "Inactiva" : "Activa"}
      />
      {rutaAEditar && (
        <EditRutaModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          ruta={rutaAEditar}
          onSave={handleGuardarEdicion}
        />
      )}
      {isCreateModalOpen && (
        <AddRutaModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={crearRuta}
        />
      )}
    </div>
  );
}
