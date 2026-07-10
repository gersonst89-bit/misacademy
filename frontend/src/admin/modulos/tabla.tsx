// src/admin/modulos/index.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IoTrashOutline,
  IoCreateOutline,
  IoInformationCircleOutline,
  IoAddOutline,
  IoSearchOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoFilterOutline,
} from "react-icons/io5";
import type { Modulo, Curso } from "../../types/models";
import { AddModuloModal } from "./agregarModulos";
import { InfoModuloModal } from "./infoModulos";
import { EditModuloModal } from "./editModulos";
import DeleteModal from "../Components/DeleteModal";
import { apiClient } from "../../services/apiClient";
const FK = "id_curso";

type EstadoUI = "Activo" | "Inactivo";

const toUi = (api: string): EstadoUI =>
  api === "Activo" || api === "Inactivo"
    ? (api as EstadoUI)
    : api === "Publicado"
    ? "Activo"
    : "Inactivo";

const uiToPublicado = (ui: EstadoUI) =>
  ui === "Activo" ? "Publicado" : "Archivado";

/* =========================
   HELPERS: parse + paginación robusta
========================= */
function parseList(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.rows)) return json.rows;
  if (Array.isArray(json?.result)) return json.result;
  if (Array.isArray(json?.data?.data)) return json.data.data; // Laravel paginator
  return [];
}

function getLastPage(json: any): number {
  const lp =
    json?.last_page ?? json?.meta?.last_page ?? json?.data?.last_page ?? 1;
  return typeof lp === "number" && lp > 0 ? lp : 1;
}

async function fetchJson(url: string) {
  try {
    const r = await apiClient.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    return r.data;
  } catch (err: any) {
    const status = err.response?.status || "Error";
    const statusText = err.response?.statusText || "";
    const text = typeof err.response?.data === 'string' ? err.response?.data : JSON.stringify(err.response?.data || "");
    throw new Error(`${status} ${statusText}: ${text}`);
  }
}

/** Trae TODAS las páginas de un endpoint paginado (o una si no pagina). */
async function fetchAllPaged(baseUrl: string): Promise<any[]> {
  let page = 1;
  let lastPage = 1;
  let first = true;
  const acc: any[] = [];

  while (first || page <= lastPage) {
    first = false;
    const sep = baseUrl.includes("?") ? "&" : "?";
    const url = `${baseUrl}${sep}page=${page}`;
    const js = await fetchJson(url);
    const chunk = parseList(js);
    acc.push(...chunk);
    lastPage = getLastPage(js);
    page++;
  }

  return acc;
}

