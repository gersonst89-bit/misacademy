import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCartPlus, FaCheck } from 'react-icons/fa';
import type { Curso } from '../../types/models';
import { API_URL } from '../../config/api';
import { apiClient } from '../../services/apiClient';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';

interface CursoSidebarProps {
  curso: Curso;
  isPurchased?: boolean;
  accent?: {
    text: string;
    barBg: string;
    badgeBg: string;
    btnGradient: string;
    btnShadowRgba: string;
  };
}

const CursoSidebar: React.FC<CursoSidebarProps> = ({
  curso,
  isPurchased: isPurchasedProp,
  accent = {
    text: 'text-sky-400',
    barBg: 'bg-sky-500',
    badgeBg: 'bg-sky-500/10 border-sky-500/20',
    btnGradient: 'from-sky-600 to-blue-500',
    btnShadowRgba: 'rgba(14,165,233,0.35)',
  },
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
  const [isPurchased, setIsPurchased] = useState<boolean>(!!isPurchasedProp);

  const isAuthenticated = !!localStorage.getItem('user');

  useEffect(() => {
    setIsPurchased(!!isPurchasedProp);
  }, [isPurchasedProp]);

  useEffect(() => {
    const checkEstadoCurso = async () => {
      if (!isAuthenticated) return;

      try {
        const responseCarrito = await apiClient.get(`/carrito?t=${Date.now()}`);

        const dataCarrito = responseCarrito.data;

        if (dataCarrito && Array.isArray(dataCarrito.data?.items)) {
          const cursoEnCarrito = dataCarrito.data.items.some(
            (item: any) => Number(item.curso?.id_curso) === Number(curso.id_curso),
          );

          setIsAddedToCart(cursoEnCarrito);
        }
      } catch (error) {
        console.error('Error al verificar carrito:', error);
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
      showToast('Por favor, ingresa sesión para agregar el curso al carrito.', 'info');
      return;
    }

    if (isAddedToCart) {
      navigate('/carrito');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient
        .post(`/carrito/agregar`, {
          id_curso: curso.id_curso,
        })
        .catch((err: any) => {
          const errorData = err?.response?.data;

          throw new Error(errorData?.message || 'Error al añadir al carrito.');
        });

      setIsAddedToCart(true);

      showToast('Curso añadido al carrito con éxito.', 'success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message || 'Error inesperado.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  let buttonBg = 'bg-sky-500';
  let buttonLabel = 'Inscribirse ahora';
  let ButtonIcon: React.ComponentType<{
    className?: string;
  }> = FaCartPlus;

  if (isPurchased) {
    buttonBg = 'bg-white text-black hover:bg-slate-200';
    buttonLabel = 'Ir a mi aula';
    ButtonIcon = FaCheck;
  } else if (isLoading) {
    buttonBg = 'bg-slate-800 text-slate-400';
    buttonLabel = 'Añadiendo...';
    ButtonIcon = FaCartPlus;
  } else if (isAddedToCart) {
    buttonBg = 'bg-emerald-500 hover:bg-emerald-400 text-white';
    buttonLabel = 'Ver en el carrito';
    ButtonIcon = FaCartPlus;
  }

  return (
    <div className="glass-card rounded-[2.25rem] p-8 flex flex-col gap-8 border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Glow de fondo */}
      <div
        className={`absolute top-0 right-0 w-28 h-28 ${accent.barBg}/5 blur-3xl rounded-full -z-10`}
      />

      {/* =========================================================
          PRECIO + CTA
      ========================================================= */}
      <section className="relative border-b border-white/5 pb-7">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

        <div className="flex flex-col gap-5">
          <div className="text-center">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.25em] mb-2 block">
              Inversión Total
            </span>

            <p className="text-5xl font-black text-white tracking-tighter italic">
              S/. {curso.precio}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAction}
            disabled={isLoading}
            className={`relative group/btn overflow-hidden ${
              isPurchased || isAddedToCart ? buttonBg : 'text-white hover:scale-[1.02]'
            } w-full font-black py-4 rounded-2xl flex items-center justify-center gap-x-3 transition-all duration-300 shadow-xl disabled:opacity-50`}
            style={
              !isPurchased && !isAddedToCart && !isLoading
                ? {
                    boxShadow: `0 20px 40px -10px ${accent.btnShadowRgba}`,
                  }
                : {}
            }
          >
            {!isPurchased && !isAddedToCart && !isLoading && (
              <div
                className={`absolute inset-0 bg-gradient-to-r ${accent.btnGradient} group-hover/btn:scale-105 transition-transform duration-500`}
              />
            )}

            <ButtonIcon className="text-lg relative z-10" />

            <span className="text-xs tracking-[0.2em] relative z-10 uppercase">{buttonLabel}</span>
          </motion.button>

          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

            <p className="text-[9px] text-slate-500 font-medium tracking-tight">
              Acceso inmediato y de por vida
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          INSTRUCTOR
      ========================================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${accent.text}`}>
            {curso.docente ? 'Instructor Principal' : 'Instructor'}
          </h2>

          {curso.docente && (
            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
              Asignado
            </span>
          )}
        </div>

        {curso.docente ? (
          <div className="flex items-center gap-4 p-4 bg-white/[0.035] rounded-2xl border border-white/[0.07] hover:bg-white/[0.055] hover:border-white/10 transition-all duration-300 group/instructor">
            <div
              className={`w-14 h-14 rounded-2xl overflow-hidden border ${
                accent.badgeBg.replace('bg-', 'border-').split(' ')[0]
              } shadow-lg shrink-0 bg-[#071018]`}
            >
              <img
                src={
                  curso.docente?.imagen_perfil
                    ? curso.docente.imagen_perfil.startsWith('http')
                      ? curso.docente.imagen_perfil
                      : `${API_URL}/${
                          curso.docente.imagen_perfil.startsWith('/')
                            ? curso.docente.imagen_perfil.slice(1)
                            : curso.docente.imagen_perfil
                        }`
                    : '/sinUsuario.jpg'
                }
                alt={curso.docente.nombre}
                className="w-full h-full object-cover group-hover/instructor:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-base text-white leading-tight truncate">
                {curso.docente.nombre}
              </p>

              <p
                className={`text-[9px] ${accent.text} font-black uppercase tracking-[0.16em] mt-1`}
              >
                Mentor Senior
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
              <span className="text-slate-500 text-sm">—</span>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-300">Aún no hay instructor asignado</p>

              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Este curso todavía no cuenta con un instructor principal.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          REQUISITOS
      ========================================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Requisitos Previos
          </h2>

          {!curso.requisitos && (
            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
              Accesible
            </span>
          )}
        </div>

        {curso.requisitos ? (
          <div className="space-y-2.5">
            {curso.requisitos.split(',').map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <FaCheck className="text-amber-400 text-[10px]" />
                </div>

                <span className="text-slate-300 text-sm font-light leading-relaxed">
                  {item.trim()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/[0.10]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
              <FaCheck className="text-emerald-400 text-sm" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200">
                No se requieren conocimientos previos
              </p>

              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Puedes comenzar este curso sin requisitos técnicos específicos.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CursoSidebar;
