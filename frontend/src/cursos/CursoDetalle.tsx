import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BannerCursoDetalle from "./CursoComponents/BannerCursoDetalle";
import CursoSidebar from "./CursoComponents/SidebarCursoDetalle";
import ContenidoCursoDetalle from "./CursoComponents/ContenidoCursoDetalle";
import ObjetivoCursoDetalle from "./CursoComponents/ObjetivoCursoDetalle";
import Comentarios from "./CursoComponents/ComentariosCursoDetalle";
import type { Curso, Modulo, Leccion, Material, Resena } from "../types/models";
import { apiUrl, API_URL } from "../config/api";
import { motion } from "framer-motion";

const CursoDetalle: React.FC = () => {
  const { slug } = useParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [reseñas, setReseñas] = useState<Resena[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Si no hay usuario en localStorage, no intentamos pedir el perfil
      const userStored = localStorage.getItem("user");
      if (!userStored) return;

      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Error al obtener perfil:", err);
      }
    };
    fetchProfile();
  }, []);

  const slugToTitle = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-[#03070c]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-sky-500 font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">Cargando Experiencia</p>
    </div>
  );

  const calificacionPromedio =
    reseñas.length > 0
      ? reseñas.reduce((acc, r) => acc + r.calificacion, 0) / reseñas.length
      : 5.0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchCursoCompleto = async () => {
      if (!slug) {
        // Si no hay slug, simplemente no hacemos nada (evita el error al navegar atrás)
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const resCurso = await fetch(`${API_URL}/cursos/slug/${slug}`, {
          credentials: "include",
        });

        if (!resCurso.ok) {
          if (resCurso.status === 404) {
            setError("El curso solicitado no existe o no está disponible.");
          } else {
            setError("Hubo un problema al cargar la información del curso.");
          }
          setIsLoading(false);
          return;
        }

        const cursoData = await resCurso.json();

        if (!cursoData) {
          setIsLoading(false);
          return;
        }

        setCurso(cursoData);

        const [resModulos, resLecciones, resMateriales, resResenas] =
          await Promise.all([
            fetch(
              `${API_URL}/modulos/curso/${cursoData.id_curso}`,
              { 
                headers: { Accept: "application/json" },
                credentials: "include"
              }
            ),
            fetch(
              `${API_URL}/lecciones/curso/${cursoData.id_curso}`,
              { 
                headers: { Accept: "application/json" },
                credentials: "include"
              }
            ),
            fetch(
              `${API_URL}/materiales?id_curso=${cursoData.id_curso}`,
              { 
                headers: { Accept: "application/json" },
                credentials: "include"
              }
            ),
            fetch(`${API_URL}/resenas/curso/${cursoData.id_curso}`, {
              credentials: "include"
            }),
          ]);

        if (resModulos.ok) {
          const dataModulos = await resModulos.json();
          setModulos(
            (dataModulos.data || []).filter((mod: any) => mod.estado === "Publicado")
          );
        }

        if (resLecciones.ok) {
          const dataLecciones = await resLecciones.json();
          setLecciones(
            (dataLecciones.lecciones?.data || []).filter(
              (l: any) => l.estado === "Publicado"
            )
          );
        }

        if (resMateriales.ok) {
          const dataMateriales = await resMateriales.json();
          setMateriales(
            (dataMateriales.data || []).filter((m: any) => m.estado === "Publicado")
          );
        }

        if (resResenas.ok) {
          const dataResenas = await resResenas.json();
          if (Array.isArray(dataResenas)) {
            setReseñas(dataResenas);
          } else {
            setReseñas(dataResenas.resenas || dataResenas.data || []);
          }
        }

        if (user) {
          const [resCompras, resCarrito] = await Promise.all([
            fetch(`${API_URL}/compras/historial`, {
              headers: { Accept: "application/json" },
              credentials: "include",
            }),
            fetch(`${API_URL}/carrito`, {
              headers: { Accept: "application/json" },
              credentials: "include",
            }),
          ]);

          if (resCompras.ok) {
            const dataCompras = await resCompras.json();
            // La estructura puede variar, intentamos detectar el array de compras
            const historial = dataCompras.compras || dataCompras.data || [];
            setCompras(historial);
          }

          if (resCarrito.ok) {
            const dataCarrito = await resCarrito.json();
            setCarrito(dataCarrito?.data?.items || []);
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
  }, [slug, user?.id_usuario]); // Añadimos el ID del usuario como dependencia

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-20 text-rose-500 font-bold">{error}</div>;
  if (!curso) return <div className="text-center py-20 text-white font-bold">Curso no encontrado</div>;

  const isAdmin = 
    user?.id_rol === 1 || 
    user?.id_rol === 2 || 
    (typeof user?.rol === 'string' && user.rol.toLowerCase().includes("admin")) ||
    (user?.rol?.nombre === 'Admin');

  // Lógica de compra más robusta: revisamos el historial de compras Y también posibles inscripciones directas
  const isPurchased = isAdmin || compras.some((c: any) => {
    const cid = c.curso?.id_curso || c.id_curso || c.idCurso;
    return Number(cid) === Number(curso.id_curso);
  });

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
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6 lg:px-12 py-12 relative z-10">
        <div className="lg:col-span-8 flex flex-col gap-12">
          <ObjetivoCursoDetalle
            aprendizajes={
              curso.lo_que_aprenderas ? curso.lo_que_aprenderas.split(",") : []
            }
          />
          <ContenidoCursoDetalle
            modulos={modulos}
            lecciones={lecciones}
            materiales={materiales}
            isPurchased={isPurchased}
            cursoIdSlug={slug || ""}
          />
          <Comentarios
            cursoId={curso.id_curso}
            reseñasIniciales={reseñas}
            isAuthenticated={!!user}
          />
        </div>
        <div className="lg:col-span-4 relative">
          <div className="sticky top-32">
            <CursoSidebar curso={curso} isPurchased={isPurchased} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoDetalle;
