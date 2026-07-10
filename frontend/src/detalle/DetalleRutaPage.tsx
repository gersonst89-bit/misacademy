"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./learning-path.css";
import { API_URL } from "../config/api";
import { apiClient } from "../services/apiClient";

const API_BASE = API_URL;

// ─── Accent theme por línea ──────────────────────────────────────────────────
const getAccentTheme = (lineaSlug: string) => {
  const s = (lineaSlug || "").toLowerCase();
  if (s.includes("ia"))
    return {
      text: "text-purple-400",
      textGrad: "from-purple-400 via-white to-purple-600",
      textGrad2: "from-purple-300 to-purple-600",
      stroke: "#a855f7",
      barBg: "bg-purple-500",
      glow1: "bg-purple-500/10",
      glow2: "bg-indigo-500/8",
      sectionGlow: "bg-purple-500/6",
      badgeBg: "bg-purple-500/10 border-purple-500/20",
      float: "bg-purple-500/10",
      hoverBorder: "hover:border-purple-500/30",
      hoverTitle: "group-hover:text-purple-400",
      checkItem: "bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover/item:bg-purple-500",
      slideDot: "bg-purple-400",
      certBadge: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      certFeat: "text-purple-400",
      ctaText: "from-purple-300 to-purple-500",
      btnShadowRgba: "rgba(168,85,247,0.35)",
      btnGradient: "from-purple-600 to-indigo-500",
    };
  if (s.includes("teacher"))
    return {
      text: "text-emerald-400",
      textGrad: "from-emerald-400 via-white to-emerald-600",
      textGrad2: "from-emerald-300 to-emerald-600",
      stroke: "#10b981",
      barBg: "bg-emerald-500",
      glow1: "bg-emerald-500/10",
      glow2: "bg-teal-500/8",
      sectionGlow: "bg-emerald-500/6",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20",
      float: "bg-emerald-500/10",
      hoverBorder: "hover:border-emerald-500/30",
      hoverTitle: "group-hover:text-emerald-400",
      checkItem: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover/item:bg-emerald-500",
      slideDot: "bg-emerald-400",
      certBadge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      certFeat: "text-emerald-400",
      ctaText: "from-emerald-300 to-emerald-500",
      btnShadowRgba: "rgba(16,185,129,0.35)",
      btnGradient: "from-emerald-500 to-teal-400",
    };
  if (s.includes("business"))
    return {
      text: "text-amber-400",
      textGrad: "from-amber-400 via-white to-amber-600",
      textGrad2: "from-amber-300 to-amber-600",
      stroke: "#f59e0b",
      barBg: "bg-amber-500",
      glow1: "bg-amber-500/10",
      glow2: "bg-orange-500/8",
      sectionGlow: "bg-amber-500/6",
      badgeBg: "bg-amber-500/10 border-amber-500/20",
      float: "bg-amber-500/10",
      hoverBorder: "hover:border-amber-500/30",
      hoverTitle: "group-hover:text-amber-400",
      checkItem: "bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover/item:bg-amber-500",
      slideDot: "bg-amber-400",
      certBadge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      certFeat: "text-amber-400",
      ctaText: "from-amber-300 to-amber-500",
      btnShadowRgba: "rgba(245,158,11,0.35)",
      btnGradient: "from-amber-500 to-orange-400",
    };
  // DEV / default = sky
  return {
    text: "text-sky-400",
    textGrad: "from-sky-400 via-white to-sky-600",
    textGrad2: "from-sky-300 to-sky-600",
    stroke: "#38bdf8",
    barBg: "bg-sky-500",
    glow1: "bg-sky-500/10",
    glow2: "bg-blue-500/8",
    sectionGlow: "bg-sky-500/6",
    badgeBg: "bg-sky-500/10 border-sky-500/20",
    float: "bg-sky-500/10",
    hoverBorder: "hover:border-sky-500/30",
    hoverTitle: "group-hover:text-sky-400",
    checkItem: "bg-sky-500/10 border-sky-500/20 text-sky-400 group-hover/item:bg-sky-500",
    slideDot: "bg-sky-400",
    certBadge: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    certFeat: "text-sky-400",
    ctaText: "from-sky-300 to-sky-500",
    btnShadowRgba: "rgba(14,165,233,0.35)",
    btnGradient: "from-sky-600 to-blue-500",
  };
};

