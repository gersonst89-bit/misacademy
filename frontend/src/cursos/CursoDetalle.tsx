import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BannerCursoDetalle from "./CursoComponents/BannerCursoDetalle";
import CursoSidebar from "./CursoComponents/SidebarCursoDetalle";
import ContenidoCursoDetalle from "./CursoComponents/ContenidoCursoDetalle";
import ObjetivoCursoDetalle from "./CursoComponents/ObjetivoCursoDetalle";
import Comentarios from "./CursoComponents/ComentariosCursoDetalle";
import type { Curso, Modulo, Leccion, Material, Resena } from "../types/models";
import { apiClient } from "../services/apiClient";

// ─── Accent theme mapper ──────────────────────────────────────────────────────
const getAccentTheme = (lineaNombre: string) => {
  const n = (lineaNombre || "").toLowerCase();
  if (n.includes("ia") || n.includes("inteligencia"))
    return {
      text: "text-purple-400",
      barBg: "bg-purple-500",
      badgeBg: "bg-purple-500/10 border-purple-500/20",
      btnGradient: "from-purple-600 to-indigo-500",
      btnShadowRgba: "rgba(168,85,247,0.35)",
      textGrad: "from-purple-400 via-white to-purple-600",
      glow1: "bg-purple-500/15",
      glow2: "bg-indigo-600/10",
      chevronBg: "group-hover:bg-purple-500/10",
      hoverBorder: "hover:border-purple-500/30",
      hoverTitle: "group-hover:text-purple-400",
    };
  if (n.includes("teacher") || n.includes("docente") || n.includes("educa"))
    return {
      text: "text-emerald-400",
      barBg: "bg-emerald-500",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20",
      btnGradient: "from-emerald-500 to-teal-400",
      btnShadowRgba: "rgba(16,185,129,0.35)",
      textGrad: "from-emerald-400 via-white to-emerald-600",
      glow1: "bg-emerald-500/15",
      glow2: "bg-teal-600/10",
      chevronBg: "group-hover:bg-emerald-500/10",
      hoverBorder: "hover:border-emerald-500/30",
      hoverTitle: "group-hover:text-emerald-400",
    };
  if (n.includes("business") || n.includes("negocio") || n.includes("empresa"))
    return {
      text: "text-amber-400",
      barBg: "bg-amber-500",
      badgeBg: "bg-amber-500/10 border-amber-500/20",
      btnGradient: "from-amber-500 to-orange-400",
      btnShadowRgba: "rgba(245,158,11,0.35)",
      textGrad: "from-amber-400 via-white to-amber-600",
      glow1: "bg-amber-500/15",
      glow2: "bg-orange-600/10",
      chevronBg: "group-hover:bg-amber-500/10",
      hoverBorder: "hover:border-amber-500/30",
      hoverTitle: "group-hover:text-amber-400",
    };
  // Default = DEV
  return {
    text: "text-sky-400",
    barBg: "bg-sky-500",
    badgeBg: "bg-sky-500/10 border-sky-500/20",
    btnGradient: "from-sky-600 to-blue-500",
    btnShadowRgba: "rgba(14,165,233,0.35)",
    textGrad: "from-sky-400 via-white to-sky-600",
    glow1: "bg-sky-500/15",
    glow2: "bg-blue-600/10",
    chevronBg: "group-hover:bg-sky-500/10",
    hoverBorder: "hover:border-sky-500/30",
    hoverTitle: "group-hover:text-sky-400",
  };
};

