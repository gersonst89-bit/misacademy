"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaSearch,
  FaInfoCircle,
  FaPlus,
  FaEdit,
  FaArchive,
} from "react-icons/fa";
import type { Curso } from "../../types/models";

import { AddEvaluacionModal } from "./agregarEvaluaciones";
import { InfoEvaluacionModal } from "./infoEvaluaciones";
import { EditEvaluacionModal } from "./editEvaluaciones";
import { ArchiveModal } from "../components/ArchiveModal";
import AgregarPreguntasModal from "./AgregarPreguntasModal";
import { API_URL } from "../../config/api";

const API = API_URL;

function authHeaders(extra?: Record<string, string>) {
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") ||
        localStorage.getItem("access_token"))) ||
    "";

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {}),
  };
}

function ensureTokenOrWarn(): boolean {
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") ||
        localStorage.getItem("access_token"))) ||
    "";

  if (!token) {
    alert("Debes iniciar sesión como ADMIN para usar estos módulos.");
    return false;
  }

  return true;
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
        const res = await fetch(`${API}/cursos?page=${page}`);
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
  if (!ensureTokenOrWarn()) return;

  setIsLoading(true);

  try {
    let todas: any[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const url =
        `${API}/evaluaciones?page=${page}` +
        (cursoFiltro ? `&id_curso=${cursoFiltro}` : "");

      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();

      console.log("PAGE", page, data);

      const arr = Array.isArray(data?.data?.data)
        ? data.data.data
        : [];

      todas = [...todas, ...arr];

      lastPage = data?.data?.last_page || 1;
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
    if (!ensureTokenOrWarn()) return false;

    try {
      const r = await fetch(`${API}/evaluaciones`, {
        method: "POST",
        headers: authHeaders(),
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
    if (!ensureTokenOrWarn()) return false;

    try {
      const r = await fetch(`${API}/evaluaciones/${ev.id_evaluacion}`, {
        method: "PUT",
        headers: authHeaders(),
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

    const nuevoEstado =
      evalEstadoSel.estado === "Publicado" ? "Archivado" : "Publicado";

    try {
      const r = await fetch(
        `${API}/evaluaciones/${evalEstadoSel.id_evaluacion}/estado`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

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


  const renderTabla = () => {
    if (!Array.isArray(filtradas)) {
      console.warn("filtradas NO es array:", filtradas);
      return <div>Error cargando evaluaciones.</div>;
    }

    return (
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Curso</th>
              <th className="px-4 py-3 text-left">Punt. Req</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No hay evaluaciones.
                </td>
              </tr>
            ) : (
              filtradas.map((e) => (
                <tr key={e.id_evaluacion} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-3">{e.id_evaluacion}</td>
                  <td className="px-4 py-3">{e.titulo}</td>
                  <td className="px-4 py-3">{e.tipo || "–"}</td>
                  <td className="px-4 py-3">{cursoNombreById.get(e.id_curso)}</td>
                  <td className="px-4 py-3">{e.puntuacion_requerida}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        e.estado == "Publicado"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {e.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-center">
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => {
                          setIdEvalPreg(e.id_evaluacion);
                          setIsPregOpen(true);
                        }}
                      >
                        <FaPlus size={18} />
                      </button>

                      <button
                        className="text-sky-600 hover:text-sky-800"
                        onClick={() => {
                          setEdit(e);
                          setIsEditOpen(true);
                        }}
                      >
                        <FaEdit size={18} />
                      </button>

                      <button
                        className="text-yellow-600 hover:text-yellow-800"
                        onClick={() => {
                          setEvalEstadoSel(e);
                          setIsEstadoOpen(true);
                        }}
                      >
                        <FaArchive size={18} />
                      </button>

                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => {
                          setInfo(e);
                          setIsInfoOpen(true);
                        }}
                      >
                        <FaInfoCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="px-8 py-6 flex flex-col gap-6">

      <div className="flex items-center gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar evaluación..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
        >
          <FaPlus /> Agregar Evaluación
        </button>
      </div>

      <div className="flex justify-center items-center gap-6 mt-4 flex-wrap">
        <select
          value={cursoFiltro}
          onChange={(e) =>
            setCursoFiltro(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Todos los cursos</option>
          {cursos.map((c) => (
            <option key={c.id_curso} value={c.id_curso}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as any)}
          className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Todos los estados</option>
          <option value="Publicado">Publicado</option>
          <option value="Archivado">Archivado</option>
        </select>
      </div>

      {renderTabla()}

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
    </div>
  );
}

export default Evaluaciones;
