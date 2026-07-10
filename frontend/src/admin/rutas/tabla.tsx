"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaSearch,
  FaArchive,
  FaChevronDown,
} from "react-icons/fa";
import type { RutaAcademica } from "../../types/models";
import { InfoRutaModal } from "./InfoRutaModal";
import { EditRutaModal } from "./EditRutaModal";
import { AddRutaModal } from "./AddRutaModal";
import { ArchiveModal } from "../Components/ArchiveModal";
import DeleteModal from "../Components/DeleteModal";
import { apiClient } from "../../services/apiClient";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rutaAEliminar, setRutaAEliminar] = useState<RutaAcademica | null>(null);
  
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);

  const fetchRutas = async () => {
    setErrorMessage(null);
    setCargando(true);
    try {
      const response = await apiClient.get("/rutas-academicas", {
        params: {
          page: pagina,
          per_page: 10
        }
      });
      const data = response.data;
      const lista = data.data || data.rutas || data || [];
      setRutas(lista);
      setRutasFiltradas(lista);
      setTotalPaginas(data.last_page || 1);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Hubo un problema al cargar las rutas académicas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, [pagina]);

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
    try {
      const nuevoEstado = rutaEstado.estado === "Activa" ? "Inactiva" : "Activa";
      
      const cleanData = {
        id_linea_academica: rutaEstado.id_linea_academica,
        nombre: rutaEstado.nombre,
        descripcion: rutaEstado.descripcion,
        imagen: rutaEstado.imagen,
        horas_totales: Number(rutaEstado.horas_totales),
        nivel: rutaEstado.nivel,
        precio: Number(rutaEstado.precio),
        estado: nuevoEstado,
        destacado: Boolean(rutaEstado.destacado),
      };
      
      const response = await apiClient.put(
        `/rutas-academicas/${rutaEstado.id_ruta}`,
        cleanData
      );

      const data = response.data;

      setRutas((prev) =>
        prev.map((r) =>
          r.id_ruta === rutaEstado.id_ruta ? { ...r, estado: nuevoEstado } : r
        )
      );
      setRutasFiltradas((prev) =>
        prev.map((r) =>
          r.id_ruta === rutaEstado.id_ruta ? { ...r, estado: nuevoEstado } : r
        )
      );
      setIsEstadoModalOpen(false);
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar estado: " + (error.response?.data?.message || "Error de conexión."));
    }
  };

  const handleEliminar = async () => {
    if (!rutaAEliminar) return;

    try {
      await apiClient.delete(`/rutas-academicas/${rutaAEliminar.id_ruta}`);

      setRutas((prev) => prev.filter((r) => r.id_ruta !== rutaAEliminar.id_ruta));
      setRutasFiltradas((prev) => prev.filter((r) => r.id_ruta !== rutaAEliminar.id_ruta));

      setRutaAEliminar(null);
      setIsDeleteModalOpen(false);
      alert("Ruta académica eliminada correctamente");
    } catch (error: any) {
      console.error("Error al eliminar ruta:", error);
      alert("Hubo un error al eliminar la ruta: " + (error.response?.data?.message || "Error desconocido."));
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
      const cleanData = {
        id_linea_academica: rutaActualizada.id_linea_academica,
        nombre: rutaActualizada.nombre,
        descripcion: rutaActualizada.descripcion,
        imagen: rutaActualizada.imagen,
        horas_totales: Number(rutaActualizada.horas_totales),
        nivel: rutaActualizada.nivel,
        precio: Number(rutaActualizada.precio),
        estado: rutaActualizada.estado,
        destacado: Boolean(rutaActualizada.destacado),
      };
      
      const response = await apiClient.put(
        `/rutas-academicas/${rutaActualizada.id_ruta}`,
        cleanData
      );

      const data = response.data;
      console.log("Editar ruta →", data);

      await fetchRutas();
      return true;
    } catch (error: any) {
      console.error("Error al actualizar ruta:", error);
      alert("Error al editar ruta: " + (error.response?.data?.message || "Error desconocido"));
      return false;
    }
  };

  const crearRuta = async (nuevaRuta: Omit<RutaAcademica, "id_ruta">) => {
    try {
      const cleanData = {
        id_linea_academica: nuevaRuta.id_linea_academica,
        nombre: nuevaRuta.nombre,
        descripcion: nuevaRuta.descripcion,
        imagen: nuevaRuta.imagen,
        horas_totales: Number(nuevaRuta.horas_totales),
        nivel: nuevaRuta.nivel,
        precio: Number(nuevaRuta.precio),
        estado: nuevaRuta.estado,
        destacado: Boolean(nuevaRuta.destacado),
      };
      
      const response = await apiClient.post("/rutas-academicas", cleanData);

      const data = response.data;
      console.log("Crear ruta →", data);

      await fetchRutas();
      return true;
    } catch (error: any) {
      console.error("Error al crear ruta:", error);
      alert("Error al crear ruta: " + (error.response?.data?.message || "Error desconocido"));
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
            placeholder="Buscar por nombre de ruta..."
            className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm text-slate-900 font-medium placeholder:text-slate-400 text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
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
            Nueva Ruta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Vista Desktop (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Ruta Académica</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Nivel</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-right pr-12">Inversión</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr>
                   <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando rutas...</span>
                    </div>
                  </td>
                </tr>
              ) : rutasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                      <FaSearch size={48} className="text-gray-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{errorMessage || "No se encontraron rutas"}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                [...rutasFiltradas]
                  .sort((a, b) => {
                    const orden = ["Publicado", "Archivado"];
                    const ordenA = orden.indexOf(a.estado);
                    const ordenB = orden.indexOf(b.estado);
                    if (ordenA !== ordenB) return ordenA - ordenB;
                    return a.nombre.localeCompare(b.nombre);
                  })
                  .map((ruta) => (
                    <tr key={ruta.id_ruta} className="group hover:bg-slate-50/80 transition-all duration-500">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="relative w-32 h-20 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-500 border border-white shrink-0 bg-slate-100">
                            {ruta.imagen ? (
                              <img src={ruta.imagen} alt={ruta.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 uppercase font-black">No img</div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[15px] font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight truncate">{ruta.nombre}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">ID: #{ruta.id_ruta}</span>
                               <span className="text-[9px] text-sky-500 font-black uppercase tracking-widest">Master Route</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-300 ${
                            ruta.nivel?.toLowerCase() === 'avanzado' ? 'border-amber-200/50 bg-amber-500/10 text-amber-600' :
                            ruta.nivel?.toLowerCase() === 'intermedio' ? 'border-sky-200/50 bg-sky-500/10 text-sky-600' :
                            'border-emerald-200/50 bg-emerald-500/10 text-emerald-600'
                          }`}>
                          {ruta.nivel || "No definido"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right pr-12">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Inversión</span>
                          <span className="text-base font-black text-[#0E1C2B]">
                            {ruta.precio != null && !isNaN(Number(ruta.precio))
                              ? `S/. ${Number(ruta.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all duration-500
                          ${ruta.estado === "Publicado" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-[0_0_15px_rgba(100,116,139,0.1)]"}
                        `}>
                          <div className={`w-1.5 h-1.5 rounded-full ${ruta.estado === "Publicado" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          {ruta.estado}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
                          <button
                            onClick={() => handleEditar(ruta)}
                            className="p-2.5 rounded-xl text-amber-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Editar"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleEstadoClick(ruta)}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Archivar/Publicar"
                          >
                            <FaArchive size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setRutaAEliminar(ruta);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl text-rose-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Eliminar"
                          >
                            <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                          <button
                            onClick={() => {
                              setRutaSeleccionada(ruta);
                              setIsInfoModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl text-sky-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Detalles"
                          >
                            <FaInfoCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              }
            </tbody>
          </table>
        </div>

        {/* Vista Móvil (Cards Urban SaaS) */}
        <div className="md:hidden divide-y divide-slate-50">
          {cargando ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cargando...</span>
            </div>
          ) : rutasFiltradas.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-bold italic text-xs">No hay rutas disponibles</div>
          ) : (
            rutasFiltradas.map((ruta) => (
              <div key={ruta.id_ruta} className="p-6 space-y-5 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="relative w-28 h-20 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-50 flex-shrink-0 bg-slate-100">
                    {ruta.imagen ? (
                      <img src={ruta.imagen} alt={ruta.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-black uppercase">No img</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-base font-black text-slate-900 tracking-tight leading-tight mb-2 truncate">{ruta.nombre}</span>
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                          ruta.nivel?.toLowerCase() === 'avanzado' ? 'border-amber-200/50 bg-amber-500/10 text-amber-600' :
                          ruta.nivel?.toLowerCase() === 'intermedio' ? 'border-sky-200/50 bg-sky-500/10 text-sky-600' :
                          'border-emerald-200/50 bg-emerald-500/10 text-emerald-600'
                        }`}>
                        {ruta.nivel || "Nivel Gral."}
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                        ruta.estado === "Activa" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                      }`}>
                        {ruta.estado}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex flex-col pl-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Inversión</span>
                    <span className="text-base font-black text-slate-900">
                       S/. {Number(ruta.precio || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <button onClick={() => handleEditar(ruta)} className="p-2.5 text-amber-500 hover:scale-95 transition-transform"><FaEdit size={16} /></button>
                    <button onClick={() => handleEstadoClick(ruta)} className="p-2.5 text-slate-400 hover:scale-95 transition-transform"><FaArchive size={16} /></button>
                    <button onClick={() => { setRutaAEliminar(ruta); setIsDeleteModalOpen(true); }} className="p-2.5 text-rose-500 hover:scale-95 transition-transform">
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <button onClick={() => { setRutaSeleccionada(ruta); setIsInfoModalOpen(true); }} className="p-2.5 text-sky-500 hover:scale-95 transition-transform"><FaInfoCircle size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )
        }
        </div>
        
        {/* Paginación Profesional Urban SaaS */}
        <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
             <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Página <span className="text-sky-600">{pagina}</span> de {totalPaginas}
                </span>
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultados filtrados: {rutasFiltradas.length}</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || cargando}
              className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas || cargando}
              className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 shadow-lg disabled:opacity-30 transition-all active:scale-95"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <InfoRutaModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        ruta={rutaSeleccionada}
      />

      {rutaAEditar && (
        <EditRutaModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          ruta={rutaAEditar!}
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
      <ArchiveModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={handleConfirmCambioEstado}
        itemName={rutaEstado?.nombre || ""}
        nuevoEstado={(rutaEstado?.estado === "Activa" ? "Archivado" : "Publicado") as "Publicado" | "Archivado"}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRutaAEliminar(null);
        }}
        onConfirm={handleEliminar}
        itemName={rutaAEliminar?.nombre || ""}
      />
    </div>
  );
}

