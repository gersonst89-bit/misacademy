import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { API_URL } from "../../config/api";
import { useToast } from "../../hooks/useToast";

const createSlug = (title: string): string => {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const nivelColor = (nivel: string) => {
  switch (nivel?.toLowerCase()) {
    case "básico":
    case "basico":
      return "from-emerald-500 to-teal-600";
    case "intermedio":
      return "from-amber-400 to-orange-600";
    case "avanzado":
    case "experto":
      return "from-rose-500 to-red-700";
    default:
      return "from-sky-500 to-blue-600";
  }
};

interface CursoCardProps {
  title: string;
  description: string;
  precio: string;
  image: string;
  slug: string;
  cursoId: number;
  nivel?: string;
}

const CursoCard: React.FC<CursoCardProps> = ({
  title,
  description,
  precio,
  image,
  slug,
  cursoId,
  nivel,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAuthenticated = !!(typeof window !== "undefined" && document.cookie.includes("is_logged_in"));

  const addToCart = async (cursoId: number) => {
    if (!isAuthenticated) {
      showToast("Inicia sesión para agregar al carrito", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/carrito/agregar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id_curso: cursoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al añadir");
      }

      showToast("Curso añadido al carrito con éxito", "success");
    } catch (error: any) {
      showToast(error.message || "Error inesperado", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col text-white glass-card glass-card-hover rounded-[2rem] overflow-hidden group h-full border border-white/5"
    >
      <Link to={`/curso/${slug || createSlug(title)}`} className="block overflow-hidden relative aspect-[16/10]">
        <img
          src={
            typeof image === 'string' && image.startsWith("http")
              ? image
              : typeof image === 'string'
              ? `${API_URL}/${image.startsWith("/") ? image.slice(1) : image}`
              : image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"
          }
          alt={title || "Curso"}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"; }}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        {/* Overlay premium */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03070c] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badge de nivel - Modernizado */}
        {nivel && (
          <div className="absolute top-5 left-5 z-10">
            <span
              className={`text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-lg text-white shadow-xl backdrop-blur-xl bg-gradient-to-br ${nivelColor(
                nivel
              )} border border-white/20`}
            >
              {nivel}
            </span>
          </div>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-1 relative">
        <Link to={`/curso/${slug || createSlug(title)}`}>
          <h3 className="text-xl font-bold mb-4 text-left leading-[1.2] group-hover:text-sky-400 transition-colors duration-300 line-clamp-2 min-h-[3.5rem] flex items-center tracking-tight">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-slate-400/80 mb-6 text-left line-clamp-2 font-medium leading-relaxed min-h-[3rem]">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.1em] mb-1">Inversión</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white tracking-tighter">{precio}</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addToCart(cursoId)}
            disabled={isLoading}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-xl ${
              isLoading
                ? "bg-slate-800"
                : "bg-white text-black hover:bg-sky-400 hover:text-white"
            }`}
            title="Añadir al carrito"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={20} />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CursoCard;
