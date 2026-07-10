"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaInfoCircle,
  FaPlus,
  FaEdit,
  FaArchive,
  FaChevronDown,
} from "react-icons/fa";
import type { Curso } from "../../types/models";
import { AddCursoModal } from "./agregarCursos";
import { InfoCursoModal } from "./infoCursos";
import { EditCursoModal } from "./editCursos";
import { ArchiveModal } from "../Components/ArchiveModal";
import DeleteModal from "../Components/DeleteModal";
import { apiClient } from "../../services/apiClient";
import { API_URL } from "../../config/api";

function FiltroEstado({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "" | "Publicado" | "Archivado") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const estados = [
    { value: "", label: "Todos los estados", color: "text-sky-600", bg: "bg-sky-50" },
    { value: "Publicado", label: "Publicado", color: "text-emerald-600", bg: "bg-emerald-50" },
    { value: "Archivado", label: "Archivado", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const current = estados.find(e => e.value === value) || estados[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${value === 'Publicado' ? 'bg-emerald-500 animate-pulse' : value === 'Archivado' ? 'bg-amber-500' : 'bg-sky-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{current.label}</span>
        <FaChevronDown className={`text-slate-400 transition-transform duration-500 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => {
                onChange(e.value as any);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${value === e.value 
                  ? `${e.bg} ${e.color} shadow-sm` 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                e.value === 'Publicado' ? 'bg-emerald-500' : 
                e.value === 'Archivado' ? 'bg-amber-500' : 'bg-sky-500'
              }`} />
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState<Curso | null>(null);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Debounce para la búsqueda
  const [busquedaDebounced, setBusquedaDebounced] = useState(busqueda);
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPagina(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const fetchCursos = async () => {
    setIsLoading(true);

    try {
      const response = await apiClient.get("/admin/cursos", {
        params: {
          page: pagina,
          per_page: 12,
          nombre: busquedaDebounced,
          estado: filtroEstado
        }
      });

      const data = response.data;
      setCursos(data.data || []);
      setTotalPaginas(data.last_page || 1);
    } catch (error) {
      console.error("Error cargando cursos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRutas = async () => {
    try {
      const res = await apiClient.get("/rutas-academicas");
      setRutas(res.data.data || []);
    } catch (error) {
      console.error("Error cargando rutas académicas:", error);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  useEffect(() => {
    fetchCursos();
  }, [pagina, busquedaDebounced, filtroEstado]);

  const crearCurso = async (
    newCurso: Omit<Curso, "id_curso" | "fecha_creacion" | "fecha_actualizacion">
  ) => {
    try {
      console.log("Enviando curso al backend:", newCurso);

      const { id_curso, fecha_creacion, fecha_actualizacion, ...rest } = newCurso as any;
      const cleanData = {
        nombre: (newCurso as any).nombre,
        descripcion: (newCurso as any).descripcion,
        descripcion_corta: (newCurso as any).descripcion_corta,
        descripcion_larga: (newCurso as any).descripcion_larga,
        lo_que_aprenderas: (newCurso as any).lo_que_aprenderas,
        requisitos: (newCurso as any).requisitos,
        nivel: (newCurso as any).nivel,
        precio: Number((newCurso as any).precio),
        duracion_horas: Number((newCurso as any).duracion_horas),
        tiempo: (newCurso as any).tiempo ? Number((newCurso as any).tiempo) : undefined,
        imagen: (newCurso as any).imagen,
        video_previsualizacion: (newCurso as any).video_previsualizacion,
        estado: (newCurso as any).estado,
        destacado: Boolean((newCurso as any).destacado),
        id_docente: Number((newCurso as any).id_docente),
        rutas: newCurso.rutas.map((r) =>
          typeof r === "number" ? r : (r as any).id_ruta
        ),
      };

      const response = await apiClient.post("/admin/cursos", cleanData);
      const data = response.data;
      console.log("Respuesta del backend:", data);

      if (data.curso) {
        setCursos((prev) => [data.curso, ...prev]);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Error al crear curso:", error);
      const errMsg = error.response?.data?.mensaje || error.response?.data?.message || "Error al crear curso. Revisa consola.";
      alert(errMsg);
      return false;
    }
  };

  const guardarEdicion = async (cursoActualizado: Curso): Promise<boolean> => {
    try {
      const { 
        id_curso, 
        fecha_creacion, 
        fecha_actualizacion, 
        docente, 
        slug, 
        modulos, 
        ...rest 
      } = cursoActualizado as any;
      
      const cleanData = {
        nombre: cursoActualizado.nombre,
        descripcion: cursoActualizado.descripcion,
        descripcion_corta: cursoActualizado.descripcion_corta,
        descripcion_larga: cursoActualizado.descripcion_larga,
        lo_que_aprenderas: cursoActualizado.lo_que_aprenderas,
        requisitos: cursoActualizado.requisitos,
        nivel: cursoActualizado.nivel,
        precio: Number(cursoActualizado.precio),
        duracion_horas: (cursoActualizado.duracion_horas !== undefined && cursoActualizado.duracion_horas !== null)
          ? Number(cursoActualizado.duracion_horas)
          : ((cursoActualizado.duracion !== undefined && cursoActualizado.duracion !== null)
            ? Number(cursoActualizado.duracion)
            : undefined),
        tiempo: (cursoActualizado.tiempo !== undefined && cursoActualizado.tiempo !== null)
          ? Number(cursoActualizado.tiempo)
          : null,
        imagen: cursoActualizado.imagen,
        video_previsualizacion: cursoActualizado.video_previsualizacion,
        estado: cursoActualizado.estado,
        destacado: Boolean(cursoActualizado.destacado),
        id_docente: cursoActualizado.id_docente ? Number(cursoActualizado.id_docente) : undefined,
        rutas: cursoActualizado.rutas?.map((r) =>
          typeof r === "number" ? r : (r as any).id_ruta
        ) || [],
      };

      const response = await apiClient.put(`/admin/cursos/${cursoActualizado.id_curso}`, cleanData);
      const data = response.data;

      const cursoActualizadoRes = data;
      if (cursoActualizadoRes && cursoActualizadoRes.id_curso) {
        if (
          cursoActualizadoRes.rutas &&
          cursoActualizadoRes.rutas.length > 0 &&
          typeof cursoActualizadoRes.rutas[0] === "number"
        ) {
          const rutaEncontrada = rutas.find(
            (r) => r.id_ruta === cursoActualizadoRes.rutas[0]
          );
          if (rutaEncontrada) {
            cursoActualizadoRes.rutas = [rutaEncontrada];
          }
        }

        if (cursoAEditar && cursoAEditar.id_curso === cursoActualizadoRes.id_curso) {
          setCursoAEditar(cursoActualizadoRes);
        }

        setCursos((prev) =>
          prev.map((c) => (c.id_curso === cursoActualizadoRes.id_curso ? cursoActualizadoRes : c))
        );

        setCursosFiltrados((prev) =>
          prev.map((c) => (c.id_curso === cursoActualizadoRes.id_curso ? cursoActualizadoRes : c))
        );
      }

      console.log("Curso actualizado con éxito:", cursoActualizadoRes);
      return true;
    } catch (error: any) {
      console.error("Error en guardar edición:", error);
      const errMsg = error.response?.data?.message || error.response?.data?.mensaje || "Error al actualizar el curso.";
      alert(errMsg);
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
      await apiClient.patch(`/cursos/${cursoEstadoSeleccionado.id_curso}/estado`, { estado: nuevoEstado });

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

  const handleEliminar = async () => {
    if (!cursoAEliminar) return;

    try {
      await apiClient.delete(`/cursos/${cursoAEliminar.id_curso}`);

      setCursos((prev) =>
        prev.filter((c) => c.id_curso !== cursoAEliminar.id_curso)
      );
      setCursosFiltrados((prev) =>
        prev.filter((c) => c.id_curso !== cursoAEliminar.id_curso)
      );

      setCursoAEliminar(null);
      setIsDeleteModalOpen(false);
      alert("Curso eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      alert("Hubo un error al eliminar el curso.");
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cursos por título o descripción..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm text-slate-900 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <FiltroEstado
            value={filtroEstado}
            onChange={setFiltroEstado}
          />

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-md flex items-center gap-2 group whitespace-nowrap"
          >
            <FaPlus size={14} className="group-hover:rotate-90 transition-transform duration-300" /> Nuevo Curso
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Curso Académico</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Nivel</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Inversión</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 font-medium tracking-tight uppercase text-[10px] font-black tracking-widest">Cargando catálogo...</span>
                    </div>
                  </td>
                </tr>
              ) : cursos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">No se encontraron cursos</td>
                </tr>
              ) : (
                cursos.map((curso) => (
                    <tr key={curso.id_curso} className="group hover:bg-slate-50/50 transition-all duration-500 border-b border-slate-50 last:border-0">
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-6">
                          <div className="relative w-32 h-20 flex-shrink-0 rounded-[1.25rem] overflow-hidden shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500 bg-slate-100">
                            {curso.imagen ? (
                              <img
                                src={
                                  typeof curso.imagen === 'string' && curso.imagen.startsWith("http")
                                    ? curso.imagen
                                    : typeof curso.imagen === 'string'
                                      ? `${API_URL}/${curso.imagen.startsWith("/") ? curso.imagen.slice(1) : curso.imagen}`
                                      : curso.imagen || "/placeholder.jpg"
                                }
                                alt={curso.nombre}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 uppercase font-black">No img</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="text-[16px] font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-none">{curso.nombre}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">ID: #{curso.id_curso}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">Master Class</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-300 ${
                            curso.nivel?.toLowerCase() === 'avanzado' ? 'border-amber-200/50 bg-amber-500/10 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                            curso.nivel?.toLowerCase() === 'intermedio' ? 'border-sky-200/50 bg-sky-500/10 text-sky-600 shadow-[0_0_15px_rgba(14,165,233,0.1)]' :
                            'border-emerald-200/50 bg-emerald-500/10 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          }`}>
                          {curso.nivel || "General"}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Inversión</span>
                          <span className="text-[14px] font-black text-slate-900 tracking-tight">
                            {curso.precio != null && !isNaN(Number(curso.precio))
                              ? `S/. ${Number(curso.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] border transition-all duration-500 shadow-sm
                            ${curso.estado === "Publicado" 
                              ? "bg-white text-emerald-600 border-emerald-100 group-hover:border-emerald-500/30 group-hover:bg-emerald-50/30" 
                              : "bg-white text-amber-600 border-amber-100 group-hover:border-amber-500/30 group-hover:bg-amber-50/30"}
                          `}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${curso.estado === "Publicado" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"}`} />
                            {curso.estado}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                          <div className="inline-flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-500">
                            <button
                              onClick={() => abrirModalEditar(curso)}
                              className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all duration-300 group/btn"
                              title="Editar"
                            >
                              <FaEdit size={16} className="hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => abrirModalEstado(curso)}
                              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-300 group/btn"
                              title="Archivar"
                            >
                              <FaArchive size={16} className="hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => abrirModalInfo(curso)}
                              className="p-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all duration-300 group/btn"
                              title="Ver detalles"
                            >
                              <FaInfoCircle size={16} className="hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => {
                                setCursoAEliminar(curso);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-300 group/btn"
                              title="Eliminar"
                            >
                              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg" className="hover:scale-110 transition-transform"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="px-8 py-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">Cargando...</span>
            </div>
          ) : cursos.length === 0 ? (
            <div className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">No hay cursos</div>
          ) : (
            cursos.map((curso) => (
              <div key={curso.id_curso} className="p-6 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-24 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    <img
                      src={
                        typeof curso.imagen === 'string' && curso.imagen.startsWith("http")
                          ? curso.imagen
                          : typeof curso.imagen === 'string'
                            ? `${API_URL}/${curso.imagen.startsWith("/") ? curso.imagen.slice(1) : curso.imagen}`
                            : curso.imagen || "/placeholder.jpg"
                      }
                      alt={curso.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{curso.nombre}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: #{curso.id_curso}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1">Nivel</span>
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit ${
                      curso.nivel?.toLowerCase() === 'avanzado' ? 'border-amber-100 bg-amber-50 text-amber-600' :
                      curso.nivel?.toLowerCase() === 'intermedio' ? 'border-sky-100 bg-sky-50 text-sky-600' :
                      'border-emerald-100 bg-emerald-50 text-emerald-600'
                    }`}>
                      {curso.nivel || "General"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1">Inversión</span>
                    <span className="text-xs font-black text-slate-900">
                      {curso.precio != null ? `S/. ${Number(curso.precio).toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${
                    curso.estado === "Publicado" ? "text-emerald-600 border-emerald-100" : "text-amber-600 border-amber-100"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${curso.estado === "Publicado" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {curso.estado}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => abrirModalEditar(curso)} className="p-2 text-amber-500 bg-amber-50 rounded-lg"><FaEdit size={14} /></button>
                    <button onClick={() => abrirModalEstado(curso)} className="p-2 text-slate-400 bg-slate-50 rounded-lg"><FaArchive size={14} /></button>
                    <button onClick={() => abrirModalInfo(curso)} className="p-2 text-sky-500 bg-sky-50 rounded-lg"><FaInfoCircle size={14} /></button>
                    <button onClick={() => { setCursoAEliminar(curso); setIsDeleteModalOpen(true); }} className="p-2 text-rose-500 bg-rose-50 rounded-lg">
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="14" width="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Paginación Profesional */}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Página <span className="text-sky-600">{pagina}</span> de {totalPaginas}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || isLoading}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            >
              <span>Anterior</span>
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas || isLoading}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/10 flex items-center gap-2"
            >
              <span>Siguiente</span>
            </button>
          </div>
        </div>
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
          curso={cursoAEditar!}
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCursoAEliminar(null);
        }}
        onConfirm={handleEliminar}
        itemName={cursoAEliminar?.nombre || ""}
      />
    </div>
  );
}

