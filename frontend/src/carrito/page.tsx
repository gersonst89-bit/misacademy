'use client';

import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config/api';
import { apiClient } from '../services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-black">
    <div className="relative w-16 h-16">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-full h-full animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-10 h-10 top-3 left-3 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

interface Curso {
  id_curso: number;
  titulo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
}

interface Ruta {
  id_ruta: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
}

interface CarritoItem {
  id_item: number;
  curso?: Curso;
  ruta?: Ruta;
  precio: number;
}

interface CarritoData {
  id_carrito: number;
  items: CarritoItem[];
}

export default function Carrito() {
  const [carrito, setCarrito] = useState<CarritoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [compras, setCompras] = useState<any[]>([]);

  // Estados para solicitar DNI antes del pago
  const [showDniModal, setShowDniModal] = useState(false);
  const [dni, setDni] = useState('');
  const [savingDni, setSavingDni] = useState(false);
  const [dniError, setDniError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchCarrito = async () => {
    try {
      const [resCarrito, resCompras] = await Promise.all([
        apiClient.get(`/carrito?t=${Date.now()}`).catch((err: any) => {
          if (err?.response?.status === 401) {
            navigate('/login?expired=true');
          }

          throw err;
        }),

        apiClient.get(`/compras/historial?t=${Date.now()}`).catch((err: any) => {
          throw err;
        }),
      ]);

      const dataCarrito = resCarrito.data;
      const dataCompras = resCompras.data;

      if (dataCarrito && dataCarrito.data) {
        setCarrito(dataCarrito.data);
      } else {
        setCarrito({
          id_carrito: 0,
          items: [],
        });
      }

      setCompras(dataCompras.compras || dataCompras.data || []);
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrito();
  }, []);

  const eliminarCurso = async (id_item: number) => {
    try {
      await apiClient.delete(`/carrito/${id_item}`);

      setCarrito((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          items: prev.items.filter((item) => item.id_item !== id_item),
        };
      });

      setMensaje('Eliminado correctamente');

      setTimeout(() => setMensaje(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const isItemOwned = (item: CarritoItem) => {
    return compras.some(
      (c: any) =>
        (item.curso &&
          (c.curso?.id_curso === item.curso.id_curso || c.id_curso === item.curso.id_curso)) ||
        (item.ruta && (c.ruta?.id_ruta === item.ruta.id_ruta || c.id_ruta === item.ruta.id_ruta)),
    );
  };

  const subtotal = carrito?.items.reduce((acc, item) => acc + Number(item.precio || 0), 0) || 0;

  const totalAPagar =
    carrito?.items.reduce((acc, item) => {
      if (isItemOwned(item)) return acc;

      return acc + Number(item.precio || 0);
    }, 0) || 0;

  // =========================================================
  // VERIFICAR DNI ANTES DE CONTINUAR AL PAGO
  // =========================================================
  const procederAlPago = async () => {
    if (!carrito || carrito.items.length === 0) return;

    try {
      const response = await apiClient.get(`/auth/profile?t=${Date.now()}`);

      const user = response.data;

      // Si ya tiene DNI, continúa normalmente
      if (user?.dni) {
        localStorage.setItem('carritoData', JSON.stringify(carrito));

        navigate('/pago');
        return;
      }

      // Si no tiene DNI, mostramos el modal
      setDni('');
      setDniError(null);
      setShowDniModal(true);
    } catch (error: any) {
      console.error('Error al verificar perfil:', error);

      if (error?.response?.status === 401) {
        navigate('/login?expired=true');
        return;
      }

      setMensaje('No se pudo verificar tu información personal.');

      setTimeout(() => setMensaje(null), 3000);
    }
  };

  // =========================================================
  // GUARDAR DNI Y CONTINUAR AL PAGO
  // =========================================================
  const guardarDniYContinuar = async () => {
    const dniLimpio = dni.trim();

    if (!/^\d{8}$/.test(dniLimpio)) {
      setDniError('Ingresa un DNI válido de 8 dígitos.');
      return;
    }

    try {
      setSavingDni(true);
      setDniError(null);

      await apiClient.patch('/auth/profile/dni', {
        dni: dniLimpio,
      });

      localStorage.setItem('carritoData', JSON.stringify(carrito));

      setShowDniModal(false);

      navigate('/pago');
    } catch (error: any) {
      console.error('Error al guardar DNI:', error);

      setDniError(error?.response?.data?.message || 'No se pudo guardar el DNI.');
    } finally {
      setSavingDni(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!carrito || !carrito.items || carrito.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="text-slate-500 w-10 h-10" />
          </div>

          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">
            Tu carrito está vacío
          </h1>

          <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">
            Parece que aún no has añadido ningún curso a tu selección de aprendizaje.
          </p>

          <Link
            to="/cursos"
            className="inline-flex items-center gap-3 px-10 py-5 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(14,165,233,0.4)]"
          >
            Explorar Cursos <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-sky-500/30 font-['Inter']">
      {/* =====================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        {/* Header Section */}
        <div className="mb-16 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-sky-400 text-xl" />
            </div>

            <span className="text-[10px] font-black tracking-[0.4em] text-slate-600 uppercase font-['Outfit']">
              Proceso de Compra
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 uppercase leading-[1.1] font-['Outfit']">
            Tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
              Carrito
            </span>
          </h1>

          <p className="text-slate-500 text-lg font-light max-w-2xl leading-relaxed font-['Inter']">
            Tienes {carrito.items.length} {carrito.items.length === 1 ? 'artículo' : 'artículos'}{' '}
            listo
            {carrito.items.length === 1 ? '' : 's'} para el despegue.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* =================================================
              LISTA DE ITEMS
          ================================================== */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {carrito.items.map((item) => {
                const isCurso = !!item.curso;
                const data = isCurso ? item.curso : item.ruta;

                if (!data) return null;

                const alreadyOwned = compras.some(
                  (c: any) =>
                    (isCurso &&
                      (c.curso?.id_curso === (data as Curso).id_curso ||
                        c.id_curso === (data as Curso).id_curso)) ||
                    (!isCurso &&
                      (c.ruta?.id_ruta === (data as Ruta).id_ruta ||
                        c.id_ruta === (data as Ruta).id_ruta)),
                );

                return (
                  <motion.div
                    key={item.id_item}
                    layout
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 20,
                    }}
                    className={`group relative flex flex-col md:flex-row items-center bg-[#0a0a0a] border ${
                      alreadyOwned ? 'border-emerald-500/30' : 'border-white/5'
                    } hover:border-sky-500/30 rounded-[2.5rem] p-6 transition-all duration-500`}
                  >
                    <div className="w-full md:w-48 aspect-video md:aspect-square relative overflow-hidden rounded-3xl flex-shrink-0">
                      <img
                        src={
                          data.imagen ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400'
                        }
                        alt={isCurso ? (data as Curso).titulo : (data as Ruta).nombre}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {alreadyOwned && (
                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-emerald-500 text-black text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                            Ya es tuyo
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 mt-6 md:mt-0 md:ml-8 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
                        <div className="flex-1 min-w-0 w-full">
                          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-sky-400 transition-colors line-clamp-2">
                            {isCurso ? (data as Curso).titulo : (data as Ruta).nombre}
                          </h2>

                          <p className="text-[10px] md:text-xs font-black text-sky-500 uppercase tracking-widest mb-4">
                            {isCurso ? 'Curso Individual' : 'Ruta de Aprendizaje'}
                          </p>
                        </div>

                        <div className="shrink-0 self-start">
                          <p className="text-2xl md:text-3xl font-black text-white tracking-tighter whitespace-nowrap">
                            S/ {Number(item.precio).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                          {alreadyOwned ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Check size={14} /> Contenido disponible en tu biblioteca
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ShieldCheck size={14} /> Acceso de por vida
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => eliminarCurso(item.id_item)}
                          className="p-3 bg-rose-500/5 hover:bg-rose-500/20 text-rose-500 rounded-2xl transition-all group/del"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-5 h-5 group-hover/del:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* =================================================
              RESUMEN
          ================================================== */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[60px] rounded-full pointer-events-none" />

              <h3 className="text-xl font-black uppercase tracking-widest mb-10 text-white">
                Resumen
              </h3>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Impuestos</span>
                  <span>Incluidos</span>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                    Total a pagar
                  </span>

                  <span className="text-4xl font-black text-white tracking-tighter">
                    S/ {totalAPagar.toFixed(2)}
                  </span>
                </div>
              </div>

              {totalAPagar <= 0 && carrito.items.length > 0 ? (
                <button
                  onClick={() => navigate('/compras')}
                  className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-[2rem] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3"
                >
                  Ir a mis Cursos <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={procederAlPago}
                  className="w-full py-6 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-[2rem] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(14,165,233,0.4)] flex items-center justify-center gap-3"
                >
                  Proceder al Pago <ArrowRight size={16} />
                </button>
              )}

              <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                <CreditCard size={20} />
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL DNI
      ====================================================== */}
      <AnimatePresence>
        {showDniModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              {/* Icono */}
              <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-sky-400 w-7 h-7" />
              </div>

              {/* Título */}
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Completa tus datos
              </h2>

              {/* Descripción */}
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Para continuar con tu compra necesitamos registrar tu número de DNI.
              </p>

              {/* Campo DNI */}
              <div className="mt-7">
                <label
                  htmlFor="dni"
                  className="block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                >
                  Número de DNI
                </label>

                <input
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);

                    setDni(value);
                    setDniError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !savingDni) {
                      guardarDniYContinuar();
                    }
                  }}
                  placeholder="Ingresa tu DNI"
                  className="w-full bg-black border border-white/10 text-white placeholder:text-slate-700 rounded-2xl px-4 py-4 text-sm outline-none transition-all focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10"
                />

                {/* Error */}
                {dniError && <p className="mt-3 text-sm text-rose-400">{dniError}</p>}

                {/* Contador */}
                <div className="mt-2 flex justify-end">
                  <span className="text-[10px] text-slate-600 font-bold">{dni.length}/8</span>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!savingDni) {
                      setShowDniModal(false);
                      setDniError(null);
                    }
                  }}
                  disabled={savingDni}
                  className="flex-1 py-4 border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={guardarDniYContinuar}
                  disabled={savingDni || dni.length !== 8}
                  className="flex-1 py-4 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {savingDni ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {/* Nota */}
              <p className="mt-5 text-center text-[10px] text-slate-700 leading-relaxed">
                Tu DNI se utilizará únicamente para procesar correctamente tu compra.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MENSAJES
      ====================================================== */}
      <AnimatePresence>
        {mensaje && (
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 50,
            }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest z-[100] shadow-2xl"
          >
            {mensaje}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
