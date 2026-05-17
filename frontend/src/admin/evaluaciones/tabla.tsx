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
  IoArchiveOutline,
  IoAddCircleOutline,
} from "react-icons/io5";
import type { Curso } from "../../types/models";

import { AddEvaluacionModal } from "./agregarEvaluaciones";
import { InfoEvaluacionModal } from "./infoEvaluaciones";
import { EditEvaluacionModal } from "./editEvaluaciones";
import { ArchiveModal } from "../Components/ArchiveModal";
import DeleteModal from "../Components/DeleteModal";
import AgregarPreguntasModal from "./AgregarPreguntasModal";
import { apiUrl } from "../../config/api";

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
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Sin resultados</p>
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
  onChange: (v: "" | EstadoAPI) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const estados: { value: "" | EstadoAPI; label: string }[] = [
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


function authHeaders(extra?: Record<string, string>) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(extra || {}),
  };
}

type EstadoAPI = "Publicado" | "Archivado";

export function Evaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [filtradas, setFiltradas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoFiltro, setCursoFiltro] = useState<number | "">("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoAPI | "">("");

  const [isLoading, setIsLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [info, setInfo] = useState<any | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);

  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [evalEstadoSel, setEvalEstadoSel] = useState<any | null>(null);

  const [isPregOpen, setIsPregOpen] = useState(false);
  const [idEvalPreg, setIdEvalPreg] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [evalToDelete, setEvalToDelete] = useState<any | null>(null);

  const cursoNombreById = useMemo(() => {
    const map = new Map<number, string>();
    cursos.forEach((c) => map.set(c.id_curso, c.nombre));
    return map;
  }, [cursos]);

  async function fetchCursos() {
    try {
      let todos: Curso[] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const res = await fetch(apiUrl(`/admin/cursos?page=${page}`), { credentials: "include" });
        const data = await res.json();

        const arr: Curso[] = Array.isArray(data.data) ? data.data : [];
        todos = [...todos, ...arr];

        lastPage = data.last_page || 1;
        page++;
      } while (page <= lastPage);

      setCursos(todos);
    } catch (error) {
      console.error("Error cargando cursos:", error);
      setCursos([]);
    }
  }

