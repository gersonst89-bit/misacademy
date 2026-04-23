// src/admin/modulos/index.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaSearch,
  FaInfoCircle,
  FaPlus,
  FaEdit,
  FaArchive,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import type { Modulo, Curso } from "../../types/models";
import { AddModuloModal } from "./agregarModulos";
import { InfoModuloModal } from "./infoModulos";
import { EditModuloModal } from "./editModulos";
import { EstadoModal } from "../components/EstadoModal";
import { API_URL } from "../../config/api";

const API_PUBLIC = API_URL;
const FK = "id_curso";
const MODULOS_URL = `${API_PUBLIC}/modulos/mis`;
const MODU_URL = `${API_PUBLIC}/modulos`;
const CURSOS_URL = `${API_PUBLIC}/cursos`;

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
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const r = await fetch(url, {
    cache: "no-store",
    headers,
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`${r.status} ${r.statusText}: ${text}`);
  }

  try {
    return await r.json();
  } catch {
    return {};
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
              placeholder="Buscar curso…"
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
              Todos los cursos
            </button>

            {opciones.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Sin resultados
              </div>
            )}

            {opciones.map((c) => (
              <button
                key={c.id_curso}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  onChange(c.id_curso);
                  setOpen(false);
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
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

  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [moduloEstadoSel, setModuloEstadoSel] = useState<Modulo | null>(null);

  const cursosById = useMemo(
    () => Object.fromEntries(cursos.map((c) => [c.id_curso, c.nombre])),
    [cursos]
  );

  /* --------- Cargar todos los cursos --------- */
  const fetchCursos = async () => {
    try {
      const all = await fetchAllPaged(`${CURSOS_URL}?_${Date.now()}`);
      setCursos(all as Curso[]);
    } catch {
      setCursos([]);
    }
  };

  /* --------- Cargar módulos --------- */
  const fetchModulos = async () => {
    setIsLoading(true);
    try {
      const base = `${MODULOS_URL}?_${Date.now()}${
        cursoFiltro ? `&${FK}=${cursoFiltro}` : ""
      }`;
      const all = (await fetchAllPaged(base)) as Modulo[];
      const normal = all.map((m: any) => ({ ...m, estado: toUi(m.estado) }));
      setModulos(normal);
      setFiltrados(normal);
    } catch (e) {
      console.error(e);
      setModulos([]);
      setFiltrados([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);
  useEffect(() => {
    fetchModulos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoFiltro]);

  /* --------- Búsqueda + filtro por estado + orden --------- */
  useEffect(() => {
    let arr = [...modulos];

    if (busqueda.trim()) {
      const t = busqueda.toLowerCase();
      arr = arr.filter(
        (m) =>
          m.titulo.toLowerCase().includes(t) ||
          (m.descripcion || "").toLowerCase().includes(t)
      );
    }

    if (estadoFiltro) {
      arr = arr.filter((m) => (m.estado as EstadoUI) === estadoFiltro);
    }

    const pesoEstado = (est: any) => ((est as EstadoUI) === "Activo" ? 0 : 1);

    arr.sort((a, b) => {
      const pa = pesoEstado(a.estado);
      const pb = pesoEstado(b.estado);
      if (pa !== pb) return pa - pb;
      return a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" });
    });

    setFiltrados(arr);
  }, [busqueda, estadoFiltro, modulos]);

  /* --------- Crear / Guardar / Estado --------- */
  const crear = async (
    nuevo: Omit<Modulo, "id_modulo" | "fecha_creacion" | "fecha_actualizacion">
  ) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") ||
            localStorage.getItem("access_token")
          : null;
      if (!token) {
        alert("Debes iniciar sesión como admin.");
        return false;
      }

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

      const res = await fetch(MODU_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        alert(`Error al crear el módulo:\n${errText}`);
        return false;
      }

      await fetchModulos();
      return true;
    } catch (e: any) {
      console.error(e);
      alert(`Ocurrió un error al crear el módulo.\n${e?.message || ""}`);
      return false;
    }
  };

  const guardar = async (edit: Modulo): Promise<boolean> => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") ||
            localStorage.getItem("access_token")
          : null;
      if (!token) {
        alert("Debes iniciar sesión como admin.");
        return false;
      }

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

      const res = await fetch(`${API_PUBLIC}/modulos/${edit.id_modulo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        alert(`Error al actualizar el módulo:\n${errText}`);
        return false;
      }

      await fetchModulos();
      return true;
    } catch (e: any) {
      console.error(e);
      alert(`Error al actualizar el módulo.\n${e?.message || ""}`);
      return false;
    }
  };

  const abrirModalEstado = (m: Modulo) => {
    setModuloEstadoSel(m);
    setIsEstadoModalOpen(true);
  };
  const confirmarCambioEstado = async () => {
    if (!moduloEstadoSel) return;
    const nuevoEstadoUi: EstadoUI =
      (moduloEstadoSel.estado as EstadoUI) === "Activo" ? "Inactivo" : "Activo";
    const actualizado: Modulo = {
      ...moduloEstadoSel,
      estado: nuevoEstadoUi,
      fecha_actualizacion: new Date().toISOString(),
    };
    const ok = await guardar(actualizado);
    if (ok) {
      setIsEstadoModalOpen(false);
      setModuloEstadoSel(null);
    }
  };

  return (
    <div className="px-8 py-6 text-black flex flex-col gap-6">
      {/* Fila 1: búsqueda + botón agregar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar módulos por título o descripción..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          className="ml-auto flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> Agregar Módulo
        </button>
      </div>

      {/* Fila 2: filtros (curso + estado) */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <FiltroCurso
          value={cursoFiltro}
          onChange={setCursoFiltro}
          cursos={cursos}
        />

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as "" | EstadoUI)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Orden</th>
              <th className="px-4 py-3 text-left">Curso</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Cargando módulos...
                </td>
              </tr>
            ) : filtrados.length > 0 ? (
              filtrados.map((m, idx) => (
                <tr
                  key={m.id_modulo}
                  className={`border-b ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-3">{m.titulo}</td>
                  <td className="px-4 py-3">{m.orden}</td>
                  <td className="px-4 py-3">
                    {cursosById[(m as any)[FK]] || (m as any)[FK]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (m.estado as EstadoUI) === "Activo"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {m.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-6">
                      <button
                        onClick={() => {
                          setModuloEdit(m);
                          setIsEditOpen(true);
                        }}
                        className="text-sky-600 hover:text-sky-800"
                        title="Editar"
                      >
                        <FaEdit size={18} />
                      </button>

                      <button
                        onClick={() => abrirModalEstado(m)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title={
                          (m.estado as EstadoUI) === "Activo"
                            ? "Inactivar"
                            : "Activar"
                        }
                      >
                        <FaArchive size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setModuloInfo(m);
                          setIsInfoOpen(true);
                        }}
                        className="text-gray-700 hover:text-gray-900"
                        title="Ver información"
                      >
                        <FaInfoCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No hay módulos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
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

      <EstadoModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={confirmarCambioEstado}
        nombreDocente={moduloEstadoSel?.titulo || ""}
        nuevoEstado={
          (moduloEstadoSel?.estado as EstadoUI) === "Activo"
            ? "Inactivo"
            : "Activo"
        }
      />
    </div>
  );
}

export default Modulos;
