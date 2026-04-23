"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./learning-path.css";
import { API_URL } from "../config/api";

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


const DetalleRutaPage: React.FC = () => {
  const { slug, rutaTitle } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [rutas, setRutas] = useState<any[]>([]);
  const [cursosDeRuta, setCursosDeRuta] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  const toastTimer = useRef<number | null>(null);

  const showToast = (type: "ok" | "err", msg: string, ms = 1500) => {
    setToast({ type, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    let cancel = false;

    (async () => {
      setLoading(true);
      try {
        const json = await fetchJson(`${API_BASE}/rutas?_${Date.now()}`);
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

  const bearer =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("access_token")
      : "";

  const authHeaders: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  };

async function onAddToCart() {
  if (!ruta) return;
  if (!bearer) return showToast("err", "Debes iniciar sesión.");

  try {
    setAdding(true);

    if (cursosDeRuta.length === 0) {
      return showToast("err", "Esta ruta no tiene cursos aún.");
    }

    for (const curso of cursosDeRuta) {
      try {
        const res = await fetch(`${API_BASE}/carrito/agregar`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            id_curso: getCursoId(curso)
          }),
        });

        if (res.status === 409) {
          continue; 
        }

      } catch (e) {
      }
    }

    showToast("ok", "Cursos añadidos al carrito");

  } catch (err) {
    showToast("err", "No se pudo añadir al carrito.");
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
        background:
          "linear-gradient(45deg, #0E1C2B 0%, #09111D 50%, #0E1C2B 100%)",
      }}
    >
      {toast && (
  <div
    className="
      fixed
      bottom-4
      right-4
      bg-[#0D1A28]
      border-l-4
      text-white
      px-5
      py-3
      rounded-lg
      shadow-xl
      z-[9999]
      transition-opacity
      duration-500
      opacity-100
    "
    style={{
      borderColor: toast.type === "ok" ? "#38bdf8" : "#ef4444",
    }}
  >
    {toast.msg}
  </div>
)}

      <header className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-10">

        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            {getRutaNombre(ruta)}
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl">
            Explora esta ruta profesional con contenido actualizado,
            cursos seleccionados y una experiencia visual moderna.
          </p>
        </div>

        <div className="w-full flex flex-col items-center">
          {heroImages.length > 0 ? (
            <>
              <img
                src={heroImages[slide]}
                className="w-full h-[250px] md:h-[320px] lg:h-[360px] rounded-3xl object-cover shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all duration-700"
              />

              <div className="flex gap-3 mt-4">
                {heroImages.map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full cursor-pointer transition-all
                      ${slide === i ? "bg-sky-400 scale-125" : "bg-gray-500/40"}`}
                    onClick={() => setSlide(i)}
                  ></div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-500"></div>
          )}
        </div>
      </header>

      <section className="mt-14 w-full">
        <h2 className="text-3xl font-bold mb-6">Cursos incluidos en la ruta</h2>

        {loadingCursos ? (
          <LoadingSpinner />
        ) : pasos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {pasos.map((p, i) => (
              <div
                key={i}
                onClick={() => navigate(`/curso/${createSlug(p.titulo)}`)}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-[#0b1523] shadow-xl h-[240px] hover:scale-[1.02] transition-transform"
              >
                <img
                  src={p?.curso?.imagen || "/placeholder.jpg"}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

                <div className="absolute bottom-4 left-4 right-4">
                 <h3 className="text-xl font-bold mb-1 group-hover:text-sky-300">
                      {p.titulo}
                    </h3>
                    <p className="text-sky-300 text-sm font-semibold mb-2">
                      {p.curso?.precio ? `S/. ${Number(p.curso.precio).toFixed(2)}` : "Gratis"}
                    </p>
                  <button className="px-4 py-1 text-xs bg-sky-600 rounded-md hover:bg-sky-500">
                    Ver curso
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 py-10 text-lg">
            Esta ruta aún no tiene cursos asignados.
          </p>
        )}
      </section>

      <section className="w-full mt-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="p-10 rounded-3xl bg-[#0b1523]/90 border border-sky-600/40 shadow-[0_0_35px_rgba(56,189,248,0.25)] text-center">
          <h2 className="text-3xl font-extrabold mb-1">Acceso Completo</h2>
          <p className="text-sky-300 text-lg font-semibold mb-5">
            {contador}+ estudiantes inscritos
          </p>

          <ul className="text-gray-300 text-left mx-auto max-w-sm space-y-3 mb-8">
            <li className="flex gap-3"><span className="text-sky-400 text-xl">✓</span>Acceso a todos los cursos</li>
            <li className="flex gap-3"><span className="text-sky-400 text-xl">✓</span>Actualizaciones ilimitadas</li>
            <li className="flex gap-3"><span className="text-sky-400 text-xl">✓</span>Material complementario</li>
            <li className="flex gap-3"><span className="text-sky-400 text-xl">✓</span>Certificado final</li>
          </ul>

          <button
            onClick={onAddToCart}
            disabled={adding}
            className="px-10 py-3 rounded-xl text-xl font-semibold bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-500/40"
          >
            {adding ? "Procesando..." : "Obtener acceso"}
          </button>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-sky-300 mb-4">
            Aprende de forma completa y certificada
          </h3>

          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Accede a todos los cursos, recursos, soporte y módulos de esta ruta.
            Aprende a tu ritmo desde cualquier dispositivo.
          </p>

          <p className="text-gray-400 leading-relaxed">
            El certificado profesional avala tus conocimientos y aumenta tu valor en el mercado laboral.
          </p>
        </div>

      </section>

<section className="w-full mt-24 mb-20">
  <h2 className="text-4xl font-bold text-sky-300 mb-14 text-center tracking-wide">
    Certificación Incluida
  </h2>
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center  px-4 ">

    <div className="flex justify-center lg:justify-start">
      <img
        src="/certificado.jpg"
        alt="Certificado"
        className="w-full max-w-[520px] rounded-xl shadow-xl border border-sky-600/20"/>
    </div>

    <div className="flex flex-col text-left">

      <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-xl">
        Al finalizar esta ruta recibirás un{" "}
        <span className="text-sky-400 font-semibold">certificado digital verificable</span>,
        ideal para fortalecer tu CV, portafolio profesional y destacar en procesos de selección.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-[#0d1826] border border-sky-600/20 rounded-xl px-5 py-6 text-center shadow-lg hover:scale-[1.03] transition">
          <p className="text-sky-400 font-bold text-lg mb-1">✓ Oficial</p>
          <p className="text-gray-300 text-sm">Emitido por la plataforma.</p>
        </div>

        <div className="bg-[#0d1826] border border-sky-600/20 rounded-xl px-5 py-6 text-center shadow-lg hover:scale-[1.03] transition">
          <p className="text-sky-400 font-bold text-lg mb-1">✓ Profesional</p>
          <p className="text-gray-300 text-sm">Perfecto para CV e informes.</p>
        </div>

        <div className="bg-[#0d1826] border border-sky-600/20 rounded-xl px-5 py-6 text-center shadow-lg hover:scale-[1.03] transition">
          <p className="text-sky-400 font-bold text-lg mb-1">✓ Verificable</p>
          <p className="text-gray-300 text-sm">Incluye código único.</p>
        </div>

      </div>
    </div>

  </div>

  {error && (
    <div className="mt-10 text-center bg-red-900/40 border border-red-600 text-red-300 p-4 rounded-xl max-w-xl mx-auto">
      <strong>Error:</strong> {error}
    </div>
  )}

</section>
    </div>
  );
};

export default DetalleRutaPage;
