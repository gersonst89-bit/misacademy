"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  IoTrashOutline,
  IoCreateOutline,
  IoInformationCircleOutline,
  IoAddOutline,
  IoSearchOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoFilterOutline,
  IoPlayCircleOutline,
} from "react-icons/io5";
import type { Leccion, Modulo } from "../../types/models";
import { InfoLeccionModal } from "./infoLecciones";
import { EditLeccionModal } from "./editLecciones";
import { apiClient } from "../../services/apiClient";
import { AddLeccionModal } from "./agregarLecciones";
import DeleteModal from "../Components/DeleteModal";

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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
        }}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${value !== "" ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors max-w-[150px]">{labelActual}</span>
        <IoChevronDownOutline className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={14} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          <div className="px-3 py-2 border-b border-slate-50 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Seleccionar Módulo</span>
          </div>
          <div className="p-3 relative group">
            <IoSearchOutline className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={14} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar por módulo..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300"
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-1 custom-scrollbar">
            <button
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${value === "" ? "bg-sky-50 text-sky-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${value === "" ? "bg-sky-500 animate-pulse" : "bg-slate-300"}`} />
              Todos los módulos
            </button>
            
            <div className="h-[1px] bg-slate-50 my-1 mx-2" />

            {opciones.map((m) => (
              <button
                key={m.id_modulo}
                className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all mb-1 flex items-center gap-3
                  ${value === m.id_modulo ? "bg-sky-500/10 text-sky-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
                onClick={() => {
                  onChange(m.id_modulo);
                  setOpen(false);
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${value === m.id_modulo ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "bg-slate-200"}`} />
                <span className="truncate">{m.titulo}</span>
              </button>
            ))}

            {opciones.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sin resultados</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FiltroEstado({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const estados = [
    { value: "", label: "Todos los estados" },
    { value: "Publicado", label: "Publicado" },
    { value: "Archivado", label: "Archivado" },
  ];

  const labelActual = estados.find(e => e.value === value)?.label || "Estados";

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
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${value === 'Publicado' ? 'bg-emerald-500 animate-pulse' : value === 'Archivado' ? 'bg-rose-500' : 'bg-sky-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{labelActual}</span>
        <IoChevronDownOutline className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={14} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          <div className="px-3 py-2 border-b border-slate-50 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Estado</span>
          </div>
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => {
                onChange(e.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${value === e.value ? "bg-sky-50 text-sky-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                e.value === 'Publicado' ? 'bg-emerald-500' : 
                e.value === 'Archivado' ? 'bg-rose-500' : 'bg-sky-500'
              }`} />
              {e.label}
            </button>
          ))}
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

  if (url.startsWith('http')) return url;

  return null;
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
  const [leccionAEliminar, setLeccionAEliminar] = useState<Leccion | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [leccionAEditar, setLeccionAEditar] = useState<Leccion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const abrirModal = (leccion: Leccion) => {
    setLeccionSeleccionada(leccion);
    setModalAbierto(true);
  };

  const handleEliminarClick = (leccion: Leccion) => {
    setLeccionAEliminar(leccion);
    setIsDeleteModalOpen(true);
  };

  const handleEditar = (leccion: Leccion) => {
    setLeccionAEditar(leccion);
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leccionAEliminar) return;

    try {
      await apiClient.delete(`/admin/lecciones/${leccionAEliminar.id_leccion}`);

      setLecciones((prev) =>
        prev.filter((l) => l.id_leccion !== leccionAEliminar.id_leccion)
      );

      setLeccionAEliminar(null);
      setIsDeleteModalOpen(false);
      alert("Lección eliminada con éxito");
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      const errMsg = error.response?.data?.message || error.response?.data?.mensaje || "Error al eliminar la lección";
      alert(errMsg);
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
      const cleanData = {
        titulo: leccionActualizada.titulo,
        descripcion: leccionActualizada.descripcion,
        url_video: leccionActualizada.url_video,
        duracion: Number(leccionActualizada.duracion) || 0,
        orden: Number(leccionActualizada.orden) || 1,
        estado: leccionActualizada.estado,
        id_modulo: leccionActualizada.id_modulo,
      };

      await apiClient.put(`/admin/lecciones/${leccionActualizada.id_leccion}`, cleanData);

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
      const response = await apiClient.post("/admin/lecciones", newLeccion);
      const data = response.data;
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

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);

  const [busquedaDebounced, setBusquedaDebounced] = useState(busqueda);
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPagina(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const fetchLecciones = async () => {
    setCargando(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.get("/admin/lecciones", {
        params: {
          page: pagina,
          per_page: 15,
          q: busquedaDebounced,
          id_modulo: filtroModulo,
          estado: filtroEstado
        }
      });

      const data = response.data;
      const items = data.data || [];
      const lastPage = data.last_page || 1;

      setLecciones(items);
      setTotalPaginas(lastPage);
    } catch (error) {
      setErrorMessage("Hubo un problema al cargar las lecciones");
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await apiClient.get("/admin/modulos", {
        params: { per_page: 200 }
      });
      const data = response.data;
      setModulos(data.data || data || []);
    } catch (error) {
      console.error("Error al cargar módulos:", error);
    }
  };

  // Cargar módulos una sola vez al montar
  useEffect(() => {
    fetchModulos();
  }, []);

  // Recargar lecciones cuando cambien los filtros o la página
  useEffect(() => {
    fetchLecciones();
  }, [pagina, busquedaDebounced, filtroEstado, filtroModulo]);

  return (
    <div className="space-y-6 animate-fadeIn">

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative flex-1 group md:ml-2">
          <IoSearchOutline className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar lecciones..."
            className="w-full pl-8 pr-4 py-2 bg-transparent focus:outline-none text-[13px] font-bold text-slate-900 placeholder:text-slate-300"
          />
        </div>

        <div className="hidden lg:block h-8 w-[1px] bg-slate-100 mx-2" />

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-auto">
            <FiltroModulo
              value={filtroModulo}
              onChange={setFiltroModulo}
              modulos={modulos}
            />
          </div>

          <div className="w-full sm:w-auto">
            <FiltroEstado
              value={filtroEstado}
              onChange={setFiltroEstado}
            />
          </div>

          <div className="hidden lg:block h-8 w-[1px] bg-slate-100 mx-2" />

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-md flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            <IoAddOutline size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Nueva Lección
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {cargando && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center transition-all duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 animate-pulse">Sincronizando...</span>
            </div>
          </div>
        )}

        {/* Vista Desktop (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Contenido / Lección</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Vista Previa</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lecciones.length === 0 && !cargando ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-50">
                      <IoSearchOutline size={48} className="text-slate-300" />
                      <span className="text-slate-500 font-medium tracking-tight">{errorMessage || "No se encontraron lecciones"}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                lecciones.map((l) => {
                  return (
                    <tr key={l.id_leccion} className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight uppercase">{l.titulo}</span>
                          <div className="flex items-center gap-2 mt-2.5">
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-slate-200/50 shadow-sm">ID: #{l.id_leccion}</span>
                            <span className="text-[9px] bg-sky-50 text-sky-600/70 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-sky-100/50 shadow-sm">LECCIÓN MULTIMEDIA</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center">
                          {l.url_video ? (
                            <button 
                              onClick={() => abrirModal(l)}
                              className="group/preview relative w-36 h-20 rounded-2xl overflow-hidden shadow-sm bg-slate-900 flex items-center justify-center transition-all duration-500 hover:shadow-xl hover:shadow-sky-900/20 border border-white"
                            >
                               <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent group-hover/preview:opacity-0 transition-opacity" />
                               <IoPlayCircleOutline className="text-white relative z-10 group-hover/preview:scale-125 transition-transform" size={24} />
                            </button>
                          ) : (
                            <div className="w-36 h-20 rounded-2xl bg-slate-50 border border-slate-100 border-dashed flex items-center justify-center">
                               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Recurso sin video</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                           ${l.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}
                         `}>
                            {l.estado}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditar(l)}
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors group/edit relative"
                            title="Editar"
                          >
                            <IoCreateOutline size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setLeccionSeleccionada(l);
                              setModalAbierto(true);
                            }}
                            className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl transition-colors group/info relative"
                            title="Información"
                          >
                            <IoInformationCircleOutline size={20} />
                          </button>
                          <button
                            onClick={() => handleEliminarClick(l)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group/delete relative"
                            title="Eliminar"
                          >
                            <IoTrashOutline size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          {lecciones.length === 0 && !cargando ? (
            <div className="p-10 text-center text-slate-400 font-medium italic">No se encontraron lecciones</div>
          ) : (
            lecciones.map((l) => (
              <div key={l.id_leccion} className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-black text-slate-900 leading-tight tracking-tight block truncate uppercase">{l.titulo}</span>
                    <p className="text-[10px] text-slate-400 font-bold line-clamp-2 mt-1 italic">{l.descripcion || "Sin descripción operativa"}</p>
                  </div>
                  <div className="shrink-0">
                    {l.url_video ? (
                      <button onClick={() => abrirModal(l)} className="w-20 h-14 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-white shadow-sm transition-transform active:scale-95">
                        <IoPlayCircleOutline className="text-white text-2xl" />
                      </button>
                    ) : (
                      <div className="w-20 h-14 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[7px] text-slate-300 uppercase font-black text-center px-1">Sin Video</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-slate-200/50 shadow-sm">ID: #{l.id_leccion}</span>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border
                      ${l.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}
                    `}>
                      {l.estado}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <button onClick={() => handleEditar(l)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><IoCreateOutline size={18} /></button>
                    <button onClick={() => { setLeccionSeleccionada(l); setModalAbierto(true); }} className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"><IoInformationCircleOutline size={18} /></button>
                    <button onClick={() => handleEliminarClick(l)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><IoTrashOutline size={18} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación Profesional Responsiva */}
        <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               Página <span className="text-slate-900">{pagina}</span> de <span className="text-slate-900">{totalPaginas}</span>
             </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || cargando}
              className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-20 transition-all duration-300 shadow-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas || cargando}
              className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 disabled:opacity-20 transition-all duration-300 shadow-md"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <InfoLeccionModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        leccion={leccionSeleccionada}
        modulos={modulos}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={leccionAEliminar?.titulo || ""}
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

