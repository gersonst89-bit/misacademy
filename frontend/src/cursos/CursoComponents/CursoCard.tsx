import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { API_URL } from "../../config/api";
import { apiClient } from "../../services/apiClient";
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

const nivelBadgeStyles = (nivel?: string) => {
    switch (nivel?.toLowerCase()) {
        case "básico":
        case "basico":
            return "border-emerald-500/20 text-emerald-400 bg-emerald-950/80";
        case "intermedio":
            return "border-amber-500/20 text-amber-400 bg-amber-950/80";
        case "avanzado":
        case "experto":
            return "border-rose-500/20 text-rose-400 bg-rose-950/80";
        default:
            return "border-sky-500/20 text-sky-400 bg-sky-950/80";
    }
};

const cardHoverStyles = (nivel?: string) => {
    switch (nivel?.toLowerCase()) {
        case "básico":
        case "basico":
            return "hover:border-emerald-500/30 hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)]";
        case "intermedio":
            return "hover:border-amber-500/30 hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.25)]";
        case "avanzado":
        case "experto":
            return "hover:border-rose-500/30 hover:shadow-[0_20px_50px_-12px_rgba(244,63,94,0.25)]";
        default:
            return "hover:border-sky-500/30 hover:shadow-[0_20px_50px_-12px_rgba(14,165,233,0.25)]";
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
    const isAuthenticated = !!localStorage.getItem("user");
    const addToCart = async (cursoId: number) => {
        if (!isAuthenticated) {
            showToast("Inicia sesión para agregar al carrito", "error");
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post(`/carrito/agregar`, { id_curso: cursoId }).catch((err: any) => {
                const errorData = err?.response?.data;
                throw new Error(errorData?.message || "Error al añadir");
            });

            showToast("Curso añadido al carrito con éxito", "success");
        } catch (error: any) {
            showToast(error.message || "Error inesperado", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex flex-col text-white bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/5 rounded-[2.25rem] overflow-hidden backdrop-blur-xl shadow-2xl transition-colors transition-shadow duration-300 h-full group ${cardHoverStyles(nivel)}`}
        >
            <Link to={`/curso/${slug || createSlug(title)}`} className="block">
                {/* Floating Image Style */}
                <div className="relative overflow-hidden aspect-[16/10] m-3 rounded-[1.5rem] bg-slate-950 border border-white/5">
                    <img
                        src={
                            typeof image === 'string' && image.startsWith("http")
                                ? image
                                : typeof image === 'string'
                                    ? `${API_URL}/${image.startsWith("/") ? image.slice(1) : image}`
                                    : image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"
                        }
                        alt={title || "Curso"}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"; }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Subtle Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                    {/* Shine Sweep Overlay */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-20 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out pointer-events-none" />

                    {/* Glassmorphic Level Badge */}
                    {nivel && (
                        <span
                            className={`absolute top-3.5 left-3.5 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md transition-colors duration-300 ${nivelBadgeStyles(
                                nivel
                            )}`}
                        >
                            {nivel}
                        </span>
                    )}
                </div>
            </Link>

            <div className="p-6 pt-2 flex flex-col flex-1 relative">
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
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1">Inversión</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white tracking-tighter">{precio}</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(cursoId)}
                        disabled={isLoading}
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-xl ${isLoading
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
