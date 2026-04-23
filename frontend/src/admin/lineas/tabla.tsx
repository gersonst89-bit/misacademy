"use client";

import { useState, useEffect } from "react";
import {
  FaArchive,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import type { LineaAcademica } from "../../types/models";

import { InfoLineaModal } from "./infoLineasAcademicas";
import { AddLineaAcademicaModal } from "./agregarLineasAcademicas";
import { EditLineaAcademicaModal } from "./editLineasAcademicas";
import { apiUrl } from "../../config/api";
import { ArchiveModal } from "../components/ArchiveModal";

export function LineasAcademicas() {
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lineaSeleccionada, setLineaSeleccionada] =
    useState<LineaAcademica | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lineaAEditar, setLineaAEditar] = useState<LineaAcademica | null>(null);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);

  const ordenarLineas = (lineas: LineaAcademica[]) => {
    return [...lineas].sort((a, b) => {
      if (a.estado === "Publicado" && b.estado !== "Publicado") return -1;
      if (a.estado !== "Publicado" && b.estado === "Publicado") return 1;

      return a.nombre.localeCompare(b.nombre);
    });
  };

  const abrirModal = (linea: LineaAcademica) => {
    setLineaSeleccionada(linea);
    setModalOpen(true);
  };

  const handleEditar = (linea: LineaAcademica) => {
    setLineaAEditar(linea);
    setIsEditModalOpen(true);
  };

  const handleConfirmCambioEstado = async () => {
    if (!lineaSeleccionada) return;

    const nuevoEstado =
      lineaSeleccionada.estado === "Publicado" ? "Archivado" : "Publicado";

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        apiUrl(`/admin/lineas/${lineaSeleccionada.id_linea}/estado`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (!response.ok) throw new Error("No se pudo cambiar el estado");

      setLineas((prev) =>
        prev.map((l) =>
          l.id_linea === lineaSeleccionada.id_linea
            ? { ...l, estado: nuevoEstado }
            : l
        )
      );

      setLineaSeleccionada(null);
      setIsEstadoModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleGuardarEdicion = async (lineaActualizada: LineaAcademica) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        apiUrl(`/lineas/${lineaActualizada.id_linea}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: lineaActualizada.nombre,
            descripcion: lineaActualizada.descripcion,
            imagen: lineaActualizada.imagen,
            estado: lineaActualizada.estado,
          }),
        }
      );

      if (!response.ok) {
        console.error("Error al guardar los cambios:", await response.json());
        return false;
      }

      setLineas((prev) =>
        prev.map((l) =>
          l.id_linea === lineaActualizada.id_linea ? lineaActualizada : l
        )
      );

      return true;
    } catch (error) {
      console.error("Error al actualizar la línea académica:", error);
      return false;
    }
  };

  const crearLineaAcademica = async (
    newLinea: Omit<LineaAcademica, "id_linea">
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl("/lineas"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newLinea),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        console.error("Error al crear línea académica:", err);
        return false;
      }

      const data = await response.json();
      if (data.linea_id) {
        setLineas((prev) => [
          { id_linea: data.linea_id, ...newLinea },
          ...prev,
        ]);
        return true;
      } else {
        console.error(
          "No se recibió el id de la línea académica en la respuesta"
        );
        return false;
      }
    } catch (error) {
      console.error("Error en fetch crear línea académica:", error);
      return false;
    }
  };

  const filtrarLineas = (lineas: LineaAcademica[]) => {
    if (!busqueda) return lineas;

    return lineas.filter(
      (linea) =>
        linea.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (linea.descripcion &&
          linea.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );
  };

  useEffect(() => {
    const fetchLineas = async () => {
      setErrorMessage(null);

      try {
        let url = apiUrl("/lineas?");

        if (filtroEstado) {
          url += `estado=${filtroEstado}&`;
        }

        url = url.endsWith("&") ? url.slice(0, -1) : url;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Error al obtener las líneas académicas");
        }

        const data = await response.json();
        const lineasFiltradas = filtrarLineas(data.data || []);
        setLineas(lineasFiltradas);
      } catch (error) {
        setErrorMessage("Hubo un problema al cargar las líneas académicas");
        console.error("Error:", error);
      }
    };

    fetchLineas();
  }, [busqueda, filtroEstado]);

  const handleEstadoClick = (linea: LineaAcademica) => {
    setLineaSeleccionada(linea);
    setIsEstadoModalOpen(true);
  };

  return (
    <div className="px-8 py-6 text-black flex flex-col gap-6">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> Agregar Línea
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todos los estados</option>
          <option value="Publicado">Publicado</option>
          <option value="Archivado">Archivado</option>
        </select>
      </div>

      {/* Tabla de Líneas Académicas */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Imagen</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lineas.length > 0 ? (
              ordenarLineas(lineas).map((linea, index) => (
                <tr
                  key={linea.id_linea}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-3 max-w-3xs">{linea.nombre}</td>
                  <td className="px-4 py-3 max-w-3xs">
                    {linea.descripcion || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {linea.imagen ? (
                      <img
                        src={linea.imagen}
                        alt={linea.nombre}
                        className="w-30 h-19 rounded-lg object-cover"
                      />
                    ) : (
                      <span>No hay imagen disponible</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        linea.estado === "Publicado"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {linea.estado}
                    </span>
                  </td>
                  <td className="px-4 py-10 flex justify-center gap-4">
                    <button
                      className="text-sky-600 hover:text-sky-800"
                      title="Editar lección"
                      onClick={() => handleEditar(linea)}
                    >
                      <FaEdit size={18} />
                    </button>

                    <button
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => handleEstadoClick(linea)}
                      title={
                        linea.estado === "Publicado"
                          ? "Archivar lección"
                          : "Publicar lección"
                      }
                    >
                      <FaArchive size={18} />
                    </button>
                    <button
                      className="text-gray-700 hover:text-gray-900"
                      title="Ver información"
                      onClick={() => abrirModal(linea)}
                    >
                      <FaInfoCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-4 py-6">
                  {errorMessage || "No hay líneas académicas disponibles."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {modalOpen && lineaSeleccionada && (
        <InfoLineaModal
          isOpen={modalOpen}
          linea={lineaSeleccionada}
          onClose={() => setModalOpen(false)}
        />
      )}

      {isCreateModalOpen && (
        <AddLineaAcademicaModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={crearLineaAcademica}
        />
      )}
      {isEditModalOpen && (
        <EditLineaAcademicaModal
          isOpen={isEditModalOpen}
          linea={lineaAEditar!}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleGuardarEdicion}
        />
      )}
      {lineaSeleccionada && (
        <ArchiveModal
          isOpen={isEstadoModalOpen}
          onClose={() => setIsEstadoModalOpen(false)}
          onConfirm={handleConfirmCambioEstado}
          itemName={lineaSeleccionada?.nombre || ""}
          nuevoEstado={
            lineaSeleccionada?.estado === "Publicado"
              ? "Archivado"
              : "Publicado"
          }
        />
      )}
    </div>
  );
}
