"use client";

import { useEffect, useState } from "react";
import { FaPlay, FaGraduationCap, FaArrowRight } from "react-icons/fa";
import { Sparkles, BookOpen, Clock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { motion } from "framer-motion";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-black">
    <div className="relative w-16 h-16">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-full h-full animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-10 h-10 top-3 left-3 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 30;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-[60px] h-[60px] flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="rgba(255,255,255,0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#38bdf8"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-[10px] font-black text-sky-400">
        {percentage}%
      </span>
    </div>
  );
};

interface Curso {
  id_curso: number;
  nombre: string;
  descripcion?: string;
  imagen?: string | null;
}

interface Compra {
  id_pago: number;
  fecha_pago: string;
  precio: number;
  curso: Curso;
  progreso?: number; 
}

export default function MisCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const res = await fetch(`${API_URL}/compras/historial`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await res.json();
        if (res.ok && data.status === "success" && Array.isArray(data.compras)) {
          const comprasConProgreso = await Promise.all(
            data.compras.map(async (compra: Compra) => {
              try {
                const progresoRes = await fetch(`${API_URL}/cursos/${compra.curso.id_curso}/progreso`, {
                  headers: { Accept: "application/json" }
                });
                const progresoData = await progresoRes.json();
                return {
                  ...compra,
                  progreso: progresoData.progreso || 0
                };
              } catch {
                return { ...compra, progreso: 0 };
              }
            })
          );
          setCompras(comprasConProgreso);
        }
      } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        setError("Error de conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, []);

  const handleCompraClick = async (cursoId: number) => {
    try {
      const res = await fetch(`${API_URL}/cursos/${cursoId}/contenido`, {
        headers: { Accept: "application/json" }
      });
      const data = await res.json();
      
      let targetLeccionId = null;
      if (Array.isArray(data) && data.length > 0) {
        // Buscar la primera lección no completada
        for (const mod of data) {
          const lec = mod.lecciones?.find((l: any) => l.progreso?.estado !== 'Completado');
          if (lec) {
            targetLeccionId = lec.id_leccion;
            break;
          }
        }
        // Si todas están completadas, ir a la primera
        if (!targetLeccionId) targetLeccionId = data[0].lecciones?.[0]?.id_leccion;
      }

      if (targetLeccionId) {
        navigate(`/video-page/${cursoId}?leccion=${targetLeccionId}`);
      } else {
        // Fallback al slug del curso (necesitamos el curso para el slug)
        const c = compras.find(com => com.curso.id_curso === cursoId)?.curso;
        const slug = c?.nombre.toLowerCase().replace(/\s+/g, '-');
        navigate(`/video-page/${slug}`);
      }
    } catch {
      navigate(`/video-page/${cursoId}`);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && (user.id_rol === 1 || user.id_rol === 2)) {
      navigate("/admin");
    }
  }, [navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-sky-500/30 font-['Inter']">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10">
        {/* Header Section */}
        <div className="mb-20 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
             <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-sky-400 text-xl" />
             </div>
             <span className="text-[10px] font-black tracking-[0.4em] text-slate-600 uppercase font-['Outfit']">Panel del Estudiante</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 uppercase leading-[1.1] font-['Outfit']">
            Mis <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">Cursos</span>
          </h1>
          <p className="text-slate-500 max-w-xl text-lg leading-relaxed font-light font-['Inter']">
            Bienvenido de nuevo. Continúa tu formación profesional y alcanza tus metas hoy mismo.
          </p>
        </div>

        {compras.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center backdrop-blur-xl"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
               <BookOpen className="text-slate-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Aún no tienes cursos inscritos</h2>
            <p className="text-slate-500 mb-10 max-w-md mx-auto">
              Explora nuestro catálogo y comienza tu camino hacia la excelencia profesional hoy mismo.
            </p>
            <Link to="/cursos" className="inline-flex items-center gap-3 px-10 py-5 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)]">
              Ver Catálogo <FaArrowRight />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              // Obtener todos los IDs de cursos que pertenecen a rutas compradas
              const idsCursosEnRutas = new Set(
                compras
                  .filter(c => !c.curso && (c as any).ruta?.cursos_ids)
                  .flatMap(c => (c as any).ruta.cursos_ids)
              );

              // Filtrar la lista de compras
              const comprasFiltradas = compras.filter(c => {
                if (c.curso) {
                  // Si es un curso, solo mostrarlo si NO pertenece a ninguna ruta comprada
                  return !idsCursosEnRutas.has(c.curso.id_curso);
                }
                // Las rutas siempre se muestran
                return true;
              });

              return comprasFiltradas.map((compra, idx) => {
                const isCurso = !!compra.curso;
                const data = isCurso ? compra.curso : (compra as any).ruta;
                if (!data) return null;

              return (
                <motion.div
                  key={compra.id_pago}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-sky-500/30 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
                >
                  {/* Image Section */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={data.imagen || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"}
                      alt={isCurso ? (data as any).nombre : (data as any).nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    
                    {/* Play Overlay */}
                    <div 
                      onClick={() => {
                        if (isCurso) {
                          handleCompraClick(data.id_curso);
                        } else {
                          const lineaSlug = (data as any).linea_slug || 'linea';
                          const rutaSlug = (data as any).slug || (data as any).nombre.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/lineas-academicas/${lineaSlug}/${rutaSlug}`);
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center shadow-2xl shadow-sky-500/50 scale-75 group-hover:scale-100 transition-transform duration-500">
                         <FaPlay className="text-black ml-1 text-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`px-3 py-1 ${isCurso ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'} border rounded-full text-[9px] font-black uppercase tracking-widest`}>
                         {isCurso ? 'Curso Individual' : 'Ruta Académica'}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-sky-400 transition-colors">
                      {data.nombre}
                    </h3>
                    
                    {/* Progress Section (Solo para cursos) */}
                    {isCurso && (
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-5 mb-8 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <CircularProgress percentage={compra.progreso || 0} />
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tu Progreso</p>
                               <p className="text-sm font-bold">{compra.progreso === 100 ? 'Completado' : 'Continuar Aprendiendo'}</p>
                            </div>
                         </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (isCurso) {
                          handleCompraClick(data.id_curso);
                        } else {
                          const lineaSlug = (data as any).linea_slug || 'linea';
                          const rutaSlug = (data as any).slug || (data as any).nombre.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/lineas-academicas/${lineaSlug}/${rutaSlug}`);
                        }
                      }}
                      className="w-full py-5 bg-white/5 hover:bg-sky-500 border border-white/10 hover:border-sky-400 text-white hover:text-black font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      {isCurso ? 'Entrar al Aula' : 'Ver Mi Ruta'} <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
                  );
                });
              })()}
          </div>
        )}
      </div>
    </div>
  );
}
