"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./learning-path.css";
import { API_URL, BASE_URL } from "../config/api";

const API_BASE = API_URL;


const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-40">
    <div className="relative w-10 h-10">
      <div className="absolute border-4 border-sky-600 border-t-transparent rounded-full w-10 h-10 animate-spin" />
      <div className="absolute border-4 border-sky-400 border-t-transparent rounded-full w-6 h-6 top-2 left-2 animate-spin animation-delay-150" />
    </div>
  </div>
);

const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const slugify = (s?: string) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

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
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function fetchAllPaged(baseUrl: string): Promise<any[]> {
  const results: any[] = [];
  let page = 1;
  let lastPage = 1;
  let first = true;

  while (first || page <= lastPage) {
    first = false;
    const sep = baseUrl.includes("?") ? "&" : "?";
    const json = await fetchJson(`${baseUrl}${sep}page=${page}`);
    const chunk = parseList(json);
    results.push(...chunk);

    const lp =
      json.last_page ??
      json.meta?.last_page ??
      json.data?.last_page ??
      1;

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

const getCursoRutas = (c: any) => {
  if (!c) return [];
  const r = c.rutas ?? c.rutas_ids ?? c.rutasId;
  return Array.isArray(r) ? r : r ? [r] : [];
};

function cursoPerteneceARuta(curso: any, rutaId: number) {
  const rid = Number(rutaId);
  if (!rid || Number.isNaN(rid)) return false;

  const direct =
    curso?.id_ruta ??
    curso?.ruta_id ??
    curso?.rutaId ??
    curso?.pivot?.ruta_id;

  if (direct != null && Number(direct) === rid) return true;

  return getCursoRutas(curso).some((r) => {
    if (!r) return false;
    if (typeof r === "string" || typeof r === "number")
      return Number(r) === rid;

    return Number(r.id_ruta ?? r.ruta_id ?? r.id ?? r.id_ruta_academica) === rid;
  });
}


import { useToast } from "../hooks/useToast";

const DetalleRutaPage: React.FC = () => {
  const { showToast } = useToast();
  const { slug, rutaTitle } = useParams();
  const navigate = useNavigate();

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

    return () => {
      cancel = true;
    };
  }, []);

  const idxRutaBySlug = useMemo(
    () => new Map(rutas.map((r) => [slugify(getRutaNombre(r)), r])),
    [rutas]
  );

  let ruta: any | undefined =
    idxRutaBySlug.get(slugify(rutaTitle ?? slug ?? "")) || rutas[0];

  useEffect(() => {
    const checkOwnership = async () => {
      if (!ruta) return;
      
      // Si no hay rastro de usuario en localStorage, ni siquiera intentamos preguntar al servidor
      // Esto evita el error 401 en la consola para usuarios no logueados.
      const userStored = localStorage.getItem("user");
      if (!userStored) return;

      try {
        const res = await fetch(`${API_BASE}/compras/historial`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          const compras = data.compras || data.data || [];
          const rid = num(getRutaId(ruta));
          const owned = compras.some((c: any) => c.ruta?.id_ruta === rid || c.id_ruta === rid);
          setIsOwned(owned);
        }
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

      if (!ruta) {
        setCursosDeRuta([]);
        setLoadingCursos(false);
        return;
      }

      const rid = num(getRutaId(ruta));
      if (!rid || Number.isNaN(rid)) {
        setCursosDeRuta([]);
        setLoadingCursos(false);
        return;
      }

      try {
        let cursos = await fetchFromFirstNonEmpty([
          `${API_BASE}/cursos?_${Date.now()}`,
        ]);

        cursos = cursos.filter((c) => cursoPerteneceARuta(c, rid));

        if (!cancel) setCursosDeRuta(cursos);
      } catch {
        if (!cancel) setError("Error cargando cursos.");
      } finally {
        if (!cancel) setLoadingCursos(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [ruta]);

  const pasos = useMemo(
    () =>
      [...cursosDeRuta]
        .sort((a, b) =>
          String(getCursoNombre(a)).localeCompare(getCursoNombre(b))
        )
        .map((c, i) => ({
          n: i + 1,
          titulo: getCursoNombre(c),
          idCurso: getCursoId(c),
          curso: c,
        })),
    [cursosDeRuta]
  );

  const heroImages = pasos.map((p) => p.curso?.imagen).filter(Boolean);

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length === 0) return;

    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % heroImages.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const [contador, setContador] = useState(200);

  useEffect(() => {
    const interval = setInterval(() => {
      setContador((c) => (c >= 320 ? 200 : c + 10));
    }, 1200);

    return () => clearInterval(interval);
  }, []);



  const standardHeaders: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

async function onAddToCart() {
  if (!ruta) return;

  // ESCUDO DE CONSOLA: Si ya sabemos que no hay usuario, ni siquiera enviamos la petición.
  // Esto evita que aparezca el error 401 en la consola.
  const userStored = localStorage.getItem("user");
  if (!userStored) {
    return showToast("Por favor, ingresa sesión para agregar la ruta al carrito.", "info");
  }

  try {
    setAdding(true);

    const rid = getRutaId(ruta);
    if (!rid) {
      return showToast("Error: No se pudo identificar la ruta.", "error");
    }

    const res = await fetch(`${API_BASE}/carrito/agregar`, {
      method: "POST",
      headers: standardHeaders,
      body: JSON.stringify({
        id_ruta: rid
      }),
      credentials: "include",
    });

    if (res.ok) {
      showToast("Ruta añadida al carrito", "success");
    } else if (res.status === 401) {
      showToast("Por favor, ingresa sesión para agregar la ruta al carrito.", "info");
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.message || "No se pudo añadir al carrito.", "error");
    }

  } catch (err) {
    showToast("Error de conexión.", "error");
  } finally {
    setAdding(false);
  }
}



  const precio = getRutaPrecio(ruta);
  const labelPrecio = precio <= 0 ? "Gratis" : `S/. ${precio.toFixed(2)}`;

  return (
    <div
      className="min-h-screen px-4 md:px-8 lg:px-10 py-10 text-white"
      style={{
        background: "#000000",
      }}
    >

      <header className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-32 pb-20">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
        
        <div className="text-center lg:text-left z-20 max-w-xl mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl mb-8 backdrop-blur-md">
             <span className="text-[10px] font-black tracking-[0.3em] text-sky-400 uppercase">Ruta de Especialización</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-8 tracking-tight leading-[1.1] uppercase font-['Outfit'] italic flex flex-col">
            <span className="text-white drop-shadow-[0_5px_15px_rgba(255,255,255,0.2)]">
              {getRutaNombre(ruta).split(' ').slice(0, -2).join(' ')}
            </span>
            <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>
              {getRutaNombre(ruta).split(' ').slice(-2, -1)}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-sky-600 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              {getRutaNombre(ruta).split(' ').pop()}
            </span>
          </h1>

          <p className="text-slate-400 text-xl md:text-2xl font-light max-w-2xl leading-relaxed mb-10 mx-auto lg:mx-0">
            {ruta?.descripcion || "Domina las tecnologías más demandadas con un plan de estudio diseñado por expertos de la industria."}
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
             <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <span className="text-sky-400 font-black italic">01.</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Nivel {ruta?.nivel || "Experto"}</span>
             </div>
             <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <span className="text-sky-400 font-black italic">02.</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{ruta?.horas_totales || "40+"} Horas</span>
             </div>
          </div>
        </div>

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
                        className={`h-1 rounded-full transition-all duration-500 ${slide === i ? "w-8 bg-sky-400" : "w-2 bg-white/20"}`}
                        onClick={() => setSlide(i)}
                      />
                    ))}
                 </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/3] bg-white/5 rounded-[3rem] animate-pulse border border-white/10" />
          )}
          
          {/* Floating Decoration */}
          <div className="absolute -bottom-10 -right-10 bg-sky-500/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hidden md:block animate-bounce-slow">
             <div className="text-3xl font-black text-white italic tracking-tighter">4.9/5</div>
             <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-1">Rating Global</div>
          </div>
        </div>
      </header>

      <section className="mt-32 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-16 px-4">
           <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter italic font-['Outfit'] mb-2">
                Plan de <span className="text-transparent" style={{ WebkitTextStroke: '1px #38bdf8' }}>Estudio</span>
              </h2>
              <div className="h-1 w-20 bg-sky-500 rounded-full mb-4" />
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
                className="group block relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-sky-500/30 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
              >
                {/* Image Section */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={
                      p?.curso?.imagen
                        ? p.curso.imagen.startsWith("http")
                          ? p.curso.imagen
                          : `${API_URL}/${p.curso.imagen.startsWith("/") ? p.curso.imagen.slice(1) : p.curso.imagen}`
                        : "/placeholder.jpg"
                    }
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                     Módulo {p.n < 10 ? `0${p.n}` : p.n}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-sky-400 transition-colors">
                    {p.titulo}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-8 font-light leading-relaxed">
                    {p.curso?.descripcion_corta || "Explora los conceptos fundamentales y avanzados de este módulo especializado."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${isOwned ? 'text-emerald-400' : 'text-sky-400'}`}>
                        {isOwned ? "Acceso de por vida" : "Ver Detalles"}
                     </span>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isOwned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>
                        →
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 py-10 text-lg">
            Esta ruta aún no tiene cursos asignados.
          </p>
        )}
      </section>

      <section className="w-full mt-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className={`relative p-12 rounded-[3rem] overflow-hidden transition-all duration-700 ${isOwned ? 'bg-gradient-to-br from-emerald-500/10 via-black/40 to-emerald-900/10 border-emerald-500/30' : 'bg-gradient-to-br from-sky-500/10 via-black/40 to-sky-900/10 border-sky-600/30'} border backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] group/card text-center`}>
          {/* Decorative Glow */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 ${isOwned ? 'bg-emerald-500/20' : 'bg-sky-500/20'} blur-[100px] rounded-full`} />
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${isOwned ? 'bg-emerald-500/10' : 'bg-sky-500/10'} blur-[100px] rounded-full`} />

          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 ${isOwned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>
               <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
               {isOwned ? "Acceso Estudiante" : "Membresía Premium"}
            </div>

            <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase font-['Outfit'] italic leading-none">
              {isOwned ? "¡Ya es " : "Acceso "}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isOwned ? 'from-emerald-300 to-emerald-500' : 'from-sky-300 to-sky-500'}`}>
                {isOwned ? "tuya!" : "Completo"}
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
               {[
                 { label: "Cursos", icon: "✓" },
                 { label: "Soporte", icon: "✓" },
                 { label: "Material", icon: "✓" },
                 { label: "Diploma", icon: "✓" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                    <span className={`text-xl font-bold ${isOwned ? 'text-emerald-400' : 'text-sky-400'}`}>{item.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{item.label}</span>
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
              className={`w-full group/btn relative py-6 rounded-[2rem] overflow-hidden transition-all duration-500 active:scale-95 ${isOwned ? 'shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]' : 'shadow-[0_20px_40px_-10px_rgba(14,165,233,0.3)]'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${isOwned ? 'from-emerald-600 to-teal-500' : 'from-sky-600 to-blue-500'} group-hover/btn:scale-105 transition-transform duration-500`} />
              <span className="relative z-10 text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                {adding ? "Procesando..." : (isOwned ? "Continuar Aprendiendo" : "Obtener acceso ahora")}
                <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>
        </div>

        <div className="lg:pl-10">
          <h3 className="text-5xl font-extrabold text-white mb-8 tracking-tight uppercase font-['Outfit'] leading-[1.1]">
            Aprende de forma <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-sky-300 to-sky-600">Completa y Certificada</span>
          </h3>

          <p className="text-slate-400 text-xl leading-relaxed mb-10 font-light">
            Accede a todos los cursos, recursos, soporte y módulos de esta ruta.
            Aprende a tu ritmo desde cualquier dispositivo y obtén tu acreditación oficial.
          </p>

          <div className="space-y-6">
             {[
               "Contenido actualizado semanalmente",
               "Soporte directo con mentores",
               "Descarga de materiales exclusivos",
               "Validación de conocimientos práctica"
             ].map((txt, i) => (
               <div key={i} className="flex items-center gap-4 group/item">
                  <div className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xs group-hover/item:bg-sky-500 group-hover/item:text-black transition-all">✓</div>
                  <span className="text-slate-300 font-medium tracking-wide">{txt}</span>
               </div>
             ))}
          </div>
        </div>

      </section>

<section className="w-full mt-40 mb-32 max-w-7xl mx-auto px-4">
  <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[4rem] p-12 md:p-20 overflow-hidden backdrop-blur-3xl shadow-2xl">
    {/* Decorative Shapes */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[100px] rounded-full -z-10" />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div className="relative order-2 lg:order-1">
        <div className="absolute -inset-4 bg-sky-500/20 blur-2xl rounded-[3rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src="/certificado.jpg"
          alt="Certificado Oficial"
          className="w-full rounded-[2.5rem] shadow-2xl border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform duration-700"
        />
        
        {/* Floating Tag */}
        <div className="absolute -bottom-6 -right-6 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">
           Oficial MIS Academy
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-2xl mb-8">
           <span className="text-[10px] font-black tracking-[0.3em] text-sky-400 uppercase">Reconocimiento Global</span>
        </div>
        
        <h2 className="text-5xl font-extrabold text-white mb-8 tracking-tight uppercase font-['Outfit']">
          Tu Éxito Merece ser <br/>
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
            { t: "Único", d: "Código QR seguro" }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all group/feat">
              <p className="text-sky-400 font-black text-xs uppercase tracking-widest mb-2 group-hover/feat:scale-110 transition-transform">{item.t}</p>
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
