// src/curso-player/VideoPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import mockDB from "../data/mockDatabase";
import { API_URL } from "../config/api";
import { apiClient } from "../services/apiClient";
import { FaSearch, FaTimes, FaExternalLinkAlt, FaAward, FaBookOpen } from "react-icons/fa";

const API_BASE = API_URL;

// Utilidades seguras
function num(v: any): number {
  if (v == null || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

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

async function getJson(url: string) {
  const relativeUrl = url.replace(API_BASE, "");
  const r = await apiClient.get(relativeUrl);
  return r.data;
}

const getCursoId = (o: any) => pick<number>(o, ["id_curso", "curso_id", "id"]);
const getCursoNombre = (o: any) => pick<string>(o, ["nombre", "titulo"], "Curso");

const getModuloId = (o: any) => pick<number>(o, ["id_modulo", "modulo_id", "id"]);
const getModuloTitulo = (o: any) => pick<string>(o, ["titulo", "nombre"], "Módulo");
const getModuloPeso = (o: any) => num(pick<any>(o, ["peso_progreso", "peso", "weight"], 0)) || 0;

const getLeccionId = (o: any) => pick<number>(o, ["id_leccion", "leccion_id", "id"]);
const getLeccionTitulo = (o: any) => pick<string>(o, ["titulo", "nombre"], "Lección");
const getLeccionUrl = (o: any) => pick<string>(o, ["url_video", "video_url", "url"]);

const getMaterialNombre = (o: any) => pick<string>(o, ["nombre", "titulo"], "Material");
const getMaterialUrl = (o: any) => {
  const path = pick<string>(o, ["url_archivo", "url", "archivo"], "");
  if (!path || path.startsWith("http")) return path || "#";
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${API_BASE}/${cleanPath}`;
};

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

// Mapper de Accent color dinámico
const getAccentTheme = (lineaNombre: string) => {
  const n = (lineaNombre || "").toLowerCase();
  if (n.includes("ia") || n.includes("inteligencia"))
    return {
      text: "text-purple-400",
      barBg: "bg-purple-500",
      badgeBg: "bg-purple-500/10 border-purple-500/20",
      btnGradient: "from-purple-600 to-indigo-500",
      btnShadowRgba: "rgba(168,85,247,0.3)",
      textGrad: "from-purple-400 via-white to-purple-600",
      glow1: "bg-purple-500/15",
      glow2: "bg-indigo-600/10",
      chevronBg: "group-hover:bg-purple-500/10",
      hoverBorder: "hover:border-purple-500/30",
      hoverTitle: "group-hover:text-purple-400",
      tabActiveUnderline: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]",
      avatarBg: "from-purple-500/20 to-indigo-500/20 text-purple-400",
    };
  if (n.includes("teacher") || n.includes("docente") || n.includes("educa"))
    return {
      text: "text-emerald-400",
      barBg: "bg-emerald-500",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20",
      btnGradient: "from-emerald-500 to-teal-400",
      btnShadowRgba: "rgba(16,185,129,0.3)",
      textGrad: "from-emerald-400 via-white to-emerald-600",
      glow1: "bg-emerald-500/15",
      glow2: "bg-teal-600/10",
      chevronBg: "group-hover:bg-emerald-500/10",
      hoverBorder: "hover:border-emerald-500/30",
      hoverTitle: "group-hover:text-emerald-400",
      tabActiveUnderline: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
      avatarBg: "from-emerald-500/20 to-teal-500/20 text-emerald-400",
    };
  if (n.includes("business") || n.includes("negocio") || n.includes("empresa"))
    return {
      text: "text-amber-400",
      barBg: "bg-amber-500",
      badgeBg: "bg-amber-500/10 border-amber-500/20",
      btnGradient: "from-amber-500 to-orange-400",
      btnShadowRgba: "rgba(245,158,11,0.3)",
      textGrad: "from-amber-400 via-white to-amber-600",
      glow1: "bg-amber-500/15",
      glow2: "bg-orange-600/10",
      chevronBg: "group-hover:bg-amber-500/10",
      hoverBorder: "hover:border-amber-500/30",
      hoverTitle: "group-hover:text-amber-400",
      tabActiveUnderline: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
      avatarBg: "from-amber-500/20 to-orange-500/20 text-amber-400",
    };
  // Default = DEV
  return {
    text: "text-sky-400",
    barBg: "bg-sky-500",
    badgeBg: "bg-sky-500/10 border-sky-500/20",
    btnGradient: "from-sky-600 to-blue-500",
    btnShadowRgba: "rgba(14,165,233,0.3)",
    textGrad: "from-sky-400 via-white to-sky-600",
    glow1: "bg-sky-500/15",
    glow2: "bg-blue-600/10",
    chevronBg: "group-hover:bg-sky-500/10",
    hoverBorder: "hover:border-sky-500/30",
    hoverTitle: "group-hover:text-sky-400",
    tabActiveUnderline: "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]",
    avatarBg: "from-sky-500/20 to-blue-500/20 text-sky-400",
  };
};

const CommentItem = ({ c, onReply, accent }: { c: Coment; onReply: (txt: string) => void; accent: any }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyTxt, setReplyTxt] = useState("");

  return (
    <div className="group/com relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-sm font-black bg-gradient-to-br ${accent.avatarBg}`}>
          {c.usuario?.nombre?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
              {c.usuario?.nombre || "Estudiante"}
            </span>
            <span className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">
              {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Reciente"}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-4">{c.texto}</p>

          <button
            onClick={() => setShowReply(!showReply)}
            className={`text-[9px] font-black uppercase tracking-widest ${accent.text} hover:text-white transition-colors flex items-center gap-2`}
          >
            <span>↩ Responder</span>
          </button>

          {showReply && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
              <textarea
                className={`w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:border-white/30 outline-none transition-all resize-none`}
                placeholder="Escribe tu respuesta..."
                value={replyTxt}
                rows={2}
                onChange={(e) => setReplyTxt(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReply(false)}
                  className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (replyTxt.trim()) {
                      onReply(replyTxt);
                      setReplyTxt("");
                      setShowReply(false);
                    }
                  }}
                  className="px-6 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoPage: React.FC = () => {
  const params = useParams();
  const cursoIdSlug = params.slug;
  const navigate = useNavigate();
  const cursoId = cursoIdSlug;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [curso, setCurso] = useState<any | null>(null);
  const [mods, setMods] = useState<Mod[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [examenDesbloqueado, setExamenDesbloqueado] = useState(false);
  const [evaluationStatus, setEvaluationStatus] = useState<any>(null);
  const [lineaNombre, setLineaNombre] = useState<string>("");

  const [activeLeccion, setActiveLeccion] = useState<any | null>(null);
  const [activeModuloId, setActiveModuloId] = useState<number | null>(null);

  const [comments, setComments] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "recursos" | "comentarios">("info");

  const checkEligibility = async () => {
    if (!cursoId || cursoId === "undefined" || cursoId === "NaN") return;
    try {
      const res = await apiClient.get(`/courses/${cursoId}/evaluation/check-eligibility`);
      const data = res.data;
      setEvaluationStatus(data);

      const hasPassed =
        data.hasPassed ||
        (data.lastAttempt && data.lastAttempt.porcentaje >= (data.configuration?.passingPercentage || 60));

      if (hasPassed) {
        setExamenDesbloqueado(true);
      } else if (data.eligible) {
        setExamenDesbloqueado(true);
      } else {
        setExamenDesbloqueado(false);
      }
    } catch (error) {
      console.error("Error verificando elegibilidad:", error);
    }
  };

  useEffect(() => {
    let cancel = false;

    (async () => {
      if (!cursoId) return;

      if (cursoId === "undefined" || cursoId === "NaN" || (Number.isNaN(Number(cursoId)) && cursoId.length < 3)) {
        setError("Curso no válido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let jc: any = null;
        try {
          jc = await getJson(`${API_BASE}/cursos/slug/${cursoIdSlug}?_${Date.now()}`);
        } catch {
          try {
            jc = await getJson(`${API_BASE}/cursos/${cursoIdSlug}?_${Date.now()}`);
          } catch {
            jc = mockDB.cursos.find((c) => c.id_curso === Number(cursoIdSlug)) || null;
          }
        }
        if (!jc || Object.keys(jc).length === 0) {
          try {
            const list = parseList(await getJson(`${API_BASE}/cursos?_${Date.now()}`));
            jc = list.find((c) => num(getCursoId(c)) === num(cursoId)) || jc;
          } catch {}
        }
        if (cancel) return;
        setCurso(jc);
        const actualId = num(getCursoId(jc));

        if (!actualId || Number.isNaN(actualId)) {
          if (!cancel) setLoading(false);
          return;
        }

        // Buscar línea académica
        try {
          const resRutas = await apiClient.get("/rutas-academicas");
          const rutasRaw = resRutas.data?.data || resRutas.data || [];
          const matchingRuta = rutasRaw.find((ruta: any) => {
            const listCursos = ruta.cursos || [];
            return listCursos.some((c: any) => Number(c.id_curso || c.id || c) === actualId);
          });
          const rName =
            matchingRuta?.linea_academica?.nombre ||
            matchingRuta?.lineaAcademica?.nombre;
          if (rName) setLineaNombre(rName);
        } catch {}

        try {
          const progresoResp = await getJson(`${API_BASE}/cursos/${actualId}/progreso`);
          if (progresoResp && typeof progresoResp.examen_desbloqueado !== "undefined") {
            setExamenDesbloqueado(!!progresoResp.examen_desbloqueado);
          }
        } catch {}

        let modsWithLessons: Mod[] = [];
        try {
          const resp = await getJson(`${API_BASE}/cursos/${actualId}/contenido?_${Date.now()}`);
          const content = parseList(resp);

          modsWithLessons = content.map((m: any) => {
            const rawLecciones = m.lecciones || m.lessons || m.items || [];
            return {
              id: num(getModuloId(m)),
              titulo: getModuloTitulo(m),
              peso: getModuloPeso(m),
              lecciones: parseList(rawLecciones).sort((a, b) => num(a.orden) - num(b.orden)),
            };
          });
        } catch (e) {
          console.error("Error cargando contenido detallado:", e);
          const resp = await getJson(`${API_BASE}/modulos/curso/${actualId}?_${Date.now()}`);
          const modsRaw = parseList(resp);
          modsWithLessons = modsRaw.map((m) => ({
            id: num(getModuloId(m)),
            titulo: getModuloTitulo(m),
            peso: getModuloPeso(m),
            lecciones: [],
          }));
        }

        if (cancel) return;
        setMods(modsWithLessons);

        const params = new URLSearchParams(window.location.search);
        const targetLeccionId = num(params.get("leccion"));

        let initialLeccion = null;
        let initialModuloId = null;

        if (targetLeccionId) {
          for (const m of modsWithLessons) {
            const found = m.lecciones.find((l) => num(getLeccionId(l)) === targetLeccionId);
            if (found) {
              initialLeccion = found;
              initialModuloId = m.id;
              break;
            }
          }
        }

        if (!initialLeccion) {
          const firstMod = modsWithLessons.find((m) => m.lecciones?.length);
          initialLeccion = firstMod?.lecciones?.[0] ?? null;
          initialModuloId = firstMod?.id ?? null;
        }

        setActiveModuloId(initialModuloId);
        setActiveLeccion(initialLeccion);
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

  useEffect(() => {
    if (cursoId && mods.length > 0) {
      checkEligibility();
    }
  }, [cursoId, mods.length]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const cid = num(getCursoId(curso));
      if (!cid || Number.isNaN(cid)) {
        setMateriales([]);
        return;
      }
      try {
        const mats = parseList(await getJson(`${API_BASE}/materiales?id_curso=${cid}&_${Date.now()}`));
        if (!cancel) setMateriales(mats);
      } catch (err) {
        console.warn("Fallo al cargar materiales:", err);
        if (!cancel) setMateriales([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [curso]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!activeLeccion) {
        setComments([]);
        return;
      }
      const lid = num(getLeccionId(activeLeccion));
      if (!lid || Number.isNaN(lid)) {
        setComments([]);
        return;
      }
      try {
        let cmt: any[] = [];
        try {
          cmt = parseList(await getJson(`${API_BASE}/lecciones/${lid}/comentarios?_${Date.now()}`));
        } catch (err) {
          console.warn("Fallo al cargar comentarios desde lecciones:", err);
          cmt = mockDB.comentariosLeccion.filter((c) => c.id_leccion === lid);
        }
        if (cancel) return;

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
        if (!cancel) setComments([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [activeLeccion]);

  const handlePlayLeccion = (l: any) => {
    setActiveLeccion(l);
    setActiveModuloId(num((l as any).id_modulo) || activeModuloId || null);
  };

  async function sendComment(texto: string, parentId?: number | string) {
    if (!activeLeccion) return;
    const lid = num(getLeccionId(activeLeccion));
    setSending(true);
    try {
      await apiClient.post(`/lecciones/${lid}/comentarios`, { contenido: texto });
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
      await apiClient.post(`/lecciones/${lid}/completar`, { porcentaje_completado: 100 });
      setMods((prevMods) =>
        prevMods.map((m) => ({
          ...m,
          lecciones: m.lecciones.map((lec) => {
            if (num(getLeccionId(lec)) === lid) {
              return { ...lec, progreso: { estado: "Completado", porcentaje: 100 } };
            }
            return lec;
          }),
        }))
      );
      checkEligibility();
    } catch (error) {
      console.error("Error al completar lección:", error);
    }
  }

  function goNextFrom(current: any) {
    marcarLeccionCompletada(current).catch(console.error);
    const { next, nextModule } = findNextLesson(current);
    if (next) {
      setActiveLeccion(next);
      setActiveModuloId(nextModule?.id ?? activeModuloId);
    }
  }

  const { videoSrc } = useMemo(() => {
    const url = getLeccionUrl(activeLeccion);
    if (!url) return { videoSrc: null };
    let out = url;
    try {
      if (url.includes("youtube.com/watch")) {
        const vid = new URL(url).searchParams.get("v");
        if (vid) out = `https://www.youtube.com/embed/${vid}?enablejsapi=1&origin=${window.location.origin}`;
      } else if (url.includes("youtu.be/")) {
        const id = url.split("/").pop();
        if (id) out = `https://www.youtube.com/embed/${id}?enablejsapi=1&origin=${window.location.origin}`;
      }
    } catch {}
    return { videoSrc: out };
  }, [activeLeccion]);

  useEffect(() => {
    const handleYoutubeMessage = async (event: MessageEvent) => {
      if (!event.origin.includes("youtube.com")) return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === "onStateChange" && data.info === 0) {
          if (activeLeccion) {
            goNextFrom(activeLeccion);
          }
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleYoutubeMessage);
    return () => window.removeEventListener("message", handleYoutubeMessage);
  }, [activeLeccion]);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen bg-[#020609]">
      <div className="relative w-12 h-12">
        <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
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
  const activeTitle = activeLeccion ? getLeccionTitulo(activeLeccion) : "Selecciona una lección";
  const moduloActual = mods.find((m) => m.id === activeModuloId) || null;
  const esUltimaLeccionDelModulo = (() => {
    if (!activeLeccion || !moduloActual) return false;
    const lid = num(getLeccionId(activeLeccion));
    const idx = moduloActual.lecciones.findIndex((l) => num(getLeccionId(l)) === lid);
    return idx >= 0 && idx === moduloActual.lecciones.length - 1;
  })();

  const accent = getAccentTheme(lineaNombre);

  return (
    <div className="min-h-screen text-white px-4 md:px-12 py-12 bg-[#03070C] relative overflow-hidden">
      {/* Glows de fondo */}
      <div className={`absolute top-0 left-[-5%] w-[450px] h-[450px] ${accent.glow1} blur-[140px] rounded-full pointer-events-none -z-0`} />
      <div className={`absolute bottom-[20%] right-[-5%] w-[450px] h-[450px] ${accent.glow2} blur-[140px] rounded-full pointer-events-none -z-0`} />

      {/* Encabezado */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-2xl ${accent.badgeBg} border text-[10px] font-black uppercase tracking-[0.2em] ${accent.text} backdrop-blur-xl`}>
            <Link to="/compras" className="hover:text-white transition-colors">
              Mis cursos
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white/60">{tituloCurso}</span>
          </div>
          <h1 className="text-sm font-black uppercase tracking-[0.1em] text-slate-400">
            Curso: <span className="text-white font-['Outfit']">{tituloCurso}</span>
          </h1>
        </div>
      </div>

      {/* Examen final elegibilidad */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        {examenDesbloqueado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group cursor-pointer"
            onClick={() => navigate(`/evaluation/${cursoId}`)}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 via-teal-500/20 to-emerald-500/50 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-8 rounded-[2rem] bg-[#0a1219]/80 border border-emerald-500/20 backdrop-blur-3xl overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl shadow-inner">
                  🎓
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white uppercase mb-1">
                    {evaluationStatus?.hasPassed ? "Certificación Obtenida" : "Examen Final Disponible"}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.2em]">
                    {evaluationStatus?.hasPassed
                      ? "Has aprobado con éxito este curso"
                      : "Has completado el contenido. ¡Es hora de validar tus conocimientos!"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {evaluationStatus?.configuration?.remainingAttempts !== undefined && !evaluationStatus?.hasPassed && (
                  <div className="hidden md:block text-right">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">
                      Intentos Disponibles
                    </p>
                    <p className="text-sm font-black text-white">{evaluationStatus.configuration.remainingAttempts}</p>
                  </div>
                )}
                <button className="px-8 py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                  {evaluationStatus?.hasPassed ? "Ver Resultados" : "Comenzar Ahora"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Columna principal: Video + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header lección activo y Botón "Siguiente Clase" arriba en el player */}
          <div className="flex items-center justify-between gap-4 px-2 py-1">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${accent.badgeBg} flex items-center justify-center text-sm`}>
                <FaBookOpen className={accent.text} size={14} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                {moduloActual?.titulo.split(" — ")[0] || "Módulo 1"}
              </span>
            </div>
            {activeLeccion && (
              <button
                className="group/btn2 relative px-5 py-2.5 rounded-xl overflow-hidden transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 border border-white/5"
                style={{ boxShadow: `0 10px 20px -8px ${accent.btnShadowRgba}` }}
                onClick={() => goNextFrom(activeLeccion)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${accent.btnGradient} transition-transform group-hover/btn2:scale-105`} />
                <span className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-white">
                  {esUltimaLeccionDelModulo ? "Siguiente Módulo" : "Siguiente Clase"}
                  <span className="group-hover/btn2:translate-x-1 transition-transform">→</span>
                </span>
              </button>
            )}
          </div>

          <div className="relative group aspect-video rounded-[3rem] overflow-hidden bg-black border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
            <div className={`absolute -inset-2 ${accent.barBg}/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10`} />

            {videoSrc ? (
              <iframe
                src={videoSrc}
                title={activeTitle}
                className="w-full h-full relative z-10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center p-10 bg-gradient-to-b from-[#0a0f16] to-black">
                <div className="relative w-28 h-28 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl rotate-3">
                  <span className={`text-5xl filter drop-shadow-[0_0_15px_${accent.btnShadowRgba}]`}>🎬</span>
                  <div className={`absolute inset-0 rounded-[2rem] border ${accent.badgeBg.split(" ")[0]} animate-pulse`} />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-white mb-3 uppercase">Contenido en camino</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-medium">
                    Estamos preparando esta lección para ofrecerte la mejor experiencia de aprendizaje.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-white/10 gap-6 px-2">
            <button
              onClick={() => setActiveTab("info")}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === "info" ? accent.text : "text-slate-500 hover:text-white"
              }`}
            >
              Información
              {activeTab === "info" && (
                <motion.div layoutId="activeTabUnderline" className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent.tabActiveUnderline}`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab("recursos")}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === "recursos" ? accent.text : "text-slate-500 hover:text-white"
              }`}
            >
              Recursos ({materiales.length})
              {activeTab === "recursos" && (
                <motion.div layoutId="activeTabUnderline" className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent.tabActiveUnderline}`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab("comentarios")}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === "comentarios" ? accent.text : "text-slate-500 hover:text-white"
              }`}
            >
              Comentarios ({comments.length})
              {activeTab === "comentarios" && (
                <motion.div layoutId="activeTabUnderline" className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent.tabActiveUnderline}`} />
              )}
            </button>
          </div>

          {/* Tabs Content */}
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-xl p-8"
              >
                <div className={`absolute top-0 left-0 w-32 h-32 ${accent.barBg}/5 blur-[60px] -z-10`} />
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 ${accent.badgeBg} border rounded-lg text-[9px] font-black ${accent.text} uppercase tracking-widest animate-pulse`}>
                      En curso
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      Módulo {moduloActual?.titulo.split(" — ")[0]?.replace("Módulo ", "") || "01"}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{activeTitle}</h2>
                  <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-2xl">
                    {activeLeccion?.descripcion ||
                      "Bienvenido a esta lección. Aquí aprenderás conceptos clave del módulo actual y cómo aplicarlos en la práctica."}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "recursos" && (
              <motion.div
                key="recursos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-1.5 h-5 rounded-full ${accent.barBg} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-white">
                    Materiales de la Lección
                  </span>
                </div>
                {materiales.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3 opacity-20">📂</div>
                    <p className="text-white/20 text-xs uppercase tracking-widest font-bold">
                      Sin materiales para esta lección
                    </p>
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materiales.map((m, idx) => (
                      <li key={idx}>
                        <a
                          href={getMaterialUrl(m)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-white/50 hover:text-white transition-all group"
                        >
                          <span className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg group-hover:border-white/20 group-hover:bg-white/10 group-hover:${accent.text} transition-all`}>
                            📄
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">
                              {getMaterialNombre(m)}
                            </span>
                            <span className="text-[9px] font-medium text-white/20 uppercase tracking-[0.1em] truncate mt-1">
                              {m.modulo ? getModuloTitulo(m.modulo) : "Recurso General"}
                            </span>
                          </div>
                          <span className={`ml-auto text-white/10 group-hover:${accent.text} text-sm shrink-0 transition-colors`}>
                            ↗
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {activeTab === "comentarios" && (
              <motion.div
                key="comentarios"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-1.5 h-5 rounded-full ${accent.barBg} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-white">
                    Comentarios y Consultas
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <textarea
                    className="w-full bg-black/30 border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:border-white/30 focus:bg-black/50 outline-none transition-all resize-none"
                    placeholder="Escribe tu pregunta o comentario..."
                    value={newComment}
                    rows={3}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      className="relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden group/pub"
                      disabled={!newComment.trim() || sending}
                      onClick={() => {
                        const t = newComment;
                        setNewComment("");
                        sendComment(t);
                      }}
                    >
                      <div className={`absolute inset-0 bg-white group-hover/pub:${accent.barBg} transition-colors`} />
                      <span className="relative z-10 text-black">{sending ? "Enviando…" : "Publicar"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/[0.05]">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-white/20">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <p className="text-[10px] uppercase tracking-widest font-bold">Sé el primero en participar</p>
                    </div>
                  ) : (
                    comments.map((c) => (
                      <CommentItem key={String(c.id)} c={c} onReply={(txt) => sendComment(txt, c.id)} accent={accent} />
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: Contenido del curso - Urban Glass */}
        <div className="space-y-6">
          <div className="relative rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl">
            <div className={`absolute top-0 right-0 w-32 h-32 ${accent.barBg}/5 blur-[60px] -z-10`} />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-1.5 h-5 rounded-full ${accent.barBg} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                <span className="text-xs font-black uppercase tracking-[0.15em] text-white">Contenido del curso</span>
              </div>

              <div className="space-y-3">
                {mods.length === 0 && (
                  <div className="flex flex-col items-center gap-4 py-12 text-slate-500">
                    <div className={`w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</span>
                  </div>
                )}
                {mods.map((m, i) => (
                  <details
                    key={m.id || i}
                    open={m.id === activeModuloId || (!activeModuloId && i === 0)}
                    className="group/mod bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.04]"
                    onToggle={(ev) => {
                      if ((ev.target as HTMLDetailsElement).open) setActiveModuloId(m.id);
                    }}
                  >
                    <summary className="flex items-center justify-between cursor-pointer px-6 py-6 list-none group/sum">
                      <span className="text-[14px] font-bold text-slate-200 group-hover/sum:text-white transition-colors leading-normal tracking-tight pt-1">
                        {m.titulo}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-open/mod:rotate-180 transition-all duration-500 border border-white/10 shrink-0 ml-4`}>
                        <span className={`${accent.text} text-xs`}>⌄</span>
                      </div>
                    </summary>

                    <div className="px-3 pb-4 space-y-1.5">
                      {m.lecciones?.map((l) => {
                        const isActive = getLeccionId(l) === getLeccionId(activeLeccion);
                        const isDone = l.progreso?.estado === "Completado";
                        return (
                          <motion.div
                            key={getLeccionId(l)}
                            whileHover={{ x: 4 }}
                            className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] cursor-pointer transition-all relative overflow-hidden group/lec ${
                              isActive
                                ? `${accent.badgeBg} border border-white/10 text-white shadow-[0_10px_20px_-10px_rgba(255,255,255,0.01)]`
                                : "hover:bg-white/5 text-slate-300 border border-transparent"
                            }`}
                            onClick={() => handlePlayLeccion(l)}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeInd"
                                className={`absolute left-0 top-0 bottom-0 w-1 ${accent.barBg} shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                              />
                            )}
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 transition-all duration-500 ${
                                isDone
                                  ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                  : isActive
                                  ? accent.barBg
                                  : "bg-white/10"
                              }`}
                            />
                            <span className={`text-[12px] font-bold leading-relaxed truncate ${isActive ? "text-white" : "group-hover/lec:text-slate-200"}`}>
                              {getLeccionTitulo(l)}
                            </span>
                            {isDone && (
                              <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-400 text-[10px]">✓</span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
