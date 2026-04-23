// src/curso-player/VideoPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./curso-player.css";
import mockDB from "../data/mockDatabase";
import { API_URL } from "../config/api";

/* =========================
   CONFIG / HELPERS
========================= */
const API_BASE = API_URL;
const DEFAULT_DEMO_VIDEO = "https://www.youtube.com/embed/_avOWmCh_Xs";

// utilidades seguras y cortas
function num(v: any): number {
  if (v == null || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// pick genérico tolerante a null/undefined y con valor por defecto
function pick<T = any>(obj: any, keys: string[], fallback?: T): T {
  if (obj && typeof obj === "object") {
    for (const k of keys) {
      const v = (obj as any)?.[k];
      if (v !== undefined && v !== null) return v as T;
    }
  }
  return fallback as T;
}

function parseList(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.result)) return json.result;
  if (Array.isArray(json?.rows)) return json.rows;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  return [];
}

function authHeaders(extra?: Record<string, string>) {
  const t =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(extra || {}),
  };
}

async function getJson(url: string) {
  const r = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  try {
    return await r.json();
  } catch {
    return {};
  }
}
async function postJson(url: string, body: any) {
  const r = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  try {
    const js = await r.json();
    return { ok: r.ok, data: js };
  } catch {
    const tx = await r.text();
    return { ok: r.ok, data: tx };
  }
}

/* Normalizadores usando pick() */
const getCursoId = (o: any) => pick<number>(o, ["id_curso", "curso_id", "id"]);
const getCursoNombre = (o: any) =>
  pick<string>(o, ["nombre", "titulo"], "Curso");

const getModuloId = (o: any) =>
  pick<number>(o, ["id_modulo", "modulo_id", "id"]);
const getModuloTitulo = (o: any) =>
  pick<string>(o, ["titulo", "nombre"], "Módulo");
const getModuloPeso = (o: any) =>
  num(pick<any>(o, ["peso_progreso", "peso", "weight"], 0)) || 0;

const getLeccionId = (o: any) =>
  pick<number>(o, ["id_leccion", "leccion_id", "id"]);
const getLeccionTitulo = (o: any) =>
  pick<string>(o, ["titulo", "nombre"], "Lección");
const getLeccionUrl = (o: any) =>
  pick<string>(o, ["url_video", "video_url", "url"]);

const getMaterialNombre = (o: any) =>
  pick<string>(o, ["nombre", "titulo"], "Material");
const getMaterialUrl = (o: any) => pick<string>(o, ["url_archivo", "url"], "#");

/* Tipos simples */
type Mod = { id: number; titulo: string; peso: number; lecciones: any[] };
type Coment = {
  id?: number | string;
  leccion_id: number;
  texto: string;
  usuario?: { nombre?: string; avatar?: string };
  created_at?: string;
  parent_id?: number | string | null;
  replies?: Coment[];
};
type EvalPregunta = {
  enunciado: string;
  opciones: string[];
  correcta: number; // índice
  puntaje: number; // default 1
};
type EvalConfig = {
  id: number;
  titulo: string;
  puntajeMinimo: number; // 0-100
  intentosMax?: number;
  preguntas: EvalPregunta[];
};