async function fetchEvaluaciones() {
  setIsLoading(true);
  try {
    let todas: any[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const url =
        apiUrl(`/admin/evaluaciones?page=${page}`) +
        (cursoFiltro ? `&id_curso=${cursoFiltro}` : "");

      const res = await fetch(url, { headers: authHeaders(), credentials: "include" });
      const data = await res.json();

      const arr = Array.isArray(data?.data) ? data.data : [];
      todas = [...todas, ...arr];
      lastPage = data?.last_page || 1;
      page++;
    } while (page <= lastPage);

    setEvaluaciones(todas);
    setFiltradas(todas);
  } catch (err) {
    console.error(err);
    setEvaluaciones([]);
    setFiltradas([]);
  } finally {
    setIsLoading(false);
  }
}

  useEffect(() => {
    fetchCursos();
    fetchEvaluaciones();
  }, []);

  useEffect(() => {
    fetchEvaluaciones();
  }, [cursoFiltro]);

  useEffect(() => {
    let arr = [...evaluaciones];

    if (busqueda.trim() !== "") {
      const t = busqueda.toLowerCase();
      arr = arr.filter(
        (ev) =>
          ev.titulo.toLowerCase().includes(t) ||
          (ev.descripcion || "").toLowerCase().includes(t)
      );
    }

    if (estadoFiltro) {
      arr = arr.filter((ev) => ev.estado === estadoFiltro);
    }

    arr.sort((a, b) => {
      const orderA = a.estado === "Publicado" ? 0 : 1;
      const orderB = b.estado === "Publicado" ? 0 : 1;
      return orderA - orderB;
    });

    setFiltradas(arr);
  }, [busqueda, estadoFiltro, evaluaciones]);

  const crear = async (payload: any) => {
    try {
      const r = await fetch(apiUrl("/admin/evaluaciones"), {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        alert("Error creando evaluación.");
        return false;
      }

      await fetchEvaluaciones();
      return true;
    } catch {
      alert("Error creando evaluación.");
      return false;
    }
  };

  const guardar = async (ev: any) => {
    try {
      const r = await fetch(apiUrl(`/admin/evaluaciones/${ev.id_evaluacion}`), {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(ev),
      });

      if (!r.ok) {
        alert("Error actualizando evaluación.");
        return false;
      }

      await fetchEvaluaciones();
      return true;
    } catch {
      alert("Error al guardar evaluación.");
      return false;
    }
  };

  const confirmarCambioEstado = async () => {
    if (!evalEstadoSel) return;
    const nuevoEstado = evalEstadoSel.estado === "Publicado" ? "Archivado" : "Publicado";
    try {
      const { id_evaluacion, curso, ...cleanEval } = evalEstadoSel;
      const r = await fetch(apiUrl(`/admin/evaluaciones/${id_evaluacion}`), {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ ...cleanEval, estado: nuevoEstado }),
      });
      if (!r.ok) {
        alert("No se pudo cambiar el estado.");
        return;
      }
      setIsEstadoOpen(false);
      await fetchEvaluaciones();
    } catch {
      alert("Error cambiando estado.");
    }
  };

  const handleEliminar = async () => {
    if (!evalToDelete) return;
    try {
      const r = await fetch(apiUrl(`/admin/evaluaciones/${evalToDelete.id_evaluacion}`), {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!r.ok) {
        alert("No se pudo eliminar la evaluación.");
        return;
      }
      setIsDeleteOpen(false);
      await fetchEvaluaciones();
    } catch {
      alert("Error eliminando evaluación.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-500">
        <div className="relative flex-1 group md:ml-2">
          <IoSearchOutline className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar evaluación por título o descripción..."
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
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-md flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            <IoAddOutline size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Nueva Evaluación
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center transition-all duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 animate-pulse">Sincronizando Evaluaciones...</span>
            </div>
          </div>
        )}

        {/* Desktop High-Density Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Evaluación Académica</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Curso Vinculado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Aprobatorio</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtradas.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-50">
                      <IoSearchOutline size={48} className="text-slate-300" />
                      <span className="text-slate-500 font-medium tracking-tight uppercase text-[10px] font-black tracking-widest">No se encontraron evaluaciones</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtradas.map((ev) => (
                  <tr key={ev.id_evaluacion} className="group hover:bg-slate-50/80 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight uppercase">{ev.titulo}</span>
                        <div className="flex items-center gap-2 mt-2.5">
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-slate-200/50 shadow-sm">ID: #{ev.id_evaluacion}</span>
                          <span className="text-[9px] bg-sky-50 text-sky-600/70 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-sky-100/50 shadow-sm">EXAMEN ACADÉMICO</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-700 leading-snug max-w-[250px] truncate" title={cursoNombreById.get(ev.id_curso)}>
                          {cursoNombreById.get(ev.id_curso) || "Sin curso asignado"}
                        </span>
                        <span className="text-[9px] text-sky-500 font-black uppercase tracking-widest mt-1">Programa Académico</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                         ${ev.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}
                       `}>
                          {ev.estado}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEdit(ev);
                            setIsEditOpen(true);
                          }}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors group/edit relative"
                          title="Editar"
                        >
                          <IoCreateOutline size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setEvalEstadoSel(ev);
                            setIsEstadoOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors group/archive relative"
                          title="Cambiar Estado"
                        >
                          <IoArchiveOutline size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setInfo(ev);
                            setIsInfoOpen(true);
                          }}
                          className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl transition-colors group/info relative"
                          title="Información"
                        >
                          <IoInformationCircleOutline size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setEvalToDelete(ev);
                            setIsDeleteOpen(true);
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group/delete relative"
                          title="Eliminar"
                        >
                          <IoTrashOutline size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setIdEvalPreg(ev.id_evaluacion);
                            setIsPregOpen(true);
                          }}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors group/add relative"
                          title="Agregar Preguntas"
                        >
                          <IoAddCircleOutline size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Layout (Cards Urban SaaS) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtradas.length === 0 && !isLoading ? (
            <div className="p-10 text-center text-slate-400 font-medium italic">No se encontraron evaluaciones</div>
          ) : (
            filtradas.map((ev) => (
              <div key={ev.id_evaluacion} className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors duration-300">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-black text-slate-900 leading-tight tracking-tight block truncate group-hover:text-sky-600 transition-colors uppercase">{ev.titulo}</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest truncate">{cursoNombreById.get(ev.id_curso) || "Sin curso vinculado"}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                    <span className="text-xs font-black text-slate-900">EXAM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border border-slate-200/50 shadow-sm">ID: #{ev.id_evaluacion}</span>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border
                      ${ev.estado === "Publicado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}
                    `}>
                      {ev.estado}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <button onClick={() => { setIdEvalPreg(ev.id_evaluacion); setIsPregOpen(true); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><IoAddCircleOutline size={18} /></button>
                    <button onClick={() => { setEdit(ev); setIsEditOpen(true); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><IoCreateOutline size={18} /></button>
                    <button onClick={() => { setEvalEstadoSel(ev); setIsEstadoOpen(true); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"><IoArchiveOutline size={18} /></button>
                    <button onClick={() => { setEvalToDelete(ev); setIsDeleteOpen(true); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><IoTrashOutline size={18} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddEvaluacionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={crear}
      />

      <InfoEvaluacionModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        evaluacion={info}
      />

      {edit && (
        <EditEvaluacionModal
          isOpen={isEditOpen}
          evaluacion={edit}
          onClose={() => {
            setIsEditOpen(false);
            setEdit(null);
          }}
          onSave={guardar}
        />
      )}

      <ArchiveModal
        isOpen={isEstadoOpen}
        onClose={() => setIsEstadoOpen(false)}
        onConfirm={confirmarCambioEstado}
        itemName={evalEstadoSel?.titulo}
        nuevoEstado={
          evalEstadoSel?.estado === "Publicado" ? "Archivado" : "Publicado"
        }
      />

      <AgregarPreguntasModal
        isOpen={isPregOpen}
        onClose={() => setIsPregOpen(false)}
        id_evaluacion={idEvalPreg}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleEliminar}
        itemName={evalToDelete?.titulo}
      />
    </div>
  );
}

export default Evaluaciones;