// ─── Utils ───────────────────────────────────────────────────────────────────
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-40">
    <div className="relative w-10 h-10">
      <div className="absolute border-4 border-sky-600 border-t-transparent rounded-full w-10 h-10 animate-spin" />
      <div className="absolute border-4 border-sky-400 border-t-transparent rounded-full w-6 h-6 top-2 left-2 animate-spin animation-delay-150" />
    </div>
  </div>
);

const createSlug = (title: string): string =>
  title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const slugify = (s?: string) =>
  (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const num = (v: any) => (v == null || v === "" ? NaN : Number(v));

const parseList = (json: any): any[] => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.rutas)) return json.rutas;
  if (Array.isArray(json?.cursos)) return json.cursos;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  return [];
};

async function fetchJson(url: string) {
  const relativeUrl = url.replace(API_BASE, "");
  const res = await apiClient.get(relativeUrl);
  return res.data;
}

async function fetchAllPaged(baseUrl: string): Promise<any[]> {
  const results: any[] = [];
  let page = 1, lastPage = 1;
  let first = true;
  while (first || page <= lastPage) {
    first = false;
    const sep = baseUrl.includes("?") ? "&" : "?";
    const json = await fetchJson(`${baseUrl}${sep}page=${page}`);
    const chunk = parseList(json);
    results.push(...chunk);
    const lp = json.last_page ?? json.meta?.last_page ?? json.data?.last_page ?? 1;
    lastPage = typeof lp === "number" ? lp : 1;
    page++;
  }
  return results;
}

async function fetchFromFirstNonEmpty(urls: string[]) {
  for (const u of urls) {
    try {
      const d = await fetchAllPaged(u);
      if (d.length) return d;
    } catch {}
  }
  return [];
}

const getRutaId = (o: any) => o?.id_ruta ?? o?.ruta_id ?? o?.id ?? null;
const getRutaNombre = (o: any) => o?.nombre ?? o?.titulo ?? "-";
const getRutaPrecio = (o: any) => Number(o?.precio ?? o?.price ?? o?.costo ?? 0);
const getCursoId = (o: any) => o?.id_curso ?? o?.curso_id ?? o?.id;
const getCursoNombre = (o: any) => o?.nombre ?? o?.titulo ?? "Curso";
const getCursoRutas = (c: any) => { if (!c) return []; const r = c.rutas ?? c.rutas_ids ?? c.rutasId; return Array.isArray(r) ? r : r ? [r] : []; };

function cursoPerteneceARuta(curso: any, rutaId: number) {
  const rid = Number(rutaId);
  if (!rid || Number.isNaN(rid)) return false;
  const direct = curso?.id_ruta ?? curso?.ruta_id ?? curso?.rutaId ?? curso?.pivot?.ruta_id;
  if (direct != null && Number(direct) === rid) return true;
  return getCursoRutas(curso).some((r) => {
    if (!r) return false;
    if (typeof r === "string" || typeof r === "number") return Number(r) === rid;
    return Number(r.id_ruta ?? r.ruta_id ?? r.id ?? r.id_ruta_academica) === rid;
  });
}

import { useToast } from "../hooks/useToast";