/* =========================
   COMPONENTE
========================= */
const VideoPage: React.FC = () => {
  const { cursoIdSlug } = useParams();
  const navigate = useNavigate();
  const cursoId = useMemo(
    () => num(String(cursoIdSlug || "").split("-")[0]),
    [cursoIdSlug]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [curso, setCurso] = useState<any | null>(null);
  const [mods, setMods] = useState<Mod[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [examenDesbloqueado, setExamenDesbloqueado] = useState(false);

  const [activeLeccion, setActiveLeccion] = useState<any | null>(null);
  const [activeModuloId, setActiveModuloId] = useState<number | null>(null);

  const [comments, setComments] = useState<Coment[]>([]);
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState("");

  // evaluación
  const [evalVisible, setEvalVisible] = useState(false);
  const [evalCfg, setEvalCfg] = useState<EvalConfig | null>(null);
  const [evalRespuestas, setEvalRespuestas] = useState<number[]>([]);
  const [evalPuntaje, setEvalPuntaje] = useState<number | null>(null);
  const [evalAprobado, setEvalAprobado] = useState<boolean | null>(null);
  const [evalIntentos, setEvalIntentos] = useState<number>(0);
  const [generandoCert, setGenerandoCert] = useState(false);

  // NUEVO: tipo de evaluación y módulos aprobados
  const [modoEval, setModoEval] = useState<"modulo" | "final" | null>(null);
  const [moduloEvaluadoId, setModuloEvaluadoId] = useState<number | null>(null);
  const [modulosAprobados, setModulosAprobados] = useState<
    Record<number, boolean>
  >({});

  /* --------- Cargar curso + módulos + lecciones --------- */
  useEffect(() => {
    let cancel = false;


    (async () => {
      if (!cursoId || Number.isNaN(cursoId)) {
        setError("Curso no válido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // ----- Curso -----
        let jc: any = null;
        try {
          jc = await getJson(`${API_BASE}/cursos/${cursoId}?_${Date.now()}`);
        } catch {
          jc = mockDB.cursos.find((c) => c.id_curso === cursoId) || null;
        }
        if (!jc || Object.keys(jc).length === 0) {
          try {
            const list = parseList(
              await getJson(`${API_BASE}/cursos?_${Date.now()}`)
            );
            jc = list.find((c) => num(getCursoId(c)) === cursoId) || jc;
          } catch {}
        }
        if (cancel) return;
        setCurso(jc);

        // ----- Progreso del curso (para examen final)
        try {
          const progresoResp = await getJson(`${API_BASE}/cursos/${cursoId}/progreso`);
          if (progresoResp && typeof progresoResp.examen_desbloqueado !== 'undefined') {
            setExamenDesbloqueado(!!progresoResp.examen_desbloqueado);
          }
        } catch {}

        // ----- Módulos -----
        let modsRaw: any[] = [];
        try {
          modsRaw = parseList(
            await getJson(`${API_BASE}/cursos/${cursoId}/modulos?_${Date.now()}`)
          );
        } catch {
          modsRaw = mockDB.modulos.filter((m) => m.id_curso === cursoId);
        }
        if (!modsRaw.length) {
          try {
            modsRaw = parseList(
              await getJson(
                `${API_BASE}/modulos?curso_id=${cursoId}&_${Date.now()}`
              )
            );
          } catch {}
        }

        if (modsRaw.length) {
          const withCursoId = modsRaw.filter(
            (m) =>
              !Number.isNaN(
                num(
                  (m as any).id_curso ??
                    (m as any).curso_id ??
                    (m as any).course_id ??
                    null
                )
              )
          );
          if (withCursoId.length) {
            modsRaw = withCursoId.filter(
              (m) =>
                num(
                  (m as any).id_curso ??
                    (m as any).curso_id ??
                    (m as any).course_id ??
                    null
                ) === cursoId
            );
          }
          const seen = new Set<number>();
          modsRaw = modsRaw.filter((m) => {
            const mid = num(getModuloId(m));
            if (!mid || Number.isNaN(mid)) return false;
            if (seen.has(mid)) return false;
            seen.add(mid);
            return true;
          });
          modsRaw.sort((a, b) => {
            const oa = num((a as any).orden ?? (a as any).order ?? 9999);
            const ob = num((b as any).orden ?? (b as any).order ?? 9999);
            return oa - ob;
          });
        }

        if (cancel) return;

        setMods(
          modsRaw.map((m) => ({
            id: num(getModuloId(m)),
            titulo: getModuloTitulo(m),
            peso: getModuloPeso(m),
            lecciones: [],
          }))
        );

        // ----- Lecciones por módulo -----
        const modsWithLessons: Mod[] = await Promise.all(
          modsRaw.map(async (m) => {
            const mid = num(getModuloId(m));
            let lecs: any[] = [];
            if (mid && !Number.isNaN(mid)) {
              const urls = [
                `${API_BASE}/modulos/${mid}/lecciones?_${Date.now()}`,
                `${API_BASE}/lecciones?modulo_id=${mid}&_${Date.now()}`,
              ];
              for (const u of urls) {
                try {
                  const tmp = parseList(await getJson(u));
                  if (tmp.length) {
                    lecs = tmp;
                    break;
                  }
                } catch {}
              }
              if (!lecs.length) {
                lecs = mockDB.lecciones.filter((l) => l.id_modulo === mid);
              }
            }
            lecs.sort((a, b) => {
              const oa = num((a as any).orden ?? 9999);
              const ob = num((b as any).orden ?? 9999);
              return oa - ob;
            });
            return {
              id: mid,
              titulo: getModuloTitulo(m),
              peso: getModuloPeso(m),
              lecciones: lecs,
            };
          })
        );

        if (cancel) return;

        setMods(modsWithLessons);

        // primera lección
        const firstMod = modsWithLessons.find((m) => m.lecciones?.length);
        const first = firstMod?.lecciones?.[0] ?? null;
        setActiveModuloId(firstMod?.id ?? null);
        setActiveLeccion(first || null);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Error cargando el curso");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [cursoId]);

  /* --------- Materiales y comentarios de la lección activa --------- */
  useEffect(() => {
    let cancel = false;

    (async () => {
      if (!activeLeccion) {
        setMateriales([]);
        setComments([]);
        return;
      }

      const lid = num(getLeccionId(activeLeccion));
      if (!lid || Number.isNaN(lid)) {
        setMateriales([]);
        setComments([]);
        return;
      }

      // Materiales
      try {
        let mats: any[] = [];
        try {
          mats = parseList(
            await getJson(
              `${API_BASE}/lecciones/${lid}/materiales?_${Date.now()}`
            )
          );
        } catch {}
        if (!mats.length) {
          const mid = num((activeLeccion as any).id_modulo);
          if (mid && !Number.isNaN(mid)) {
            try {
              mats = parseList(
                await getJson(
                  `${API_BASE}/materiales?modulo_id=${mid}&_${Date.now()}`
                )
              );
            } catch {
              mats = mockDB.materiales.filter((m) => m.id_modulo === mid);
            }
          }
        }
        if (!mats.length) {
          const mid = num((activeLeccion as any).id_modulo);
          if (mid && !Number.isNaN(mid)) {
            mats = mockDB.materiales.filter((m) => m.id_modulo === mid);
          }
        }
        if (!cancel) setMateriales(mats);
      } catch {
        setMateriales([]);
      }

      // Comentarios
      try {
        let cmt: any[] = [];
        try {
          cmt = parseList(
            await getJson(
              `${API_BASE}/lecciones/${lid}/comentarios?_${Date.now()}`
            )
          );
        } catch {}
        if (!cmt.length) {
          try {
            cmt = parseList(
              await getJson(
                `${API_BASE}/comentarios?leccion_id=${lid}&_${Date.now()}`
              )
            );
          } catch {
            cmt = mockDB.comentariosLeccion.filter((c) => c.id_leccion === lid);
          }
        }
        if (!cmt.length) {
          cmt = mockDB.comentariosLeccion.filter((c) => c.id_leccion === lid);
        }

        const map = new Map<any, Coment>();
        const roots: Coment[] = [];

        cmt.forEach((x) => {
          const item: Coment = {
            id: x?.id ?? x?.id_comentario,
            leccion_id: lid,
            texto: x?.texto ?? x?.comentario ?? x?.contenido ?? "",
            usuario: { nombre: x?.usuario?.nombre ?? x?.autor ?? "Usuario" },
            created_at: x?.created_at ?? x?.fecha_comentario ?? x?.fecha ?? "",
            parent_id: x?.parent_id ?? x?.comentario_padre_id ?? null,
            replies: [],
          };
          map.set(item.id, item);
        });

        map.forEach((v) => {
          if (v.parent_id && map.has(v.parent_id)) {
            map.get(v.parent_id)!.replies!.push(v);
          } else {
            roots.push(v);
          }
        });

        if (!cancel) setComments(roots);
      } catch {
        setComments([]);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [activeLeccion]);

  /* --------- Acciones --------- */
  const handlePlayLeccion = (l: any) => {
    setActiveLeccion(l);
    setActiveModuloId(num((l as any).id_modulo) || activeModuloId || null);
    setEvalVisible(false);
    setModoEval(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function sendComment(texto: string, parentId?: number | string | null) {
    if (!activeLeccion) return;
    const lid = num(getLeccionId(activeLeccion));
    if (!texto.trim()) return;

    const optimistic: Coment = {
      id: `tmp-${Date.now()}`,
      leccion_id: lid,
      texto,
      parent_id: parentId || null,
      created_at: new Date().toISOString(),
      usuario: { nombre: "Tú" },
      replies: [],
    };

    if (parentId) {
      setComments((prev) => {
        const clone = structuredClone(prev) as Coment[];
        const stack = [...clone];
        while (stack.length) {
          const n = stack.pop()!;
          if (String(n.id) === String(parentId)) {
            n.replies = n.replies || [];
            n.replies.push(optimistic);
            break;
          }
          (n.replies || []).forEach((r) => stack.push(r));
        }
        return clone;
      });
    } else {
      setComments((prev) => [optimistic, ...prev]);
    }

    setSending(true);
    try {
      let res = await postJson(`${API_BASE}/comentarios`, {
        leccion_id: lid,
        texto,
        parent_id: parentId || null,
      });
      if (!res.ok) {
        await postJson(`${API_BASE}/lecciones/${lid}/comentarios`, {
          texto,
          parent_id: parentId || null,
        });
      }
    } catch {}
    setSending(false);
  }

  function findNextLesson(current: any) {
    const mid = num((current as any).id_modulo);
    const lid = num(getLeccionId(current));
    const m = mods.find((x) => x.id === mid);
    if (m) {
      const idx = m.lecciones.findIndex((z) => num(getLeccionId(z)) === lid);
      if (idx >= 0 && idx + 1 < m.lecciones.length) {
        return { next: m.lecciones[idx + 1], nextModule: m };
      }
    }
    const order = mods;
    const mIndex = order.findIndex((x) => x.id === mid);
    for (let i = mIndex + 1; i < order.length; i++) {
      if (order[i].lecciones.length) {
        return { next: order[i].lecciones[0], nextModule: order[i] };
      }
    }
    return { next: null, nextModule: null };
  }

  async function marcarLeccionCompletada(l: any) {
    const lid = num(getLeccionId(l));
    if (!lid || Number.isNaN(lid)) return;
    try {
      const bodies = [
        { leccion_id: lid, estado: "completada" },
        { estado: "completada" },
      ];
      const urls = [
        `${API_BASE}/progreso/lecciones/${lid}`,
        `${API_BASE}/lecciones/${lid}/progreso`,
        `${API_BASE}/lecciones/${lid}/completar`,
      ];
      for (const b of bodies) {
        for (const u of urls) {
          const r = await postJson(u, b);
          if (r.ok) return;
        }
      }
    } catch {}
  }

  function goNextFrom(current: any) {
    const { next, nextModule } = findNextLesson(current);
    if (next) {
      setActiveLeccion(next);
      setActiveModuloId(nextModule?.id ?? activeModuloId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // si no hay siguiente lección, el flujo de evaluación (módulo/final)
    // se maneja desde el botón principal.
  }

  /* --------- Evaluación por MÓDULO --------- */
  async function cargarEvaluacionDelModulo(midParam?: number) {
    const mid = midParam ?? activeModuloId;
    if (!mid) return;

    try {
      const tries = [
        `${API_BASE}/modulos/${mid}/evaluaciones`,
        `${API_BASE}/evaluaciones?modulo_id=${mid}`,
      ];
      let evalData: any[] = [];
      for (const u of tries) {
        try {
          const arr = parseList(await getJson(u));
          if (arr.length) {
            evalData = arr;
            break;
          }
        } catch {}
      }

      if (evalData.length) {
        const item = evalData[0];
        const preguntas =
          parseList(item?.preguntas) && parseList(item?.preguntas).length
            ? parseList(item?.preguntas).map((p: any) => ({
                enunciado: p?.enunciado ?? p?.texto ?? "Pregunta",
                opciones:
                  p?.opciones ??
                  p?.alternativas ??
                  ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
                correcta: num(p?.correcta ?? p?.indice_correcta ?? 0) || 0,
                puntaje: num(p?.puntaje ?? 1) || 1,
              }))
            : samplePreguntasModulo(mid);

        const cfg: EvalConfig = {
          id: num(item?.id ?? item?.id_evaluacion ?? mid),
          titulo: item?.titulo ?? "Evaluación del módulo",
          puntajeMinimo:
            num(item?.puntaje_minimo ?? item?.aprobacion ?? 60) || 60,
          intentosMax: num(item?.intentos ?? item?.intentos_maximos ?? 3) || 3,
          preguntas,
        };
        setEvalCfg(cfg);
        setEvalRespuestas(new Array(preguntas.length).fill(-1));
        setEvalPuntaje(null);
        setEvalAprobado(null);
        return;
      }
    } catch {}

    // Fallback genérico
    const cfg: EvalConfig = {
      id: mid!,
      titulo: "Evaluación del módulo",
      puntajeMinimo: 60,
      intentosMax: 3,
      preguntas: samplePreguntasModulo(mid),
    };
    setEvalCfg(cfg);
    setEvalRespuestas(new Array(cfg.preguntas.length).fill(-1));
    setEvalPuntaje(null);
    setEvalAprobado(null);
  }

  /* --------- Evaluación FINAL del curso --------- */
  async function cargarEvaluacionFinal() {
    if (!curso) {
      const cfg: EvalConfig = {
        id: cursoId || 0,
        titulo: "Examen final del curso",
        puntajeMinimo: 70,
        intentosMax: 3,
        preguntas: samplePreguntasFinal(),
      };
      setEvalCfg(cfg);
      setEvalRespuestas(new Array(cfg.preguntas.length).fill(-1));
      setEvalPuntaje(null);
      setEvalAprobado(null);
      return;
    }

    const cid = num(getCursoId(curso));
    if (!cid || Number.isNaN(cid)) {
      const cfg: EvalConfig = {
        id: cursoId || 0,
        titulo: "Examen final del curso",
        puntajeMinimo: 70,
        intentosMax: 3,
        preguntas: samplePreguntasFinal(),
      };
      setEvalCfg(cfg);
      setEvalRespuestas(new Array(cfg.preguntas.length).fill(-1));
      setEvalPuntaje(null);
      setEvalAprobado(null);
      return;
    }

    try {
      const urls = [
        `${API_BASE}/cursos/${cid}/evaluacion-final`,
        `${API_BASE}/cursos/${cid}/evaluaciones?tipo=final`,
        `${API_BASE}/evaluaciones?curso_id=${cid}&tipo=final`,
      ];
      let evalData: any[] = [];
      for (const u of urls) {
        try {
          const arr = parseList(await getJson(u));
          if (arr.length) {
            evalData = arr;
            break;
          }
        } catch {}
      }

      if (evalData.length) {
        const item = evalData[0];
        const preguntas =
          parseList(item?.preguntas) && parseList(item?.preguntas).length
            ? parseList(item?.preguntas).map((p: any) => ({
                enunciado: p?.enunciado ?? p?.texto ?? "Pregunta",
                opciones:
                  p?.opciones ??
                  p?.alternativas ??
                  ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
                correcta: num(p?.correcta ?? p?.indice_correcta ?? 0) || 0,
                puntaje: num(p?.puntaje ?? 1) || 1,
              }))
            : samplePreguntasFinal();

        const cfg: EvalConfig = {
          id: num(item?.id ?? item?.id_evaluacion ?? cid),
          titulo: item?.titulo ?? "Examen final del curso",
          puntajeMinimo:
            num(item?.puntaje_minimo ?? item?.aprobacion ?? 70) || 70,
          intentosMax: num(item?.intentos ?? item?.intentos_maximos ?? 3) || 3,
          preguntas,
        };
        setEvalCfg(cfg);
        setEvalRespuestas(new Array(preguntas.length).fill(-1));
        setEvalPuntaje(null);
        setEvalAprobado(null);
        return;
      }
    } catch {}

    const cfg: EvalConfig = {
      id: cid,
      titulo: "Examen final del curso",
      puntajeMinimo: 70,
      intentosMax: 3,
      preguntas: samplePreguntasFinal(),
    };
    setEvalCfg(cfg);
    setEvalRespuestas(new Array(cfg.preguntas.length).fill(-1));
    setEvalPuntaje(null);
    setEvalAprobado(null);
  }

  /* --------- Preguntas de ejemplo (Módulo 1, Módulo 2 y Final) --------- */
  function samplePreguntasModulo(moduloId?: number): EvalPregunta[] {
    // MÓDULO 2: preguntas diferentes
    if (moduloId === 2) {
      return [
        {
          enunciado: "¿Qué comando se usa para crear un proyecto con Vite?",
          opciones: [
            "npm init vite@latest",
            "npm start vite",
            "npx create-react-app",
            "npm run vite-create",
          ],
          correcta: 0,
          puntaje: 1,
        },
        {
          enunciado:
            "¿Qué hook de React se utiliza para manejar estado en un componente funcional?",
          opciones: ["useRef", "useEffect", "useState", "useMemo"],
          correcta: 2,
          puntaje: 1,
        },
        {
          enunciado: "¿Qué propiedad se usa para pasar datos a un componente hijo?",
          opciones: ["state", "props", "context", "hooks"],
          correcta: 1,
          puntaje: 1,
        },
        {
          enunciado:
            "¿Cuál de estas opciones corresponde a una petición HTTP para actualizar datos?",
          opciones: ["GET", "PUT/PATCH", "HEAD", "OPTIONS"],
          correcta: 1,
          puntaje: 1,
        },
        {
          enunciado:
            "¿Qué ventaja tiene separar el frontend y el backend en una arquitectura fullstack?",
          opciones: [
            "Menor uso de memoria",
            "Mayor acoplamiento",
            "Escalabilidad y mantenimiento más sencillo",
            "No se puede trabajar en equipo",
          ],
          correcta: 2,
          puntaje: 1,
        },
      ];
    }

    // MÓDULO 1 (y otros): preguntas base
    return [
      {
        enunciado: "¿Qué es una variable?",
        opciones: [
          "Un valor fijo",
          "Un contenedor de datos que puede cambiar",
          "Un tipo de bucle",
          "Una librería",
        ],
        correcta: 1,
        puntaje: 1,
      },
      {
        enunciado: "¿Qué etiqueta embebe videos de YouTube?",
        opciones: ["<video>", "<iframe>", "<embed>", "<media>"],
        correcta: 1,
        puntaje: 1,
      },
      {
        enunciado: "¿Cuál es la extensión de un archivo TypeScript?",
        opciones: [".js", ".jsx", ".ts", ".tsx"],
        correcta: 2,
        puntaje: 1,
      },
      {
        enunciado: "¿Qué método hace una petición HTTP con cuerpo?",
        opciones: ["GET", "HEAD", "PUT/POST", "TRACE"],
        correcta: 2,
        puntaje: 1,
      },
      {
        enunciado: "¿Dónde se almacenan típicamente los tokens?",
        opciones: [
          "En variables locales de función",
          "En el CSS",
          "En localStorage/secure storage",
          "No se almacenan",
        ],
        correcta: 2,
        puntaje: 1,
      },
    ];
  }

  function samplePreguntasFinal(): EvalPregunta[] {
    return [
      {
        enunciado:
          "¿Qué describe mejor el objetivo de un curso fullstack como MIS Academy?",
        opciones: [
          "Solo front-end",
          "Solo bases de datos",
          "Dominar front-end y back-end para construir aplicaciones completas",
          "Solo teoría sin práctica",
        ],
        correcta: 2,
        puntaje: 1,
      },
      {
        enunciado:
          "Para consumir un API segura desde el frontend, ¿qué es una buena práctica?",
        opciones: [
          "Enviar el token dentro del HTML",
          "Usar HTTPS y enviar el token en el encabezado Authorization",
          "Guardar el token en un archivo .txt",
          "No usar tokens",
        ],
        correcta: 1,
        puntaje: 1,
      },
      {
        enunciado:
          "¿Qué ventaja ofrece dividir el curso en módulos y lecciones pequeñas?",
        opciones: [
          "Hace el curso más confuso",
          "No aporta nada",
          "Facilita el avance progresivo y el seguimiento del progreso",
          "Impide evaluar al estudiante",
        ],
        correcta: 2,
        puntaje: 1,
      },
      {
        enunciado:
          "En una API REST, ¿qué código de estado indica que una petición fue exitosa?",
        opciones: ["200", "301", "404", "500"],
        correcta: 0,
        puntaje: 1,
      },
      {
        enunciado:
          "¿Cuál es el beneficio principal de emitir un certificado al finalizar el curso?",
        opciones: [
          "Aumentar el tamaño del proyecto",
          "No tiene ningún beneficio",
          "Demostrar formalmente las competencias adquiridas",
          "Evitar que el estudiante siga aprendiendo",
        ],
        correcta: 2,
        puntaje: 1,
      },
    ];
  }

  function calificar() {
    if (!evalCfg) return;
    let total = 0;
    let ok = 0;
    evalCfg.preguntas.forEach((p, i) => {
      total += p.puntaje;
      if (evalRespuestas[i] === p.correcta) ok += p.puntaje;
    });
    const pct = Math.round((ok / total) * 100);
    setEvalPuntaje(pct);
    const aprobado = pct >= evalCfg.puntajeMinimo;
    setEvalAprobado(aprobado);
    setEvalIntentos((x) => x + 1);

    // marcar módulo aprobado cuando sea evaluación de módulo
    if (modoEval === "modulo" && aprobado && moduloEvaluadoId) {
      setModulosAprobados((prev) => ({
        ...prev,
        [moduloEvaluadoId]: true,
      }));
    }

    reportarResultadoEvaluacion(pct, aprobado).catch(() => {});
  }

  async function reportarResultadoEvaluacion(
    porcentaje: number,
    aprobado: boolean
  ) {
    const mid = activeModuloId;
    if (!mid) return;
    const payload = { modulo_id: mid, resultado: porcentaje, aprobado };
    const urls = [
      `${API_BASE}/evaluaciones/resultados`,
      `${API_BASE}/modulos/${mid}/resultado`,
    ];
    for (const u of urls) {
      try {
        const r = await postJson(u, payload);
        if (r.ok) break;
      } catch {}
    }
  }

  async function emitirCertificadoYIr() {
    if (!curso) return;
    const uidRaw =
      (typeof window !== "undefined" && localStorage.getItem("user_id")) || "";
    const usuario_id = num(uidRaw) || undefined;

    setGenerandoCert(true);
    const body = {
      id_curso: num(getCursoId(curso)),
      id_usuario: usuario_id,
      codigo_certificado: `MISA-${Date.now()}`,
      calificacion_final: evalPuntaje ?? 0,
    };

    const urls = [
      `${API_BASE}/admin/certificaciones`,
      `${API_BASE}/certificaciones`,
      `${API_BASE}/certificados`,
      `${API_BASE}/certificados/enviar`,
    ];
    let ok = false;
    for (const u of urls) {
      try {
        const r = await postJson(u, body);
        if (r.ok) {
          ok = true;
          break;
        }
      } catch {}
    }
    setGenerandoCert(false);
    navigate("/certificado");
    if (!ok) console.warn("No se pudo confirmar la emisión del certificado.");
  }

  /* --------- Video embebido --------- */
  const { videoSrc, isDemo } = useMemo(() => {
    const url = getLeccionUrl(activeLeccion);
    if (!url) return { videoSrc: DEFAULT_DEMO_VIDEO, isDemo: true };
    let out = url;
    try {
      if (url.includes("youtube.com/watch")) {
        const vid = new URL(url).searchParams.get("v");
        if (vid) out = `https://www.youtube.com/embed/${vid}`;
      } else if (url.includes("youtu.be/")) {
        const id = url.split("/").pop();
        if (id) out = `https://www.youtube.com/embed/${id}`;
      }
    } catch {}
    return { videoSrc: out, isDemo: false };
  }, [activeLeccion]);

  /* --------- UI --------- */
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="relative w-12 h-12">
        <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
        <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
      </div>
    </div>
  );
  if (loading && !curso) {
    return <div className="cp-loading">{LoadingSpinner()}</div>;
  }

  if (error || !curso) {
    return (
      <div className="cp-container">
        <div className="cp-error">
          {error || "No se encontró el curso."}
          <div className="cp-back">
            <button onClick={() => navigate(-1)}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  const tituloCurso = getCursoNombre(curso);
  const activeTitle = activeLeccion
    ? getLeccionTitulo(activeLeccion)
    : "Selecciona una lección";

  const moduloActual = mods.find((m) => m.id === activeModuloId) || null;
  const esUltimaLeccionDelModulo = (() => {
    if (!activeLeccion || !moduloActual) return false;
    const lid = num(getLeccionId(activeLeccion));
    const idx = moduloActual.lecciones.findIndex(
      (l) => num(getLeccionId(l)) === lid
    );
    return idx >= 0 && idx === moduloActual.lecciones.length - 1;
  })();

  return (
    <div className="cp-container">
      {/* Encabezado */}
      <div className="cp-header">
        <div className="cp-breadcrumbs">
          <Link to="/compras">Mis cursos</Link>
          <span>›</span>
          <span className="muted">{tituloCurso}</span>
        </div>
        <h1 className="cp-title">{tituloCurso}</h1>
        {/* Botón de evaluación final persistente */}
        {examenDesbloqueado && (
          <button
            className="cp-btn cp-btn-final"
            style={{marginTop: 16, background: '#2563eb', color: '#fff', fontWeight: 600}}
            onClick={() => navigate(`/evaluation/${cursoId}`)}
          >
            🎓 Ir a Evaluación Final
          </button>
        )}
      </div>

      <div className="cp-grid">
        {/* Columna izquierda */}
        <div className="cp-left">
          <div className="cp-player-card">
            <div className="cp-video">
              {isDemo && <span className="cp-demo-pill">Video de ejemplo</span>}
              <iframe
                src={videoSrc}
                title={activeTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="cp-video-info">
              <h2 className="cp-lesson-title">{activeTitle}</h2>

              <div className="cp-actions">
                <button
                  className="cp-btn"
                  onClick={async () => {
                    if (!activeLeccion) return;
                    await marcarLeccionCompletada(activeLeccion);

                    const mid = num((activeLeccion as any).id_modulo);
                    const esUltima = esUltimaLeccionDelModulo;

                    if (esUltima && mid && !Number.isNaN(mid)) {
                      const moduloIndex = mods.findIndex((m) => m.id === mid);
                      let esUltimoModulo = false;
                      if (mods.length > 0 && moduloIndex !== -1) {
                        const indicesConLecciones = mods
                          .map((m, idx) =>
                            m.lecciones && m.lecciones.length > 0 ? idx : -1
                          )
                          .filter((idx) => idx !== -1);
                        const lastIndex =
                          indicesConLecciones[
                            indicesConLecciones.length - 1
                          ];
                        esUltimoModulo = lastIndex === moduloIndex;
                      }

                      // Si aún no se ha aprobado este módulo, mostrar evaluación de módulo
                      if (!modulosAprobados[mid]) {
                        setModoEval("modulo");
                        setModuloEvaluadoId(mid);
                        setEvalVisible(true);
                        await cargarEvaluacionDelModulo(mid);
                        return;
                      }

                      // Si ya está aprobado y además es el último módulo, ir al examen final
                      if (esUltimoModulo) {
                        setModoEval("final");
                        setModuloEvaluadoId(null);
                        setEvalVisible(true);
                        await cargarEvaluacionFinal();
                        return;
                      }
                    }

                    // Caso por defecto: ir a la siguiente lección/módulo
                    goNextFrom(activeLeccion);
                  }}
                >
                  {esUltimaLeccionDelModulo ? "Finalizar módulo" : "Siguiente lección"}
                </button>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div className="cp-comments">
            <h3>Comentarios y consultas</h3>
            <div className="cp-comment-new">
              <textarea
                placeholder="Deja una duda o comentario…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                disabled={!newComment.trim() || sending}
                onClick={() => {
                  const t = newComment;
                  setNewComment("");
                  sendComment(t);
                }}
              >
                {sending ? "Enviando…" : "Publicar"}
              </button>
            </div>

            <div className="cp-comment-list">
              {comments.length === 0 && (
                <div className="muted">Sé el primero en comentar.</div>
              )}
              {comments.map((c) => (
                <CommentItem
                  key={String(c.id)}
                  c={c}
                  onReply={(txt) => sendComment(txt, c.id)}
                />
              ))}
            </div>
          </div>

          {/* Evaluación (módulo o final) */}
          {evalVisible && (
            <div className="cp-eval">
              <h3>
                {modoEval === "final"
                  ? evalCfg?.titulo || "Examen final del curso"
                  : evalCfg?.titulo || "Evaluación del módulo"}
              </h3>

              {!evalCfg && <div className="muted">Cargando evaluación…</div>}

              {evalCfg && evalAprobado === null && (
                <form
                  className="cp-eval-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    calificar();
                  }}
                >
                  <p className="muted">
                    Puntaje mínimo para aprobar:{" "}
                    <b>{evalCfg.puntajeMinimo}%</b>
                  </p>
                  {evalCfg.preguntas.map((p, i) => (
                    <fieldset key={i} className="cp-q">
                      <legend>
                        {i + 1}. {p.enunciado}
                      </legend>
                      {p.opciones.map((op, j) => (
                        <label key={j} className="cp-option">
                          <input
                            type="radio"
                            name={`q${i}`}
                            checked={evalRespuestas[i] === j}
                            onChange={() => {
                              const next = [...evalRespuestas];
                              next[i] = j;
                              setEvalRespuestas(next);
                            }}
                          />
                          <span>{op}</span>
                        </label>
                      ))}
                    </fieldset>
                  ))}

                  <div className="cp-actions">
                    <button className="cp-btn" type="submit">
                      Enviar evaluación
                    </button>
                  </div>
                </form>
              )}

              {evalCfg && evalAprobado !== null && (
                <div className="cp-eval-result">
                  <p>
                    Tu puntaje: <b>{evalPuntaje}%</b>{" "}
                    {evalAprobado ? "✅ Aprobado" : "❌ No aprobado"}
                  </p>

                  {evalAprobado ? (
                    modoEval === "final" ? (
                      <div className="cp-actions">
                        <button
                          className="cp-btn"
                          disabled={generandoCert}
                          onClick={emitirCertificadoYIr}
                        >
                          {generandoCert ? "Generando…" : "Ver certificado"}
                        </button>
                      </div>
                    ) : (
                      <div className="cp-actions">
                        <button
                          className="cp-btn"
                          onClick={() => {
                            const fakeCurrent =
                              moduloActual?.lecciones[
                                moduloActual.lecciones.length - 1
                              ] || activeLeccion;
                            const { next } = findNextLesson(fakeCurrent);
                            if (next) {
                              // Pasar al siguiente módulo / lección
                              setEvalVisible(false);
                              setEvalCfg(null);
                              setModoEval(null);
                              setEvalRespuestas([]);
                              setEvalPuntaje(null);
                              setEvalAprobado(null);
                              setEvalIntentos(0);
                              setActiveLeccion(next);
                              setActiveModuloId(
                                num((next as any).id_modulo) || null
                              );
                              window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            } else {
                              // No hay más lecciones -> ir a examen final
                              setEvalVisible(true);
                              setModoEval("final");
                              setModuloEvaluadoId(null);
                              setEvalRespuestas([]);
                              setEvalPuntaje(null);
                              setEvalAprobado(null);
                              setEvalIntentos(0);
                              cargarEvaluacionFinal();
                            }
                          }}
                        >
                          Continuar
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="cp-actions">
                      <button
                        className="cp-btn"
                        onClick={() => {
                          if (
                            evalCfg?.intentosMax &&
                            evalIntentos >= evalCfg.intentosMax
                          ) {
                            alert(
                              "Has agotado los intentos permitidos para esta evaluación."
                            );
                            return;
                          }
                          setEvalRespuestas(
                            new Array(evalCfg!.preguntas.length).fill(-1)
                          );
                          setEvalPuntaje(null);
                          setEvalAprobado(null);
                        }}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="cp-right">
          <div className="cp-tabs">
            <button className="cp-tab cp-tab-active">Módulos</button>
          </div>

          <div className="cp-mods">
            {mods.length === 0 && (
              <div className="muted">Aún no hay módulos.</div>
            )}
            {mods.map((m, i) => (
              <details
                key={m.id || i}
                open={m.id === activeModuloId || (!activeModuloId && i === 0)}
                className="cp-accordion"
                onToggle={(ev) => {
                  const open = (ev.target as HTMLDetailsElement).open;
                  if (open) setActiveModuloId(m.id);
                }}
              >
                <summary>
                  <span className="dot" /> {getModuloTitulo({ titulo: m.titulo })}
                  {m.peso ? (
                    <span className="muted"> · peso {m.peso}</span>
                  ) : null}
                </summary>
                <ul className="cp-lessons">
                  {m.lecciones?.length === 0 && (
                    <li className="cp-lesson cp-lesson-empty">
                      <span className="bullet" />
                      <span className="name muted">
                        Aún no hay lecciones en este módulo.
                      </span>
                    </li>
                  )}
                  {m.lecciones?.map((l) => {
                    const isActive =
                      getLeccionId(l) === getLeccionId(activeLeccion);
                    return (
                      <li
                        key={getLeccionId(l)}
                        className={`cp-lesson ${isActive ? "active" : ""}`}
                        onClick={() => handlePlayLeccion(l)}
                      >
                        <span className="bullet" />
                        <span className="name">{getLeccionTitulo(l)}</span>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>

          <div className="cp-materials">
            <h4>Materiales disponibles</h4>
            {materiales.length === 0 && (
              <div className="muted">No hay materiales aún.</div>
            )}
            <ul>
              {materiales.map((m, idx) => (
                <li key={idx}>
                  <span className="file-ico">📄</span>
                  <a href={getMaterialUrl(m)} target="_blank" rel="noreferrer">
                    {getMaterialNombre(m)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Comentario (con respuesta)
========================= */
const CommentItem: React.FC<{ c: Coment; onReply: (txt: string) => void }> = ({
  c,
  onReply,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [txt, setTxt] = useState("");

  return (
    <div className="cp-com-item">
      <div className="cp-com-avatar">
        {c.usuario?.nombre?.[0]?.toUpperCase() || "U"}
      </div>
      <div className="cp-com-body">
        <div className="cp-com-meta">
          <span className="name">{c.usuario?.nombre || "Usuario"}</span>
          {c.created_at && (
            <span className="time">
              • {new Date(c.created_at).toLocaleString()}
            </span>
          )}
        </div>
        <div className="cp-com-text">{c.texto}</div>
        <div className="cp-com-actions">
          <button className="link" onClick={() => setShowReply((s) => !s)}>
            Responder
          </button>
        </div>

        {showReply && (
          <div className="cp-reply-box">
            <textarea
              value={txt}
              onChange={(e) => setTxt(e.target.value)}
              placeholder="Escribe una respuesta…"
            />
            <div className="cp-reply-actions">
              <button
                className="secondary"
                onClick={() => {
                  setShowReply(false);
                  setTxt("");
                }}
              >
                Cancelar
              </button>
              <button
                disabled={!txt.trim()}
                onClick={() => {
                  const t = txt;
                  setTxt("");
                  setShowReply(false);
                  onReply(t);
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        )}

        {(c.replies || []).length > 0 && (
          <div className="cp-replies">
            {c.replies!.map((r) => (
              <div key={String(r.id)} className="cp-com-item reply">
                <div className="cp-com-avatar">
                  {r.usuario?.nombre?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="cp-com-body">
                  <div className="cp-com-meta">
                    <span className="name">{r.usuario?.nombre || "Usuario"}</span>
                    {r.created_at && (
                      <span className="time">
                        • {new Date(r.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="cp-com-text">{r.texto}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
