"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  FaArchive,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaSearch,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import type { Leccion, Modulo } from "../../types/models";
import { InfoLeccionModal } from "./infoLecciones";
import { EditLeccionModal } from "./editLecciones";
import { apiUrl } from "../../config/api";
import { AddLeccionModal } from "./agregarLecciones";
import { ArchiveModal } from "../components/ArchiveModal";

function FiltroModulo({
  value,
  onChange,
  modulos,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  modulos: Modulo[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const labelActual =
    (value !== "" && modulos.find((m) => m.id_modulo === value)?.titulo) ||
    "Todos los módulos";

  const opciones = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return modulos;
    return modulos.filter((m) => m.titulo.toLowerCase().includes(t));
  }, [q, modulos]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{labelActual}</span>
        <FaChevronDown className="ml-2 opacity-70" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 px-2 pt-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar módulo…"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {q && (
              <button
                title="Limpiar"
                onClick={() => setQ("")}
                className="p-2 rounded hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-auto py-1">
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Todos los módulos
            </button>

            {opciones.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Sin resultados
              </div>
            )}

            {opciones.map((m) => (
              <button
                key={m.id_modulo}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  onChange(m.id_modulo);
                  setOpen(false);
                }}
              >
                {m.titulo}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  const ytMatch = url.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  return url;
}

export function Lecciones() {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroModulo, setFiltroModulo] = useState<number | "">("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [leccionSeleccionada, setLeccionSeleccionada] =
    useState<Leccion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [lessonSeleccionada, setLessonSeleccionada] = useState<Leccion | null>(
    null
  );
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);

  const [leccionAEditar, setLeccionAEditar] = useState<Leccion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const abrirModal = (leccion: Leccion) => {
    setLeccionSeleccionada(leccion);
    setModalAbierto(true);
  };

  const handleEstadoClick = (leccion: Leccion) => {
    setLessonSeleccionada(leccion);
    setIsEstadoModalOpen(true);
  };

  const handleEditar = (leccion: Leccion) => {
    setLeccionAEditar(leccion);
    setIsEditModalOpen(true);
  };

  const handleConfirmCambioEstado = async () => {
    if (!lessonSeleccionada) return;

    const nuevoEstado =
      lessonSeleccionada.estado === "Publicado" ? "Archivado" : "Publicado";

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl(`/lecciones/${lessonSeleccionada.id_leccion}/estado`),
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

      setLecciones((prev) =>
        prev.map((l) =>
          l.id_leccion === lessonSeleccionada.id_leccion
            ? { ...l, estado: nuevoEstado }
            : l
        )
      );

      setLessonSeleccionada(null);
      setIsEstadoModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleGuardarEdicion = async (
    leccionActualizada: Leccion
  ): Promise<boolean> => {
    if (!leccionActualizada.id_modulo) {
      console.error("id_modulo no definido");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl(`/lecciones/${leccionActualizada.id_leccion}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(leccionActualizada),
        }
      );

      if (!response.ok) {
        console.error("Error al guardar los cambios:", await response.json());
        return false;
      }

      setLecciones((prev) =>
        prev.map((l) =>
          l.id_leccion === leccionActualizada.id_leccion
            ? leccionActualizada
            : l
        )
      );

      return true;
    } catch (error) {
      console.error("Error al actualizar la lección:", error);
      return false;
    }
  };

  const crearLeccion = async (newLeccion: Omit<Leccion, "id_leccion">) => {
    if (!newLeccion.id_modulo) {
      console.error("id_modulo no definido al crear");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl("/lecciones"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newLeccion),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        console.error("Error al crear lección:", err);
        return false;
      }

      const data = await response.json();
      if (data.leccion) {
        setLecciones((prev) => [data.leccion, ...prev]);
        return true;
      } else {
        console.error("No se recibió la lección creada en la respuesta");
        return false;
      }
    } catch (error) {
      console.error("Error en fetch crear lección:", error);
      return false;
    }
  };

  const filtrarYOrdenarLecciones = (lecciones: Leccion[]) => {
    let resultado = [...lecciones];

    if (busqueda) {
      resultado = resultado.filter(
        (l) =>
          l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          (l.descripcion &&
            l.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    if (filtroEstado) {
      resultado = resultado.filter((l) => l.estado === filtroEstado);
    }

    if (filtroModulo) {
      resultado = resultado.filter((l) => l.id_modulo === filtroModulo);
    }

    resultado.sort((a, b) => {
      if (a.estado === b.estado) return a.titulo.localeCompare(b.titulo);
      return a.estado === "Publicado" ? -1 : 1;
    });

    return resultado;
  };

  useEffect(() => {
    const fetchLecciones = async () => {
      setErrorMessage(null);

      try {
        let todasLecciones: Leccion[] = [];
        let pagina = 1;
        let ultimaPagina = 1;

        do {
          const token = localStorage.getItem("token");

          const response = await fetch(
            apiUrl(`/lecciones?page=${pagina}`),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) throw new Error("Error al obtener las lecciones");

          const data = await response.json();

          const leccionesPagina: Leccion[] =
            data.lecciones?.data || data.data || [];

          todasLecciones = [...todasLecciones, ...leccionesPagina];

          ultimaPagina = data.lecciones?.last_page || data.last_page || 1;

          pagina++;
        } while (pagina <= ultimaPagina);

        const filtradasOrdenadas = filtrarYOrdenarLecciones(todasLecciones);
        setLecciones(filtradasOrdenadas);
      } catch (error) {
        setErrorMessage("Hubo un problema al cargar las lecciones");
        console.error("Error:", error);
      }
    };

    const fetchModulos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró el token de autenticación");

        let allModulos: any[] | ((prevState: Modulo[]) => Modulo[]) = [];
        let currentPage = 1;

        while (true) {
          const response = await fetch(
            apiUrl(`/modulos/mis?page=${currentPage}`),
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

    fetchLecciones();
    fetchModulos();
  }, [busqueda, filtroEstado, filtroModulo]);

  return (
    <div className="px-8 py-6 text-black flex flex-col gap-6">
      {/* Barra de búsqueda */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> Agregar Lección
        </button>
      </div>

      {/* Filtros de estado y módulo */}
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

      {/* Tabla de lecciones */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Video</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lecciones.length > 0 ? (
              lecciones.map((leccion, index) => {
                const embedUrl = leccion.url_video
                  ? getEmbedUrl(leccion.url_video)
                  : null;

                return (
                  <tr
                    key={leccion.id_leccion}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-3 max-w-32 whitespace-normal break-words">
                      {leccion.titulo}
                    </td>
                    <td className="px-4 py-3 max-w-48 whitespace-normal break-words">
                      {leccion.descripcion || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {embedUrl ? (
                        <iframe
                          width="140"
                          height="80"
                          src={embedUrl}
                          title={leccion.titulo}
                          allowFullScreen
                          className="rounded-md shadow"
                        />
                      ) : (
                        <span className="text-gray-400">No disponible</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          leccion.estado === "Publicado"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {leccion.estado}
                      </span>
                    </td>
                    <td className="px-4 py-10 flex justify-center gap-4">
                      <button
                        className="text-sky-600 hover:text-sky-800"
                        title="Editar lección"
                        onClick={() => handleEditar(leccion)}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800"
                        onClick={() => handleEstadoClick(leccion)}
                        title={
                          leccion.estado === "Publicado"
                            ? "Archivar lección"
                            : "Publicar lección"
                        }
                      >
                        <FaArchive size={18} />
                      </button>
                      <button
                        onClick={() => abrirModal(leccion)}
                        className="text-gray-700 hover:text-gray-900"
                        title="Ver información"
                      >
                        <FaInfoCircle size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  {errorMessage ? (
                    <div className="text-center text-red-500 font-semibold">
                      {errorMessage}
                    </div>
                  ) : (
                    "No hay lecciones para mostrar."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <InfoLeccionModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        leccion={leccionSeleccionada}
      />

      <ArchiveModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={handleConfirmCambioEstado}
        itemName={lessonSeleccionada?.titulo || ""}
        nuevoEstado={
          lessonSeleccionada?.estado === "Publicado" ? "Archivado" : "Publicado"
        }
      />

      {leccionAEditar && isEditModalOpen && (
        <EditLeccionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setLeccionAEditar(null);
          }}
          leccion={leccionAEditar}
          onSave={handleGuardarEdicion}
        />
      )}

      {isCreateModalOpen && (
        <AddLeccionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={crearLeccion}
        />
      )}
    </div>
  );
}