const DetalleRutaPage: React.FC = () => {
  const { showToast } = useToast();
  const { slug, rutaTitle } = useParams();
  const navigate = useNavigate();
  const accent = getAccentTheme(slug || "");

  const [loading, setLoading] = useState(true);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [rutas, setRutas] = useState<any[]>([]);
  const [cursosDeRuta, setCursosDeRuta] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [isOwned, setIsOwned] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const json = await fetchJson(`${API_BASE}/rutas-academicas?_${Date.now()}`);
        if (!cancel) setRutas(parseList(json));
      } catch {
        if (!cancel) setError("Error cargando rutas.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const idxRutaBySlug = useMemo(() => new Map(rutas.map((r) => [slugify(getRutaNombre(r)), r])), [rutas]);
  let ruta: any | undefined = idxRutaBySlug.get(slugify(rutaTitle ?? slug ?? "")) || rutas[0];

  useEffect(() => {
    const checkOwnership = async () => {
      if (!ruta) return;
      const userStored = localStorage.getItem("user");
      if (!userStored) return;
      try {
        const res = await apiClient.get("/compras/historial");
        const data = res.data;
        const compras = data.compras || data.data || [];
        const rid = num(getRutaId(ruta));
        const owned = compras.some((c: any) => c.ruta?.id_ruta === rid || c.id_ruta === rid);
        setIsOwned(owned);
      } catch (err) {
        console.error("Error al verificar propiedad:", err);
      }
    };
    checkOwnership();
  }, [ruta]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingCursos(true);
      setError(null);
      if (!ruta) { setCursosDeRuta([]); setLoadingCursos(false); return; }
      const rid = num(getRutaId(ruta));
      if (!rid || Number.isNaN(rid)) { setCursosDeRuta([]); setLoadingCursos(false); return; }
      try {
        let cursos = await fetchFromFirstNonEmpty([`${API_BASE}/cursos?_${Date.now()}`]);
        cursos = cursos.filter((c) => cursoPerteneceARuta(c, rid));
        if (!cancel) setCursosDeRuta(cursos);
      } catch {
        if (!cancel) setError("Error cargando cursos.");
      } finally {
        if (!cancel) setLoadingCursos(false);
      }
    })();
    return () => { cancel = true; };
  }, [ruta]);

  const pasos = useMemo(
    () =>
      [...cursosDeRuta]
        .sort((a, b) => String(getCursoNombre(a)).localeCompare(getCursoNombre(b)))
        .map((c, i) => ({ n: i + 1, titulo: getCursoNombre(c), idCurso: getCursoId(c), curso: c })),
    [cursosDeRuta]
  );

  const heroImages = pasos.map((p) => p.curso?.imagen).filter(Boolean);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => setSlide((prev) => (prev + 1) % heroImages.length), 3800);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const [contador, setContador] = useState(200);
  useEffect(() => {
    const interval = setInterval(() => setContador((c) => (c >= 320 ? 200 : c + 10)), 1200);
    return () => clearInterval(interval);
  }, []);

  async function onAddToCart() {
    if (!ruta) return;
    const userStored = localStorage.getItem("user");
    if (!userStored) return showToast("Por favor, ingresa sesión para agregar la ruta al carrito.", "info");
    try {
      setAdding(true);
      const rid = getRutaId(ruta);
      if (!rid) return showToast("Error: No se pudo identificar la ruta.", "error");
      const res = await apiClient.post("/carrito/agregar", { id_ruta: rid }).catch((err: any) => {
        if (err?.response?.status === 401) showToast("Por favor, ingresa sesión para agregar la ruta al carrito.", "info");
        else showToast(err?.response?.data?.message || "No se pudo añadir al carrito.", "error");
        return null;
      });
      if (res) showToast("Ruta añadida al carrito", "success");
    } catch (err) {
      showToast("Error de conexión.", "error");
    } finally {
      setAdding(false);
    }
  }

  const precio = getRutaPrecio(ruta);
  const labelPrecio = precio <= 0 ? "Gratis" : `S/. ${precio.toFixed(2)}`;

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-10 pt-0 pb-6 lg:pb-10 text-white overflow-x-hidden bg-[#03070c]">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <header className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-20 pb-16 lg:pt-24 lg:pb-20">
        {/* Glows */}
        <div className={`absolute top-10 left-1/4 w-[500px] h-[500px] ${accent.glow1} blur-[150px] rounded-full -z-10 animate-pulse`} />
        <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] ${accent.glow2} blur-[130px] rounded-full -z-10`} />

        {/* Left text */}
        <div className="text-center lg:text-left z-20 max-w-xl mx-auto lg:mx-0">
          <div className={`inline-flex items-center gap-3 px-4 py-2 ${accent.badgeBg} border rounded-2xl mb-8 backdrop-blur-md`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accent.text.replace("text-", "bg-")} animate-pulse`} />
            <span className={`text-[10px] font-black tracking-[0.3em] ${accent.text} uppercase`}>Ruta de Especialización</span>
          </div>

          {(() => {
              const connectors = new Set(["con", "de", "del", "y", "e", "en", "la", "el", "los", "las", "por", "para", "a", "al", "sin"]);
              const words = getRutaNombre(ruta).trim().split(/\s+/);
              const lastWord = words[words.length - 1] ?? "";
              const secondToLast = words.length > 1 ? words[words.length - 2] : "";
              const hasPrefixConnector = connectors.has(secondToLast.toLowerCase()) && words.length > 2;
              const mainText = hasPrefixConnector ? words.slice(0, -2).join(" ") : words.slice(0, -1).join(" ");
              const prefixText = hasPrefixConnector ? secondToLast + " " : "";
              return (
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight leading-[1.05]">
                  <span className="block text-white">{mainText}</span>
                  <span className="block">
                    {prefixText && <span className="text-white">{prefixText}</span>}
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accent.textGrad}`}>{lastWord}</span>
                  </span>
                </h1>
              );
            })()}

          <p className="text-slate-400 text-base sm:text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-10 mx-auto lg:mx-0">
            {ruta?.descripcion || "Domina las tecnologías más demandadas con un plan de estudio diseñado por expertos de la industria."}
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
              <span className={`${accent.text} font-black italic`}>01.</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Nivel {ruta?.nivel || "Experto"}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
              <span className={`${accent.text} font-black italic`}>02.</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{ruta?.horas_totales || "40+"} Horas</span>
            </div>
          </div>
        </div>

        {/* Right image */}
        <div className="relative group">
          {heroImages.length > 0 ? (
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-3xl">
              <img
                src={heroImages[slide]}
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div className="flex gap-2">
                  {heroImages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${slide === i ? `w-8 ${accent.slideDot}` : "w-2 bg-white/20"}`}
                      onClick={() => setSlide(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/3] bg-white/5 rounded-[3rem] animate-pulse border border-white/10" />
          )}

          {/* Floating rating */}
          <div className={`absolute -bottom-10 -right-10 ${accent.float} backdrop-blur-xl border border-white/10 p-8 rounded-3xl hidden md:block animate-bounce-slow`}>
            <div className="text-3xl font-black text-white italic tracking-tighter">4.9/5</div>
            <div className={`text-[10px] font-bold ${accent.text} uppercase tracking-widest mt-1`}>Rating Global</div>
          </div>
        </div>
      </header>

      {/* ─── PLAN DE ESTUDIO ───────────────────────────────────────────────── */}
      <section className="relative mt-32 max-w-7xl mx-auto w-full">
        {/* Glows */}
        <div className={`absolute top-0 left-0 w-[500px] h-[500px] ${accent.sectionGlow} rounded-full blur-[140px] -z-10 pointer-events-none`} />
        <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] ${accent.glow2} rounded-full blur-[130px] -z-10 pointer-events-none`} />

        <div className="flex items-end justify-between mb-16 px-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic font-['Outfit'] mb-2">
              Plan de{" "}
              <span className="text-transparent" style={{ WebkitTextStroke: `1px ${accent.stroke}` }}>
                Estudio
              </span>
            </h2>
            <div className={`h-1 w-20 ${accent.barBg} rounded-full mb-4`} />
          </div>
          <div className="hidden md:block text-right">
            <span className="text-5xl font-black text-white/5 italic select-none">ROADMAP</span>
          </div>
        </div>

        {loadingCursos ? (
          <LoadingSpinner />
        ) : pasos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
            {pasos.map((p, i) => (
              <Link
                key={i}
                to={isOwned ? `/video-page/${p.idCurso}` : `/curso/${p.curso?.slug || createSlug(p.titulo)}`}
                className={`group block relative bg-white/[0.03] border border-white/8 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${accent.hoverBorder} hover:bg-white/[0.05] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]`}
              >
                {/* Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={
                      p?.curso?.imagen
                        ? p.curso.imagen.startsWith("http")
                          ? p.curso.imagen
                          : `${API_URL}/${p.curso.imagen.startsWith("/") ? p.curso.imagen.slice(1) : p.curso.imagen}`
                        : "/placeholder.jpg"
                    }
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03070c] via-transparent to-transparent" />

                  {/* Module badge */}
                  <div className={`absolute top-6 left-6 px-4 py-1.5 ${accent.badgeBg} border backdrop-blur-xl rounded-full text-[9px] font-black ${accent.text} uppercase tracking-widest`}>
                    Módulo {p.n < 10 ? `0${p.n}` : p.n}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-4 line-clamp-2 leading-tight transition-colors ${accent.hoverTitle}`}>
                    {p.titulo}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-8 font-light leading-relaxed group-hover:text-slate-400 transition-colors">
                    {p.curso?.descripcion_corta || "Explora los conceptos fundamentales y avanzados de este módulo especializado."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isOwned ? "text-emerald-400" : accent.text}`}>
                      {isOwned ? "Acceso de por vida" : "Ver Detalles"}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isOwned ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500" : `${accent.badgeBg} border ${accent.text} group-hover:${accent.barBg.replace("bg-", "bg-")}`}`}>
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 py-10 text-lg px-4">Esta ruta aún no tiene cursos asignados.</p>
        )}
      </section>

      {/* ─── MEMBRESÍA / CTA ───────────────────────────────────────────────── */}
      <section className="w-full mt-24 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className={`relative p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] overflow-hidden transition-all duration-700 ${isOwned ? "bg-gradient-to-br from-emerald-500/10 via-black/40 to-emerald-900/10 border-emerald-500/30" : `bg-gradient-to-br ${accent.glow1.replace("/10", "/5")} via-black/40 ${accent.glow1.replace("/10", "/5")} ${accent.badgeBg.split(" ")[1]?.replace("border-", "border-") || "border-white/10"}`} border backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] group/card text-center`}>
          {/* Glows */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 ${isOwned ? "bg-emerald-500/20" : accent.glow1} blur-[100px] rounded-full`} />
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${isOwned ? "bg-emerald-500/10" : accent.glow2} blur-[100px] rounded-full`} />

          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 ${isOwned ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : `${accent.badgeBg} ${accent.text}`} text-[10px] font-black uppercase tracking-[0.2em]`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {isOwned ? "Acceso Estudiante" : "Membresía Premium"}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black mb-6 tracking-tight uppercase font-['Outfit'] leading-tight">
              <span className="block text-white">{isOwned ? "¡Ya es" : "Acceso"}</span>
              <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${isOwned ? "from-emerald-300 to-emerald-500" : accent.ctaText}`}>
                {isOwned ? "Tuya!" : "Completo"}
              </span>
            </h2>

            {!isOwned && (
              <div className="text-4xl font-black text-white mb-6 font-['Outfit']">
                {labelPrecio}
              </div>
            )}

            <p className="text-slate-400 text-lg font-light mb-10 max-w-sm mx-auto leading-relaxed">
              {isOwned
                ? "Tienes acceso ilimitado a todos los cursos y futuras actualizaciones de esta ruta."
                : `Únete a los más de ${contador} estudiantes que ya están transformando su carrera.`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-12 max-w-md mx-auto">
              {["Cursos", "Soporte", "Material", "Diploma"].map((label, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                  <span className={`text-xl font-bold ${isOwned ? "text-emerald-400" : accent.text}`}>✓</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (isOwned) {
                  if (pasos.length > 0) navigate(`/video-page/${pasos[0].idCurso}`);
                } else {
                  onAddToCart();
                }
              }}
              disabled={adding}
              className="w-full group/btn relative py-6 rounded-[2rem] overflow-hidden transition-all duration-500 active:scale-95"
              style={{ boxShadow: `0 20px 40px -10px ${isOwned ? "rgba(16,185,129,0.35)" : accent.btnShadowRgba}` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${isOwned ? "from-emerald-600 to-teal-500" : accent.btnGradient} group-hover/btn:scale-105 transition-transform duration-500`} />
              <span className="relative z-10 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                {adding ? "Procesando..." : isOwned ? "Continuar Aprendiendo" : "Obtener acceso ahora"}
                <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>
        </div>

        {/* Right: features */}
        <div className="text-center lg:text-left lg:pl-10 mt-16 lg:mt-0">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight uppercase font-['Outfit'] leading-[1.1]">
            Aprende de forma <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-b ${accent.textGrad2}`}>
              Completa y Certificada
            </span>
          </h3>

          <p className="text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed mb-10 font-light max-w-xl mx-auto lg:mx-0">
            Accede a todos los cursos, recursos, soporte y módulos de esta ruta.
            Aprende a tu ritmo desde cualquier dispositivo y obtén tu acreditación oficial.
          </p>

          <div className="flex justify-center lg:justify-start">
            <div className="space-y-6 text-left inline-block">
              {[
                "Contenido actualizado semanalmente",
                "Soporte directo con mentores",
                "Descarga de materiales exclusivos",
                "Validación de conocimientos práctica",
              ].map((txt, i) => (
                <div key={i} className="flex items-center gap-4 group/item">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${accent.checkItem} group-hover/item:text-black`}>✓</div>
                  <span className="text-slate-300 font-medium tracking-wide">{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CERTIFICACIÓN ─────────────────────────────────────────────────── */}
      <section className="w-full mt-40 mb-32 max-w-7xl mx-auto px-4">
        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-12 md:p-20 overflow-hidden backdrop-blur-3xl shadow-2xl">
          {/* Glows */}
          <div className={`absolute top-0 right-0 w-96 h-96 ${accent.sectionGlow} blur-[100px] rounded-full -z-10`} />
          <div className={`absolute bottom-0 left-0 w-64 h-64 ${accent.glow2} blur-[100px] rounded-full -z-10`} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <img
                src="/certificado.jpg"
                alt="Certificado Oficial"
                loading="lazy"
                className="w-full rounded-[2.5rem] shadow-2xl border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform duration-700"
              />
              <div className="absolute -bottom-6 right-2 md:-right-6 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">
                Oficial MIS Academy
              </div>
            </div>

            <div className="order-1 lg:order-2 text-center lg:text-left mb-12 lg:mb-0">
              <div className={`inline-flex items-center gap-3 px-4 py-2 ${accent.certBadge} border rounded-2xl mb-8`}>
                <span className={`text-[10px] font-black tracking-[0.3em] ${accent.text} uppercase`}>Reconocimiento Global</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight uppercase font-['Outfit']">
                Tu Éxito Merece ser <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">Certificado</span>
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed mb-12 font-light">
                Al finalizar esta ruta recibirás un certificado digital con tecnología de validación única,
                listo para compartir en LinkedIn y potenciar tu empleabilidad.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { t: "Oficial", d: "Acreditado por MIS" },
                  { t: "Global", d: "Válido internacional" },
                  { t: "Único", d: "Código QR seguro" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all group/feat">
                    <p className={`${accent.certFeat} font-black text-xs uppercase tracking-widest mb-2 group-hover/feat:scale-110 transition-transform`}>{item.t}</p>
                    <p className="text-slate-500 text-[10px] font-bold leading-tight">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-16 text-center bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-[2rem] max-w-xl mx-auto backdrop-blur-xl">
            <span className="font-black uppercase tracking-widest text-xs">Error de Sistema:</span>
            <p className="mt-2 font-light">{error}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DetalleRutaPage;
