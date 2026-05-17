import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCartPlus, FaCheck } from "react-icons/fa";
import type { Curso } from "../../types/models";
import { API_URL } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/useToast";

const CursoSidebar: React.FC<{ curso: Curso; isPurchased?: boolean }> = ({ curso, isPurchased: isPurchasedProp }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
  const [isPurchased, setIsPurchased] = useState<boolean>(!!isPurchasedProp);

  const isAuthenticated = !!(typeof window !== "undefined" && document.cookie.includes("is_logged_in"));

  useEffect(() => {
    setIsPurchased(!!isPurchasedProp);
  }, [isPurchasedProp]);

  useEffect(() => {
    const checkEstadoCurso = async () => {
      if (!isAuthenticated) return;

      try {
        const responseCarrito = await fetch(`${API_URL}/carrito?t=${Date.now()}`, {
          credentials: "include",
        });

        if (!responseCarrito.ok) throw new Error("Error al obtener el carrito");

        const dataCarrito = await responseCarrito.json();

        if (dataCarrito && Array.isArray(dataCarrito.data?.items)) {
          const cursoEnCarrito = dataCarrito.data.items.some(
            (item: any) =>
              Number(item.curso?.id_curso) === Number(curso.id_curso)
          );
          setIsAddedToCart(cursoEnCarrito);
        }
      } catch (error) {
        console.error("Error al verificar carrito:", error);
      }
    };

    checkEstadoCurso();
  }, [curso.id_curso, isAuthenticated]);

  const handleAction = async () => {
    if (isPurchased) {
      navigate(`/video-page/${curso.id_curso}`);
      return;
    }

    if (!isAuthenticated) {
      showToast("Por favor, ingresa sesión para agregar el curso al carrito.", "info");
      return;
    }

    if (isAddedToCart) {
      navigate("/carrito");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/carrito/agregar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_curso: curso.id_curso }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error al añadir al carrito.");
      }

      setIsAddedToCart(true);
      showToast("Curso añadido al carrito con éxito.", "success");
    } catch (error: unknown) {
      if (error instanceof Error)
        showToast(error.message || "Error inesperado.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  let buttonBg = "bg-sky-500 shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)]";
  let buttonHover = "hover:bg-sky-400 hover:scale-[1.02]";
  let buttonLabel = "Inscribirse ahora";
  let ButtonIcon: React.ComponentType<{ className?: string }> = FaCartPlus;

  if (isPurchased) {
    buttonBg = "bg-white text-black";
    buttonHover = "hover:bg-slate-200 hover:scale-[1.02]";
    buttonLabel = "Ir a mi aula";
    ButtonIcon = FaCheck;
  } else if (isLoading) {
    buttonBg = "bg-slate-800";
    buttonHover = "";
    buttonLabel = "Añadiendo...";
    ButtonIcon = FaCartPlus;
  } else if (isAddedToCart) {
    buttonBg = "bg-emerald-500 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]";
    buttonHover = "hover:bg-emerald-400 hover:scale-[1.02]";
    buttonLabel = "Ver en el carrito";
    ButtonIcon = FaCartPlus;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="glass-card rounded-[2.5rem] p-10 flex flex-col gap-10 sticky top-24 z-20"
    >
      <section className="border-b border-white/5 pb-8">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 block">Inversión Total</span>
            <p className="text-5xl font-black text-white tracking-tighter italic">
              S/. {curso.precio}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAction}
            disabled={isLoading}
            className={`relative group/btn overflow-hidden ${buttonBg} ${buttonHover} w-full font-black py-5 rounded-2xl flex items-center justify-center gap-x-3 transition-all duration-300 shadow-xl disabled:opacity-50`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <ButtonIcon className="text-lg relative z-10" />
            <span className="text-xs tracking-[0.2em] relative z-10 uppercase">{buttonLabel}</span>
          </motion.button>
          
          <p className="text-[10px] text-center text-slate-500 font-medium tracking-tight">Acceso inmediato y de por vida</p>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-sky-500 mb-6">
          {curso.docente ? "Instructor Principal" : "Instructores"}
        </h2>
        {curso.docente ? (
          <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors group/instructor cursor-default">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-sky-500/30 shadow-2xl shrink-0 group-hover/instructor:border-sky-500 transition-colors">
              <img
                src={
                  curso.docente?.imagen_perfil
                    ? curso.docente.imagen_perfil.startsWith("http")
                      ? curso.docente.imagen_perfil
                      : `${API_URL}/${curso.docente.imagen_perfil.startsWith("/") ? curso.docente.imagen_perfil.slice(1) : curso.docente.imagen_perfil}`
                    : "/sinUsuario.jpg"
                }
                alt={curso.docente.nombre}
                className="w-full h-full object-cover group-hover/instructor:scale-110 transition-transform duration-500"
              />
            </div>
            <div>
              <p className="font-bold text-lg text-white leading-tight group-hover/instructor:text-sky-400 transition-colors">{curso.docente.nombre}</p>
              <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest mt-1">Mentor Senior</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm italic">No hay docente asignado.</p>
        )}
      </section>

      <section>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-6">Requisitos Previos</h2>
        <ul className="space-y-4">
          {curso.requisitos ? (
            curso.requisitos
              .split(",")
              .map((item, i) => (
                <li key={i} className="flex items-start gap-3 group/req">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/req:bg-amber-500/20 transition-colors">
                    <FaCheck className="text-amber-500 text-[10px]" />
                  </div>
                  <span className="text-slate-300 text-sm font-light leading-relaxed group-hover/req:text-slate-100 transition-colors">{item.trim()}</span>
                </li>
              ))
          ) : (
            <p className="text-slate-500 text-sm italic">Sin requisitos técnicos específicos.</p>
          )}
        </ul>
      </section>

    </motion.div>
  );
};

export default CursoSidebar;
