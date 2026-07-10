"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaArchive,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaSearch,
  FaChevronDown,
} from "react-icons/fa";
import type { LineaAcademica } from "../../types/models";

import { InfoLineaModal } from "./infoLineasAcademicas";
import { AddLineaAcademicaModal } from "./agregarLineasAcademicas";
import { EditLineaAcademicaModal } from "./editLineasAcademicas";
import { apiClient } from "../../services/apiClient";
import { ArchiveModal } from "../Components/ArchiveModal";
import DeleteModal from "../Components/DeleteModal";

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
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${value === 'Publicado' ? 'bg-emerald-500 animate-pulse' : value === 'Archivado' ? 'bg-amber-500' : 'bg-sky-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{current.label}</span>
        <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => {
                onChange(e.value);
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

export function LineasAcademicas() {
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lineaSeleccionada, setLineaSeleccionada] = useState<LineaAcademica | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lineaAEditar, setLineaAEditar] = useState<LineaAcademica | null>(null);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lineaAEliminar, setLineaAEliminar] = useState<LineaAcademica | null>(null);

  const fetchLineas = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.get("/lineas-academicas", {
        params: filtroEstado ? { estado: filtroEstado } : {}
      });
      const data = response.data;
      const mappedLineas = (data.data || []).map((l: any) => ({
        ...l,
        id_linea: l.id_linea || l.id_linea_academica
      }));
      setLineas(mappedLineas);
    } catch (error) {
      setErrorMessage("Hubo un problema al cargar las líneas académicas");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLineas();
  }, [filtroEstado]);

  const lineasFiltradas = lineas.filter(
    (linea) =>
      linea.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (linea.descripcion && linea.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const ordenarLineas = (list: LineaAcademica[]) => {
    return [...list].sort((a, b) => {
      if (a.estado === "Publicado" && b.estado !== "Publicado") return -1;
      if (a.estado !== "Publicado" && b.estado === "Publicado") return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  };

  const handleEditar = (linea: LineaAcademica) => {
    setLineaAEditar(linea);
    setIsEditModalOpen(true);
  };

  const handleEstadoClick = (linea: LineaAcademica) => {
    setLineaSeleccionada(linea);
    setIsEstadoModalOpen(true);
  };

  const abrirModalInfo = (linea: LineaAcademica) => {
    setLineaSeleccionada(linea);
    setModalOpen(true);
  };

  const handleConfirmCambioEstado = async () => {
    if (!lineaSeleccionada) return;
    const nuevoEstado = lineaSeleccionada.estado === "Publicado" ? "Archivado" : "Publicado";
    try {
      await apiClient.patch(`/lineas-academicas/${lineaSeleccionada.id_linea}/estado`, {
        estado: nuevoEstado
      });
      setLineas((prev) => prev.map((l) => l.id_linea === lineaSeleccionada.id_linea ? { ...l, estado: nuevoEstado } : l));
      setIsEstadoModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleEliminar = async () => {
    if (!lineaAEliminar) return;

    try {
      await apiClient.delete(`/lineas-academicas/${lineaAEliminar.id_linea}`);
      setLineas((prev) => prev.filter((l) => l.id_linea !== lineaAEliminar.id_linea));
      setLineaAEliminar(null);
      setIsDeleteModalOpen(false);
      alert("Línea académica eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar línea:", error);
      alert("Hubo un error al eliminar la línea académica.");
    }
  };

  const handleGuardarEdicion = async (lineaActualizada: LineaAcademica) => {
    try {
      const { id_linea, id_linea_academica, fecha_creacion, fecha_actualizacion, rutas_academicas, slug, ...cleanData } = lineaActualizada as any;
      await apiClient.put(`/lineas-academicas/${lineaActualizada.id_linea}`, cleanData);
      setLineas((prev) => prev.map((l) => l.id_linea === lineaActualizada.id_linea ? lineaActualizada : l));
      return true;
    } catch (error) {
      return false;
    }
  };

  const crearLineaAcademica = async (newLinea: Omit<LineaAcademica, "id_linea">) => {
    try {
      const { id_linea, id_linea_academica, fecha_creacion, fecha_actualizacion, ...cleanData } = newLinea as any;
      const response = await apiClient.post("/lineas-academicas", cleanData);
      const data = response.data;
      if (data.linea_id || data.id_linea_academica) {
        const newId = data.linea_id || data.id_linea_academica;
        setLineas((prev) => [{ ...newLinea, id_linea: newId, id_linea_academica: newId } as any, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn px-2 md:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
        <div className="relative flex-1 max-w-lg group w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm text-slate-900 font-medium placeholder:text-slate-400 text-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <FiltroEstado
            value={filtroEstado}
            onChange={setFiltroEstado}
          />

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-8 py-3.5 md:py-4 rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-[10px] md:text-[11px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            <FaPlus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            Nueva Línea
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Vista Desktop (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Línea Académica</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Descripción Estratégica</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronizando datos...</span>
                    </div>
                  </td>
                </tr>
              ) : lineasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] grayscale opacity-40">
                    <FaSearch size={48} className="mx-auto mb-4 text-slate-200" />
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                ordenarLineas(lineasFiltradas).map((linea) => (
                  <tr key={linea.id_linea} className="group hover:bg-slate-50/80 transition-all duration-500">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="relative w-32 h-20 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-500 border border-white shrink-0 bg-slate-100">
                          {linea.imagen ? (
                            <img src={linea.imagen} alt={linea.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 uppercase font-black">No img</div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[15px] font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight truncate">{linea.nombre}</span>
                          <div className="flex items-center gap-2 mt-1.5">
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">ID: #{linea.id_linea}</span>
                             <span className="text-[9px] text-sky-500 font-black uppercase tracking-widest">Faculty Core</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{linea.descripcion || "Sin descripción estratégica"}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-500
                          ${linea.estado === "Publicado" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                        `}>
                          <div className={`w-1.5 h-1.5 rounded-full ${linea.estado === "Publicado" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {linea.estado}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
                        <button
                          onClick={() => handleEditar(linea)}
                          className="p-2.5 rounded-xl text-amber-500 hover:bg-white hover:shadow-sm transition-all"
                          title="Editar"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleEstadoClick(linea)}
                          className="p-2.5 rounded-xl text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                          title="Archivar/Publicar"
                        >
                          <FaArchive size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setLineaAEliminar(linea);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl text-rose-500 hover:bg-white hover:shadow-sm transition-all"
                          title="Eliminar"
                        >
                          <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                        <button
                          onClick={() => abrirModalInfo(linea)}
                          className="p-2.5 rounded-xl text-sky-500 hover:bg-white hover:shadow-sm transition-all"
                          title="Detalles"
                        >
                          <FaInfoCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil (Cards Urban SaaS) */}
        <div className="md:hidden divide-y divide-slate-50">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cargando líneas...</span>
            </div>
          ) : lineasFiltradas.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-bold italic text-xs">No hay líneas disponibles</div>
          ) : (
            ordenarLineas(lineasFiltradas).map((linea) => (
              <div key={linea.id_linea} className="p-6 space-y-5 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="relative w-28 h-20 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-50 flex-shrink-0 bg-slate-100">
                    {linea.imagen ? (
                      <img src={linea.imagen} alt={linea.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-black uppercase">No img</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-base font-black text-slate-900 tracking-tight leading-tight mb-2 truncate">{linea.nombre}</span>
                    <div className="flex flex-wrap gap-2">
                       <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-300
                        ${linea.estado === "Publicado" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                      `}>
                        {linea.estado}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 text-center">Descripción Estratégica</span>
                   <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic text-center">
                     "{linea.descripcion || "Sin descripción estratégica disponible."}"
                   </p>
                </div>

                <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  <button onClick={() => handleEditar(linea)} className="p-2.5 text-amber-500 flex justify-center hover:scale-95 transition-transform"><FaEdit size={16} /></button>
                  <button onClick={() => handleEstadoClick(linea)} className="p-2.5 text-slate-400 flex justify-center hover:scale-95 transition-transform"><FaArchive size={16} /></button>
                  <button onClick={() => { setLineaAEliminar(linea); setIsDeleteModalOpen(true); }} className="p-2.5 text-rose-500 flex justify-center hover:scale-95 transition-transform">
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                  <button onClick={() => abrirModalInfo(linea)} className="p-2.5 text-sky-500 flex justify-center hover:scale-95 transition-transform"><FaInfoCircle size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <InfoLineaModal
        isOpen={modalOpen}
        linea={lineaSeleccionada}
        onClose={() => setModalOpen(false)}
      />

      <AddLineaAcademicaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={crearLineaAcademica}
      />
      
      {lineaAEditar && (
        <EditLineaAcademicaModal
          isOpen={isEditModalOpen}
          linea={lineaAEditar}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleGuardarEdicion}
        />
      )}

      <ArchiveModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={handleConfirmCambioEstado}
        itemName={lineaSeleccionada?.nombre || ""}
        nuevoEstado={lineaSeleccionada?.estado === "Publicado" ? "Archivado" : "Publicado"}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLineaAEliminar(null);
        }}
        onConfirm={handleEliminar}
        itemName={lineaAEliminar?.nombre || ""}
      />
    </div>
  );
}
