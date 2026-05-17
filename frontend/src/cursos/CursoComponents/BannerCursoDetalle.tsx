import React from "react";
import { BsBarChartFill, BsShieldCheck } from "react-icons/bs";
import { FaClock, FaStar, FaUsers } from "react-icons/fa";
import { API_URL } from "../../config/api";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";

interface BannerCursoDetalleProps {
  titulo: string;
  descripcionCorta: string;
  videoUrl: string;
  imagen: string;
  duracion_total: number | string;
  nivel: string;
  calificacion: number;
  totalResenas: number;
  isPurchased?: boolean;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
}

const BannerCursoDetalle: React.FC<BannerCursoDetalleProps> = ({
  titulo,
  descripcionCorta,
  videoUrl,
  imagen,
  duracion_total,
  nivel,
  calificacion,
  totalResenas,
  isPurchased,
}) => {
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
  
  // Normalizar duración para evitar "undefined Horas"
  const displayDuration = (duracion_total === undefined || duracion_total === "undefined" || !duracion_total) 
    ? "24+" 
    : duracion_total;

  return (
    <div className="relative w-full bg-transparent pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Fondo Enriquecido con Atmósfera Premium */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[70%] bg-sky-500/15 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-purple-600/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-20 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Contenido Principal */}
          <div className="lg:col-span-7 flex flex-col pt-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <div className="px-5 py-2 bg-sky-500/10 border border-sky-400/30 rounded-full text-[11px] font-black text-sky-300 uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(14,165,233,0.15)] flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                Programa Certificado
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">+1,200 alumnos</span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-8xl font-black leading-[1.1] tracking-tight text-white mb-10 italic pr-6 overflow-visible"
            >
              {titulo?.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-gradient-sky drop-shadow-[0_0_15px_rgba(14,165,233,0.2)]" : ""}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-8 mb-12"
            >
              <p className="text-slate-300 text-lg md:text-2xl leading-relaxed max-w-2xl font-light">
                {descripcionCorta}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
                  <FaStar /> {calificacion?.toFixed(1) || "5.0"}
                </span>
                <span className="flex items-center gap-2 text-sky-400 bg-sky-400/10 px-3 py-1.5 rounded-lg border border-sky-400/20">
                  <BsShieldCheck /> Certificado Oficial
                </span>
              </div>

              {isPurchased && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-400/30 px-6 py-3 rounded-2xl w-fit">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Ya tienes acceso a este curso</span>
                </div>
              )}
            </motion.div>

            {/* Bento Grid de Info Rápida - Modernizado */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6"
            >
              <div className="p-6 glass-card rounded-3xl flex flex-col gap-3 hover:bg-white/[0.05] transition-all group">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Duración</span>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaClock className="text-sky-400" size={16} />
                  </div>
                  <span className="text-lg font-black text-white">{displayDuration} Horas</span>
                </div>
              </div>
              
              <div className="p-6 glass-card rounded-3xl flex flex-col gap-3 hover:bg-white/[0.05] transition-all group">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Nivel</span>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BsBarChartFill className="text-sky-400" size={16} />
                  </div>
                  <span className="text-lg font-black text-white">{nivel || "Básico"}</span>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-sky-500/10 to-blue-600/10 border border-sky-500/20 rounded-3xl flex flex-col gap-3 col-span-2 md:col-span-1">
                <span className="text-[10px] text-sky-400 font-black uppercase tracking-[0.2em]">Soporte</span>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-sky-500 animate-ping shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                  <span className="text-lg font-black text-white tracking-tight">Clases en Vivo</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Media Section */}
          <div className="lg:col-span-5 w-full relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="relative"
            >
              {/* Brillo dinámico detrás del video */}
              <div className="absolute -inset-10 bg-sky-500/20 blur-[120px] rounded-full mix-blend-screen opacity-60" />
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-[2.5rem] blur opacity-20" />
              
              <div className="relative aspect-video rounded-[2.5rem] bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl">
                {embedUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    className="absolute inset-0"
                    src={`${embedUrl}?autoplay=0&controls=1&rel=0`}
                    frameBorder="0"
                    allowFullScreen
                    title="Video del curso"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={
                        typeof imagen === "string" && imagen.startsWith("http")
                          ? imagen
                          : typeof imagen === "string"
                          ? `${API_URL}/${imagen.startsWith("/") ? imagen.slice(1) : imagen}`
                          : "/placeholder.jpg"
                      }
                      alt={titulo}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-20 h-20 bg-white/10 border border-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                          <Play fill="white" size={32} className="text-white ml-2" />
                       </div>
                    </div>
                  </div>
                )}
                
                <div className="absolute top-6 right-6 z-20">
                  <div className="px-5 py-2.5 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Preview HD</span>
                  </div>
                </div>
              </div>

              {/* Elementos flotantes decorativos */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 glass-card p-4 rounded-2xl flex items-center gap-3 shadow-2xl border-white/10"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <BsShieldCheck className="text-emerald-400" size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Certificación</div>
                  <div className="text-xs font-black text-white">Verificada</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BannerCursoDetalle;
