"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaInfoCircle,
  FaPlus,
  FaEdit,
  FaArchive,
} from "react-icons/fa";
import type { Curso } from "../../types/models";
import { AddCursoModal } from "./agregarCursos";
import { InfoCursoModal } from "./infoCursos";
import { EditCursoModal } from "./editCursos";
import { ArchiveModal } from "../components/ArchiveModal";
import { apiUrl } from "../../config/api";

export function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosFiltrados, setCursosFiltrados] = useState<Curso[]>([]);
  const [rutas, setRutas] = useState<{ id_ruta: number; nombre: string }[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    "" | "Publicado" | "Archivado"
  >("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(
    null
  );
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState<Curso | null>(null);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [cursoEstadoSeleccionado, setCursoEstadoSeleccionado] =
    useState<Curso | null>(null);

  const fetchCursos = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Debes iniciar sesión para ver tus cursos.");
        setIsLoading(false);
        return;
      }

      let todosLosCursos: Curso[] = [];
      let pagina = 1;
      let ultimaPagina = 15;

      do {
        const response = await fetch(
          apiUrl(`/mis-cursos?page=${pagina}`),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al obtener cursos");

        const data = await response.json();
        const cursosPagina = data.data || [];

        todosLosCursos = [...todosLosCursos, ...cursosPagina];

        ultimaPagina = data.last_page || 1;
        pagina++;
      } while (pagina <= ultimaPagina);

      todosLosCursos.sort((a, b) => {
        const fechaA = new Date(a.fecha_creacion).getTime();
        const fechaB = new Date(b.fecha_creacion).getTime();
        return fechaB - fechaA;
      });

      setCursos(todosLosCursos);
      setCursosFiltrados(todosLosCursos);

      console.log(`Cursos cargados:`, todosLosCursos.length);
    } catch (error) {
      console.error("Error cargando cursos:", error);
      setCursos([]);
      setCursosFiltrados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRutas = async () => {
    try {
      const res = await fetch(apiUrl("/rutas"));
      if (!res.ok) throw new Error("Error al obtener rutas");
      const data = await res.json();
      setRutas(data.data || []);
    } catch (error) {
      console.error("Error cargando rutas académicas:", error);
    }
  };

  useEffect(() => {
    fetchCursos();
    fetchRutas();
  }, []);

  const buscarCursos = () => {
    let filtrados = cursos;
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      filtrados = filtrados.filter((curso) =>
        curso.nombre.toLowerCase().includes(term)
      );
    }
    if (filtroEstado) {
      filtrados = filtrados.filter((curso) => curso.estado === filtroEstado);
    }

    setCursosFiltrados(filtrados);
  };

  useEffect(() => {
    buscarCursos();
  }, [busqueda, filtroEstado, cursos]);

  const crearCurso = async (
    newCurso: Omit<Curso, "id_curso" | "fecha_creacion" | "fecha_actualizacion">
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró token. Inicia sesión como administrador.");
        return false;
      }

      console.log("Enviando curso al backend:", newCurso);

      const response = await fetch(
        apiUrl("/cursos"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newCurso,
            rutas: newCurso.rutas.map((r) =>
              typeof r === "number" ? r : (r as any).id_ruta
            ),
          }),
        }
      );

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (!response.ok) {
        alert(data.mensaje || "Error al crear curso. Revisa consola.");
        return false;
      }

      if (data.curso) {
        setCursos((prev) => [data.curso, ...prev]);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al crear curso:", error);
      return false;
    }
  };

  const guardarEdicion = async (cursoActualizado: Curso): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl(`/cursos/${cursoActualizado.id_curso}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...cursoActualizado,
            rutas: cursoActualizado.rutas.map((r) =>
              typeof r === "number" ? r : (r as any).id_ruta
            ),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Error al actualizar curso:", data);
        alert(data.message || "Error al actualizar el curso.");
        return false;
      }

      if (data.curso) {
        if (
          data.curso.rutas &&
          data.curso.rutas.length > 0 &&
          typeof data.curso.rutas[0] === "number"
        ) {
          const rutaEncontrada = rutas.find(
            (r) => r.id_ruta === data.curso.rutas[0]
          );
          if (rutaEncontrada) {
            data.curso.rutas = [rutaEncontrada];
          }
        }

        if (cursoAEditar && cursoAEditar.id_curso === data.curso.id_curso) {
          setCursoAEditar(data.curso);
        }

        setCursos((prev) =>
          prev.map((c) => (c.id_curso === data.curso.id_curso ? data.curso : c))
        );

        setCursosFiltrados((prev) =>
          prev.map((c) => (c.id_curso === data.curso.id_curso ? data.curso : c))
        );
      }

      console.log("Curso actualizado con ruta:", data.curso);
      return true;
    } catch (error) {
      console.error("Error en guardar edición:", error);
      alert("Error al guardar los cambios del curso.");
      return false;
    }
  };

  const handleConfirmCambioEstado = async () => {
    if (!cursoEstadoSeleccionado) return;

    const nuevoEstado =
      cursoEstadoSeleccionado.estado === "Publicado"
        ? "Archivado"
        : "Publicado";

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        apiUrl(`/cursos/${cursoEstadoSeleccionado.id_curso}/estado`),
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",

            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (!response.ok) throw new Error("No se pudo cambiar el estado");

      setCursos((prev) =>
        prev.map((c) =>
          c.id_curso === cursoEstadoSeleccionado.id_curso
            ? { ...c, estado: nuevoEstado }
            : c
        )
      );

      setCursoEstadoSeleccionado(null);
      setIsEstadoModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const abrirModalInfo = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setModalAbierto(true);
  };

  const abrirModalEditar = (curso: Curso) => {
    setCursoAEditar(curso);
    setIsEditModalOpen(true);
  };

  const abrirModalEstado = (curso: Curso) => {
    setCursoEstadoSeleccionado(curso);
    setIsEstadoModalOpen(true);
  };

  return (
    <div className="px-8 py-6 text-black flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-4 w-full">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar curso..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FaPlus /> Agregar curso
          </button>
        </div>

        <div className="w-full flex justify-center">
          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value as "" | "Publicado" | "Archivado")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Todas</option>
            <option value="Publicado">Publicado</option>
            <option value="Archivado">Archivado</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Imagen</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Cargando cursos...
                </td>
              </tr>
            ) : (
              [...cursosFiltrados]
                .sort((a, b) => {
                  const orden = ["Publicado", "Archivado"];
                  const ordenA = orden.indexOf(a.estado);
                  const ordenB = orden.indexOf(b.estado);

                  if (ordenA !== ordenB) return ordenA - ordenB;

                  const fechaA = new Date(a.fecha_creacion).getTime();
                  const fechaB = new Date(b.fecha_creacion).getTime();
                  return fechaB - fechaA;
                })
                .map((curso) => (
                  <tr
                    key={curso.id_curso}
                    className="border-b bg-white hover:bg-gray-100 transition"
                  >
                    <td className="px-4 py-3">
                      {curso.imagen ? (
                        <img
                          src={curso.imagen}
                          alt={curso.nombre}
                          className="w-20 h-14 object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Sin imagen
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{curso.nombre}</td>
                    <td className="px-4 py-3">{curso.descripcion || "-"}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          curso.estado === "Publicado"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {curso.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex justify-center gap-3">
                      <button
                        onClick={() => abrirModalEditar(curso)}
                        className="text-sky-600 hover:text-sky-800"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => abrirModalEstado(curso)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <FaArchive size={18} />
                      </button>
                      <button
                        onClick={() => abrirModalInfo(curso)}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        <FaInfoCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <InfoCursoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        curso={cursoSeleccionado}
      />
      <AddCursoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={crearCurso}
      />
      {cursoAEditar && isEditModalOpen && (
        <EditCursoModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCursoAEditar(null);
          }}
          curso={cursoAEditar}
          onSave={guardarEdicion}
        />
      )}
      <ArchiveModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={handleConfirmCambioEstado}
        itemName={cursoEstadoSeleccionado?.nombre || ""}
        nuevoEstado={
          cursoEstadoSeleccionado?.estado === "Publicado"
            ? "Archivado"
            : "Publicado"
        }
      />
    </div>
  );
}
