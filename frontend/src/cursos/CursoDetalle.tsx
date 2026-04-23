import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BannerCursoDetalle from "./CursoComponents/BannerCursoDetalle";
import CursoSidebar from "./CursoComponents/SidebarCursoDetalle";
import ContenidoCursoDetalle from "./CursoComponents/ContenidoCursoDetalle";
import ObjetivoCursoDetalle from "./CursoComponents/ObjetivoCursoDetalle";
import Comentarios from "./CursoComponents/ComentariosCursoDetalle";
import type { Curso, Modulo, Leccion, Material, Resena } from "../types/models";
import { apiUrl,API_URL } from "../config/api";

const CursoDetalle: React.FC = () => {
  const { slug } = useParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [reseñas, setReseñas] = useState<Resena[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [, setCarrito] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slugToTitle = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="relative w-12 h-12">
        <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
        <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
      </div>
    </div>
  );

  const calificacionPromedio =
    reseñas.length > 0
      ? reseñas.reduce((acc, r) => acc + r.calificacion, 0) / reseñas.length
      : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchCursoCompleto = async () => {
      if (!slug) {
        setError("No se proporcionó un slug de curso.");
        setIsLoading(false);
        return;
      }

      const tituloCurso = slugToTitle(slug);
      const token = localStorage.getItem("token");

      try {
        setIsLoading(true);

        const resCurso = await fetch(
          `${API_URL}/cursos?titulo=${encodeURIComponent(
            tituloCurso
          )}`
        );

        if (!resCurso.ok) throw new Error("No se pudo cargar el curso.");

        const dataCurso = await resCurso.json();
        
        // Normalizar ambos strings para comparación más flexible
        const normalizarTexto = (texto: string) => 
          texto.toLowerCase().trim().replace(/\s+/g, ' ');
        
        const cursoData = dataCurso.data.find(
          (c: any) => normalizarTexto(c.nombre) === normalizarTexto(tituloCurso)
        );

        if (!cursoData) {
          setError("Curso no encontrado.");
          setIsLoading(false);
          return;
        }

        setCurso(cursoData);

        const [resModulos, resLecciones, resMateriales, resResenas] =
          await Promise.all([
            fetch(
              `${API_URL}/modulos?id_curso=${cursoData.id_curso}`,
              {
                headers: { Accept: "application/json" }
              }
            ),
            fetch(
              `${API_URL}/lecciones?id_curso=${cursoData.id_curso}`,
              {
                headers: { Accept: "application/json" }
              }
            ),
            fetch(
              `${API_URL}/materiales?id_curso=${cursoData.id_curso}`,
              {
                headers: { Accept: "application/json" }
              }
            ),
            fetch(
              `${API_URL}/cursos/${cursoData.id_curso}/resenas`
            ),
          ]);

        if (resModulos.ok) {
          const dataModulos = await resModulos.json();
          setModulos(
            dataModulos.data.filter((mod: any) => mod.estado === "Publicado")
          );
        }

        if (resLecciones.ok) {
          const dataLecciones = await resLecciones.json();
          setLecciones(
            dataLecciones.lecciones.data.filter(
              (l: any) => l.estado === "Publicado"
            )
          );
        }

        if (resMateriales.ok) {
          const dataMateriales = await resMateriales.json();
          setMateriales(
            dataMateriales.data.filter((m: any) => m.estado === "Publicado")
          );
        }

        if (resResenas.ok) {
          const dataResenas = await resResenas.json();
          setReseñas(dataResenas.resenas || dataResenas.data || []);
        }

        if (token) {
          const [resCompras, resCarrito] = await Promise.all([
            fetch(
              `${API_URL}/compras/historial`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(`${API_URL}/carrito`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (resCompras.ok) {
            const dataCompras = await resCompras.json();
            setCompras(dataCompras.data || []);
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
  }, [slug]);

  if (isLoading) return <div className="text-white">{LoadingSpinner()}</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!curso)
    return <div className="text-center text-white">Curso no encontrado</div>;

  return (
    <div className="text-white pt-8 pb-9 mx-auto">
      <BannerCursoDetalle
        titulo={curso.nombre}
        descripcionCorta={curso.descripcion_corta || ""}
        videoUrl={curso.video_previsualizacion || ""}
        duracion_total={`${curso.duracion} horas`}
        nivel={curso.nivel}
        calificacion={calificacionPromedio}
        totalResenas={reseñas.length}
      />

      <div className="text-white mx-auto grid grid-cols-1 md:grid-cols-6 gap-8 px-6 md:px-10 pt-8">
        <div className="col-span-1 md:col-span-4 flex flex-col gap-8 md:w-[92%]">
          <ObjetivoCursoDetalle
            aprendizajes={
              curso.lo_que_aprenderas ? curso.lo_que_aprenderas.split(",") : []
            }
          />
          <ContenidoCursoDetalle
            modulos={modulos}
            lecciones={lecciones}
            materiales={materiales}
          />
          <Comentarios
            cursoId={curso.id_curso}
            reseñasIniciales={reseñas}
            isAuthenticated={!!localStorage.getItem("token")}
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <div className="md:w-[115%] md:ml-[-15%] sticky top-8">
            <CursoSidebar curso={curso} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoDetalle;