const CursoDetalle: React.FC = () => {
  const { slug } = useParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [reseñas, setReseñas] = useState<Resena[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [lineaNombre, setLineaNombre] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      const userStored = localStorage.getItem("user");
      if (!userStored) return;
      try {
        const res = await apiClient.get("/auth/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Error al obtener perfil:", err);
      }
    };
    fetchProfile();
  }, []);

  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-[#03070c]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-sky-500 font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">
        Cargando Experiencia
      </p>
    </div>
  );

  const calificacionPromedio =
    reseñas.length > 0 ? reseñas.reduce((acc, r) => acc + r.calificacion, 0) / reseñas.length : 5.0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchCursoCompleto = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        const resCurso = await apiClient.get(`/cursos/slug/${slug}`).catch((err: any) => {
          if (err?.response?.status === 404) {
            setError("El curso solicitado no existe o no está disponible.");
          } else {
            setError("Hubo un problema al cargar la información del curso.");
          }
          setIsLoading(false);
          return null;
        });

        if (!resCurso) return;
        const cursoData = resCurso.data;
        setCurso(cursoData);

        // Intentar deducir la linea académica encontrando a qué ruta pertenece este curso
        try {
          const resRutas = await apiClient.get("/rutas-academicas");
          const rutasRaw = resRutas.data?.data || resRutas.data || [];
          const cursoIdNum = Number(cursoData.id_curso);

          // Buscar una ruta que contenga este id_curso
          const matchingRuta = rutasRaw.find((ruta: any) => {
            const listCursos = ruta.cursos || [];
            return listCursos.some((c: any) => Number(c.id_curso || c.id || c) === cursoIdNum);
          });

          if (matchingRuta?.linea_academica?.nombre) {
            setLineaNombre(matchingRuta.linea_academica.nombre);
          } else if (matchingRuta?.lineaAcademica?.nombre) {
            setLineaNombre(matchingRuta.lineaAcademica.nombre);
          } else {
            // Fallback: Inferir de las rutas asociadas en el curso
            const cursoRuta = cursoData.rutas?.[0];
            const rutaId = typeof cursoRuta === "object" ? cursoRuta?.id_ruta : cursoRuta;
            if (rutaId) {
              const resRutaDetalle = await apiClient.get(`/rutas-academicas/${rutaId}`).catch(() => null);
              const rName = resRutaDetalle?.data?.linea_academica?.nombre || resRutaDetalle?.data?.lineaAcademica?.nombre;
              if (rName) setLineaNombre(rName);
            }
          }
        } catch (e) {
          console.warn("No se pudo deducir la línea académica para este curso, usando default Dev.");
        }

        const [resModulos, resLecciones, resMateriales, resResenas] = await Promise.all([
          apiClient.get(`/modulos/curso/${cursoData.id_curso}`).catch(() => null),
          apiClient.get(`/lecciones/curso/${cursoData.id_curso}`).catch(() => null),
          apiClient.get(`/materiales?id_curso=${cursoData.id_curso}`).catch(() => null),
          apiClient.get(`/resenas/curso/${cursoData.id_curso}`).catch(() => null),
        ]);

        if (resModulos) {
          const dataModulos = resModulos.data;
          setModulos((dataModulos.data || []).filter((mod: any) => mod.estado === "Publicado"));
        }

        if (resLecciones) {
          const dataLecciones = resLecciones.data;
          setLecciones((dataLecciones.lecciones?.data || []).filter((l: any) => l.estado === "Publicado"));
        }

        if (resMateriales) {
          const dataMateriales = resMateriales.data;
          setMateriales((dataMateriales.data || []).filter((m: any) => m.estado === "Publicado"));
        }

        if (resResenas) {
          const dataResenas = resResenas.data;
          if (Array.isArray(dataResenas)) {
            setReseñas(dataResenas);
          } else {
            setReseñas(dataResenas.resenas || dataResenas.data || []);
          }
        }

        if (user) {
          const [resCompras] = await Promise.all([
            apiClient.get(`/compras/historial`).catch(() => null)
          ]);

          if (resCompras) {
            const dataCompras = resCompras.data;
            const historial = dataCompras.compras || dataCompras.data || [];
            setCompras(historial);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error cargando curso:", err);
        setError("Error al cargar los datos del curso.");
        setIsLoading(false);
      }
    };

    fetchCursoCompleto();
  }, [slug, user?.id_usuario]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-20 text-rose-500 font-bold">{error}</div>;
  if (!curso) return <div className="text-center py-20 text-white font-bold">Curso no encontrado</div>;

  const isAdmin =
    user?.id_rol === 1 ||
    user?.id_rol === 2 ||
    (typeof user?.rol === "string" && user.rol.toLowerCase().includes("admin")) ||
    user?.rol?.nombre === "Admin";

  const isPurchased =
    isAdmin ||
    compras.some((c: any) => {
      const cid = c.curso?.id_curso || c.id_curso || c.idCurso;
      return Number(cid) === Number(curso.id_curso);
    });

  const accent = getAccentTheme(lineaNombre);

  return (
    <div className="bg-[#03070c] min-h-screen">
      <BannerCursoDetalle
        titulo={curso.nombre}
        descripcionCorta={curso.descripcion_corta || ""}
        videoUrl={curso.video_previsualizacion || ""}
        imagen={curso.imagen || ""}
        duracion_total={curso.duracion}
        nivel={curso.nivel}
        calificacion={calificacionPromedio}
        totalResenas={reseñas.length}
        isPurchased={isPurchased}
        accent={accent}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6 lg:px-12 py-12 relative z-10">
        <div className="lg:col-span-8 flex flex-col gap-12">
          <ObjetivoCursoDetalle
            aprendizajes={curso.lo_que_aprenderas ? curso.lo_que_aprenderas.split(",") : []}
            accent={accent}
          />
          <ContenidoCursoDetalle
            modulos={modulos}
            lecciones={lecciones}
            materiales={materiales}
            isPurchased={isPurchased}
            cursoIdSlug={slug || ""}
            accent={accent}
          />
          <Comentarios cursoId={curso.id_curso} reseñasIniciales={reseñas} isAuthenticated={!!user} />
        </div>
        <div className="lg:col-span-4 relative">
          <div className="sticky top-32">
            <CursoSidebar curso={curso} isPurchased={isPurchased} accent={accent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoDetalle;
