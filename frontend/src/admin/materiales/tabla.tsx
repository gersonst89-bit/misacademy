"use client";

import { useState, useEffect } from "react";
import {
  FaArchive,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import type { Material, Modulo } from "../../types/models";
import { InfoMaterialModal } from "./infoMateriales";
import { EditMaterialModal } from "./editMateriales";
import { AddMaterialModal } from "./agregarMateriales";
import { ArchiveModal } from "../components/ArchiveModal";
import { apiUrl } from "../../config/api";
import { FiltroModulo } from "../components/FiltroModuloMateriales";

export function Materiales() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [filtroModulo, setFiltroModulo] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal States
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [materialSeleccionadoEstado, setMaterialSeleccionadoEstado] =
    useState<Material | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [materialAEditar, setMaterialAEditar] = useState<Material | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Open Modals
  const abrirModal = (material: Material) => {
    setMaterialSeleccionado(material);
    setModalAbierto(true);
  };

  const handleEstadoClick = (material: Material) => {
    setMaterialSeleccionadoEstado(material);
    setIsEstadoModalOpen(true);
  };

  const handleEditar = (material: Material) => {
    setMaterialAEditar(material);
    setIsEditModalOpen(true);
  };

  // Confirm State Change
  const handleConfirmCambioEstado = async () => {
    if (!materialSeleccionadoEstado) return;

    const nuevoEstado =
      materialSeleccionadoEstado.estado === "Publicado"
        ? "Archivado"
        : "Publicado";

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl(`/materiales/${materialSeleccionadoEstado.id_material}/estado`),
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

      setMateriales((prev) =>
        prev.map((m) =>
          m.id_material === materialSeleccionadoEstado.id_material
            ? { ...m, estado: nuevoEstado }
            : m
        )
      );

      setMaterialSeleccionadoEstado(null);
      setIsEstadoModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  // Edit Material
  const handleGuardarEdicion = async (
    materialActualizado: Material
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl(`/materiales/${materialActualizado.id_material}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: materialActualizado.nombre,
            descripcion: materialActualizado.descripcion,
            url_archivo: materialActualizado.url_archivo,
            tamanio: materialActualizado.tamanio,
            estado: materialActualizado.estado,
            id_modulo: materialActualizado.id_modulo,
          }),
        }
      );

      if (!response.ok) {
        console.error("Error al guardar los cambios:", await response.json());
        return false;
      }

      setMateriales((prev) =>
        prev.map((m) =>
          m.id_material === materialActualizado.id_material
            ? materialActualizado
            : m
        )
      );

      return true;
    } catch (error) {
      console.error("Error al actualizar el material:", error);
      return false;
    }
  };

  // Create New Material
  const crearMaterial = async (newMaterial: Omit<Material, "id_material">) => {
    try {
      const token = localStorage.getItem("token");
      const fecha = new Date();
      const fechaFormateada = `${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")} ${String(
        fecha.getHours()
      ).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(
        2,
        "0"
      )}:${String(fecha.getSeconds()).padStart(2, "0")}`;

      const body = {
        ...newMaterial,
        fecha_creacion: fechaFormateada,
        estado: "Publicado",
      };
      const response = await fetch(
        apiUrl("/materiales"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error("Error al crear material:", err);
        return false;
      }

      const data = await response.json();
      const material = data.material || data.data;

      if (material) {
        setMateriales((prev) => [material, ...prev]);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error en fetch crear material:", error);
      return false;
    }
  };

  const filtrarMateriales = (materiales: Material[]) => {
    let materialesFiltrados = materiales;

    if (busqueda) {
      materialesFiltrados = materialesFiltrados.filter(
        (material) =>
          material.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          (material.descripcion &&
            material.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    if (filtroEstado) {
      materialesFiltrados = materialesFiltrados.filter(
        (material) => material.estado === filtroEstado
      );
    }

    if (filtroModulo) {
      materialesFiltrados = materialesFiltrados.filter(
        (material) => material.id_modulo === filtroModulo
      );
    }

    materialesFiltrados.sort((a, b) => {
      if (a.estado === b.estado) {
        return a.nombre.localeCompare(b.nombre);
      }
      return a.estado === "Publicado" ? -1 : 1;
    });

    return materialesFiltrados;
  };

  // Fetch Materiales with Pagination
  useEffect(() => {
    const fetchMateriales = async () => {
      setErrorMessage(null);

      try {
        let todasMateriales: Material[] = [];
        let pagina = 1;
        let ultimaPagina = 1;

        do {
          let url = apiUrl(`/materiales?page=${pagina}`);

          if (filtroEstado) {
            url += `&estado=${filtroEstado}`;
          }
          if (filtroModulo) {
            url += `&id_modulo=${filtroModulo}`;
          }

          const token = localStorage.getItem("token");
          if (!token) return;

          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Error al obtener materiales");

          const data = await response.json();

          const materialesPagina: Material[] = data.data || [];

          todasMateriales = [...todasMateriales, ...materialesPagina];

          ultimaPagina = data.meta?.last_page || 1;

          pagina++;
        } while (pagina <= ultimaPagina);

        const filtradosOrdenados = filtrarMateriales(todasMateriales);

        setMateriales(filtradosOrdenados);
      } catch (error) {
        setErrorMessage("Hubo un problema al cargar los materiales");
        console.error("Error al cargar los materiales:", error);
      }
    };

    fetchMateriales();
  }, [busqueda, filtroEstado, filtroModulo]);

  // Fetch Modulos
  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró el token de autenticación");

        let allModulos: Modulo[] = [];
        let currentPage = 1;

        while (true) {
          const response = await fetch(
            apiUrl(`/modulos?page=${currentPage}`),
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) throw new Error("Error al cargar los módulos");

          const data = await response.json();
          const modulos = data.data || data;

          allModulos = [...allModulos, ...modulos];

          if (data.meta.current_page === data.meta.last_page) {
            break;
          }

          currentPage++;
        }

        setModulos(allModulos);
      } catch (error) {
        console.error("Error al cargar módulos:", error);
        setErrorMessage("No se pudo cargar los módulos");
      }
    };

    fetchModulos();
  }, []);

  return (
    <div className="px-8 py-6 text-black flex flex-col gap-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> Agregar Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <FiltroModulo
          value={filtroModulo}
          onChange={setFiltroModulo}
          modulos={modulos}
        />
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

      {/* Materials Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Archivo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materiales.length > 0 ? (
              materiales.map((material, index) => (
                <tr
                  key={material.id_material}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-3 max-w-3xs whitespace-normal break-words">
                    {material.nombre}
                  </td>
                  <td className="px-4 py-3 max-w-3xs whitespace-normal break-words">
                    {material.descripcion || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {material.url_archivo ? (
                      <a
                        href={material.url_archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <img src="/pdf.png" alt="PDF" className="w-14 h-14" />
                      </a>
                    ) : (
                      <span className="text-gray-400">No disponible</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        material.estado === "Publicado"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {material.estado}
                    </span>
                  </td>
                  <td className="px-4 py-8 flex justify-center gap-4">
                    <button
                      className="text-sky-600 hover:text-sky-800"
                      title="Editar material"
                      onClick={() => handleEditar(material)}
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => handleEstadoClick(material)}
                      title={
                        material.estado === "Publicado"
                          ? "Archivar material"
                          : "Publicar material"
                      }
                    >
                      <FaArchive size={18} />
                    </button>
                    <button
                      onClick={() => abrirModal(material)}
                      className="text-gray-700 hover:text-gray-900"
                      title="Ver información"
                    >
                      <FaInfoCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  {errorMessage ? (
                    <div className="text-center text-red-500 font-semibold">
                      {errorMessage}
                    </div>
                  ) : (
                    "No hay materiales para mostrar."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <InfoMaterialModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        material={materialSeleccionado}
      />

      <ArchiveModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={handleConfirmCambioEstado}
        itemName={materialSeleccionadoEstado?.nombre || ""}
        nuevoEstado={
          materialSeleccionadoEstado?.estado === "Publicado"
            ? "Archivado"
            : "Publicado"
        }
      />

      {materialAEditar && isEditModalOpen && (
        <EditMaterialModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setMaterialAEditar(null);
          }}
          material={materialAEditar}
          onSave={handleGuardarEdicion}
        />
      )}

      {isCreateModalOpen && (
        <AddMaterialModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={crearMaterial}
        />
      )}
    </div>
  );
}