/* ===== Filtro de cursos con autocompletado ===== */
function FiltroCurso({
  value,
  onChange,
  cursos,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  cursos: Curso[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const labelActual =
    (value !== "" && cursos.find((c) => c.id_curso === value)?.nombre) ||
    "Todos los cursos";

  const opciones = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return cursos;
    return cursos.filter((c) => c.nombre.toLowerCase().includes(t));
  }, [q, cursos]);

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
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Seleccionar Curso</span>
          </div>
          <div className="p-3 relative group">
            <IoSearchOutline className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={14} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar por curso..."
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
              Todos los cursos
            </button>
            
            <div className="h-[1px] bg-slate-50 my-1 mx-2" />

            {opciones.map((c) => (
              <button
                key={c.id_curso}
                className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all mb-1 flex items-center gap-3
                  ${value === c.id_curso ? "bg-sky-500/10 text-sky-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
                onClick={() => {
                  onChange(c.id_curso);
                  setOpen(false);
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${value === c.id_curso ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "bg-slate-200"}`} />
                <span className="truncate">{c.nombre}</span>
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
  onChange: (v: "" | EstadoUI) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const estados: { value: "" | EstadoUI; label: string }[] = [
    { value: "", label: "Todos los estados" },
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
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
        <div className={`w-1.5 h-1.5 rounded-full ${value === 'Activo' ? 'bg-emerald-500 animate-pulse' : value === 'Inactivo' ? 'bg-rose-500' : 'bg-sky-500'}`} />
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
                e.value === 'Activo' ? 'bg-emerald-500' : 
                e.value === 'Inactivo' ? 'bg-rose-500' : 'bg-sky-500'
              }`} />
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   TABLA DE MÓDULOS
========================= */
export function Modulos() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [filtrados, setFiltrados] = useState<Modulo[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoFiltro, setCursoFiltro] = useState<number | "">("");
  const [estadoFiltro, setEstadoFiltro] = useState<"" | EstadoUI>("");

  const [isLoading, setIsLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [moduloInfo, setModuloInfo] = useState<Modulo | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [moduloEdit, setModuloEdit] = useState<Modulo | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduloAEliminar, setModuloAEliminar] = useState<Modulo | null>(null);

  const cursosById = useMemo(
    () => Object.fromEntries(cursos.map((c) => [c.id_curso, c.nombre])),
    [cursos]
  );

  // Debounce para la búsqueda (espera 500ms antes de buscar en el servidor)
  const [busquedaDebounced, setBusquedaDebounced] = useState(busqueda);
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPagina(1); // Resetear a página 1 al buscar
    }, 500);
    return () => clearTimeout(handler);
  }, [busqueda]);

  /* --------- Cargar todos los cursos (una sola vez para el filtro) --------- */
  const fetchCursos = async () => {
    try {
      const res = await apiClient.get("/admin/cursos", {
        params: { per_page: 200 }
      });
      setCursos(res.data.data || []);
    } catch {
      setCursos([]);
    }
  };

  /* --------- Cargar módulos (Paginado y Filtrado en Servidor) --------- */
  const fetchModulos = async () => {
    setIsLoading(true);
    setCargando(true);
    try {
      const params: any = {
        page: pagina,
        per_page: 15,
        q: busquedaDebounced,
        id_curso: cursoFiltro || undefined,
      };

      if (estadoFiltro) {
        params.estado = uiToPublicado(estadoFiltro as EstadoUI);
      }

      const res = await apiClient.get(`/admin/modulos`, { params });
      const items = res.data.data || [];
      const norm = items.map((m: any) => ({ ...m, estado: toUi(m.estado) }));
      
      setModulos(norm);
      setFiltrados(norm);
      setTotalPaginas(res.data.last_page || 1);
    } catch (e) {
      console.error(e);
      setModulos([]);
      setFiltrados([]);
    } finally {
      setIsLoading(false);
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  useEffect(() => {
    fetchModulos();
  }, [pagina, busquedaDebounced, cursoFiltro, estadoFiltro]);

  /* --------- Crear / Guardar / Borrar --------- */
  const crear = async (
    nuevo: Omit<Modulo, "id_modulo" | "fecha_creacion" | "fecha_actualizacion">
  ) => {
    try {
      const basePayload = {
        [FK]: Number((nuevo as any)[FK]),
        titulo: nuevo.titulo,
        descripcion: nuevo.descripcion ?? null,
        orden: Number(nuevo.orden),
      };

      const payload: any = {
        ...basePayload,
        estado: uiToPublicado(nuevo.estado as EstadoUI),
      };

      await apiClient.post("/admin/modulos", payload);
      await fetchModulos();
      return true;
    } catch (e: any) {
      console.error(e);
      const errMsg = e.response?.data?.message || e.message || "Ocurrió un error al crear el módulo.";
      alert(`Error al crear el módulo:\n${Array.isArray(errMsg) ? errMsg.join("\n") : errMsg}`);
      return false;
    }
  };

  const guardar = async (edit: Modulo): Promise<boolean> => {
    try {
      const basePayload = {
        [FK]: Number((edit as any)[FK]),
        titulo: edit.titulo,
        descripcion: edit.descripcion ?? null,
        orden: Number(edit.orden),
      };

      const payload: any = {
        ...basePayload,
        estado: uiToPublicado(edit.estado as EstadoUI),
      };

      await apiClient.put(`/admin/modulos/${edit.id_modulo}`, payload);
      await fetchModulos();
      return true;
    } catch (e: any) {
      console.error(e);
      const errMsg = e.response?.data?.message || e.message || "Error al actualizar el módulo.";
      alert(`Error al actualizar el módulo:\n${Array.isArray(errMsg) ? errMsg.join("\n") : errMsg}`);
      return false;
    }
  };

  const abrirModalEliminar = (m: Modulo) => {
    setModuloAEliminar(m);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!moduloAEliminar) return;
    try {
      await apiClient.delete(`/admin/modulos/${moduloAEliminar.id_modulo}`);
      await fetchModulos();
      setIsDeleteModalOpen(false);
      setModuloAEliminar(null);
      alert("Módulo eliminado con éxito");
    } catch (e: any) {
      console.error(e);
      const errMsg = e.response?.data?.message || e.message || "Error al eliminar el módulo.";
      alert("Error al eliminar el módulo: " + errMsg);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Bar Urban SaaS */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-500">
        <div className="relative flex-1 group md:ml-2">
          <IoSearchOutline className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar módulos académicos..."
            className="w-full pl-8 pr-4 py-2 bg-transparent focus:outline-none text-[13px] font-bold text-slate-900 placeholder:text-slate-300"
          />
        </div>

        <div className="hidden lg:block h-8 w-[1px] bg-slate-100 mx-2" />

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-auto">
             <FiltroCurso
               value={cursoFiltro}
               onChange={setCursoFiltro}
               cursos={cursos}
             />
          </div>

          <div className="w-full sm:w-auto">
             <FiltroEstado
               value={estadoFiltro}
               onChange={setEstadoFiltro}
             />
          </div>

          <div className="hidden lg:block h-8 w-[1px] bg-slate-100 mx-2" />

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-md flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            <IoAddOutline size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Nuevo Módulo
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center transition-all duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 animate-pulse">Sincronizando...</span>
            </div>
          </div>
        )}

        {/* Vista Desktop (Tabla High-Density) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Módulo Académico</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Curso Vinculado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Orden</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-50">
                      <IoSearchOutline size={48} className="text-slate-300" />
                      <span className="text-slate-500 font-medium tracking-tight uppercase text-[10px] font-black tracking-widest">No se encontraron módulos</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map((m) => (
                  <tr key={m.id_modulo} className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight">{m.titulo}</span>
                        <div className="flex items-center gap-2 mt-2.5">
                           <span className="text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-slate-200/50 shadow-sm">ID: #{m.id_modulo}</span>
                           <span className="text-[9px] bg-sky-50 text-sky-600/70 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-sky-100/50 shadow-sm">Módulo Académico</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-700 leading-snug max-w-[250px] truncate" title={cursosById[(m as any)[FK]]}>
                          {cursosById[(m as any)[FK]] || (m as any)[FK]}
                        </span>
                        <span className="text-[9px] text-sky-500 font-black uppercase tracking-widest mt-1">Programa Académico</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-900 shadow-sm group-hover:border-sky-200 group-hover:shadow-sky-100 transition-all">
                          {m.orden}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-500
                        ${(m.estado as EstadoUI) === "Activo" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"}
                      `}>
                        <div className={`w-1.5 h-1.5 rounded-full ${(m.estado as EstadoUI) === "Activo" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                        {m.estado}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
                        <button
                          onClick={() => {
                            setModuloEdit(m);
                            setIsEditOpen(true);
                          }}
                          className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all duration-300"
                          title="Editar"
                        >
                          <IoCreateOutline size={18} className="hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(m)}
                          className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-300"
                          title="Eliminar"
                        >
                          <IoTrashOutline size={18} className="hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => {
                            setModuloInfo(m);
                            setIsInfoOpen(true);
                          }}
                          className="p-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all duration-300"
                          title="Info"
                        >
                          <IoInformationCircleOutline size={18} className="hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil (Cards Urban SaaS Responsivo) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtrados.length === 0 && !isLoading ? (
            <div className="p-10 text-center text-slate-400 font-medium italic">No se encontraron módulos académicos</div>
          ) : (
            filtrados.map((m) => (
              <div key={m.id_modulo} className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors duration-300">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-black text-slate-900 leading-tight tracking-tight block truncate group-hover:text-sky-600 transition-colors">{m.titulo}</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest truncate">{cursosById[(m as any)[FK]] || "Sin curso vinculado"}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Orden</span>
                    <span className="text-xs font-black text-slate-900">{m.orden}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-slate-200/50">ID: #{m.id_modulo}</span>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all
                      ${(m.estado as EstadoUI) === "Activo" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                    `}>
                       <div className={`w-1 h-1 rounded-full ${(m.estado as EstadoUI) === "Activo" ? "bg-emerald-500" : "bg-rose-500"}`} />
                       {m.estado}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <button onClick={() => { setModuloEdit(m); setIsEditOpen(true); }} className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><IoCreateOutline size={18} /></button>
                    <button onClick={() => abrirModalEliminar(m)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><IoTrashOutline size={18} /></button>
                    <button onClick={() => { setModuloInfo(m); setIsInfoOpen(true); }} className="p-2.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"><IoInformationCircleOutline size={18} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación Profesional Urban SaaS */}
        <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               Página <span className="text-slate-900">{pagina}</span> de <span className="text-slate-900">{totalPaginas}</span>
             </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || isLoading}
              className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-20 transition-all duration-300 shadow-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas || isLoading}
              className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 disabled:opacity-20 transition-all duration-300 shadow-md shadow-sky-900/10 active:scale-95"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <InfoModuloModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        modulo={moduloInfo as any}
        cursoNombre={
          moduloInfo
            ? cursosById[(moduloInfo as any)[FK]] ||
              String((moduloInfo as any)[FK])
            : undefined
        }
      />

      <AddModuloModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={crear}
      />

      {moduloEdit && isEditOpen && (
        <EditModuloModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setModuloEdit(null);
          }}
          modulo={moduloEdit}
          onSave={guardar}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={moduloAEliminar?.titulo || ""}
      />
    </div>
  );
}


