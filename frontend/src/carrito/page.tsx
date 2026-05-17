"use client";

import { useEffect, useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, Check } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";

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
  const navigate = useNavigate();
  const fetchCarrito = async () => {
    try {
      const [resCarrito, resCompras] = await Promise.all([
        fetch(`${API_URL}/carrito?t=${Date.now()}`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(`${API_URL}/compras/historial?t=${Date.now()}`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
      ]);

      if (resCarrito.status === 401) {
        navigate("/login?expired=true");
        return;
      }

      const dataCarrito = await resCarrito.json();
      const dataCompras = await resCompras.json();

      if (resCarrito.ok && dataCarrito.data) {
        setCarrito(dataCarrito.data);
      } else {
        setCarrito({ id_carrito: 0, items: [] });
      }

      if (resCompras.ok) {
        setCompras(dataCompras.compras || dataCompras.data || []);
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrito();
  }, []);

  const eliminarCurso = async (id_item: number) => {
    try {
      const response = await fetch(`${API_URL}/carrito/${id_item}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setCarrito((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter((item) => item.id_item !== id_item)
          };
        });
        setMensaje("Eliminado correctamente");
        setTimeout(() => setMensaje(null), 2000);
      } else {
        console.error("Error al eliminar del carrito");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isItemOwned = (item: CarritoItem) => {
    return compras.some((c: any) => 
      (item.curso && (c.curso?.id_curso === item.curso.id_curso || c.id_curso === item.curso.id_curso)) ||
      (item.ruta && (c.ruta?.id_ruta === item.ruta.id_ruta || c.id_ruta === item.ruta.id_ruta))
    );
  };

  const subtotal = carrito?.items.reduce((acc, item) => acc + Number(item.precio || 0), 0) || 0;
  
  const totalAPagar = carrito?.items.reduce((acc, item) => {
    if (isItemOwned(item)) return acc;
    return acc + Number(item.precio || 0);
  }, 0) || 0;

  const procederAlPago = () => {
    if (carrito && carrito.items.length > 0) {
      localStorage.setItem("carritoData", JSON.stringify(carrito));
      navigate("/pago");
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!carrito || !carrito.items || carrito.items.length === 0)
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
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Tu carrito está vacío</h1>
          <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">
            Parece que aún no has añadido ningún curso a tu selección de aprendizaje.
          </p>
          <Link to="/cursos" className="inline-flex items-center gap-3 px-10 py-5 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(14,165,233,0.4)]">
            Explorar Cursos <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-sky-500/30 font-['Inter']">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* Header Section */}
        <div className="mb-16 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
             <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-sky-400 text-xl" />
             </div>
             <span className="text-[10px] font-black tracking-[0.4em] text-slate-600 uppercase font-['Outfit']">Proceso de Compra</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 uppercase leading-[1.1] font-['Outfit']">
            Tu <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">Carrito</span>
          </h1>
          <p className="text-slate-500 text-lg font-light max-w-2xl leading-relaxed font-['Inter']">
            Tienes {carrito.items.length} {carrito.items.length === 1 ? 'artículo' : 'artículos'} listo{carrito.items.length === 1 ? '' : 's'} para el despegue.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* List of Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {carrito.items.map((item) => {
                const isCurso = !!item.curso;
                const data = isCurso ? item.curso : item.ruta;
                if (!data) return null;

                const alreadyOwned = compras.some((c: any) => 
                  (isCurso && (c.curso?.id_curso === (data as Curso).id_curso || c.id_curso === (data as Curso).id_curso)) ||
                  (!isCurso && (c.ruta?.id_ruta === (data as Ruta).id_ruta || c.id_ruta === (data as Ruta).id_ruta))
                );

                return (
                  <motion.div
                    key={item.id_item}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`group relative flex flex-col md:flex-row items-center bg-[#0a0a0a] border ${alreadyOwned ? 'border-emerald-500/30' : 'border-white/5'} hover:border-sky-500/30 rounded-[2.5rem] p-6 transition-all duration-500`}
                  >
                    <div className="w-full md:w-48 aspect-video md:aspect-square relative overflow-hidden rounded-3xl flex-shrink-0">
                      <img
                        src={data.imagen || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400"}
                        alt={isCurso ? (data as Curso).titulo : (data as Ruta).nombre}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {alreadyOwned && (
                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                           <span className="bg-emerald-500 text-black text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Ya es tuyo</span>
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
                            {isCurso ? "Curso Individual" : "Ruta de Aprendizaje"}
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
                              <span className="flex items-center gap-1 text-emerald-400"><Check size={14} /> Contenido disponible en tu biblioteca</span>
                            ) : (
                              <span className="flex items-center gap-1"><ShieldCheck size={14} /> Acceso de por vida</span>
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

          {/* Summary Sidebar */}
          <div className="lg:sticky lg:top-32 h-fit">
             <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[60px] rounded-full pointer-events-none" />
                
                <h3 className="text-xl font-black uppercase tracking-widest mb-10 text-white">Resumen</h3>
                
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
                      <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total a pagar</span>
                      <span className="text-4xl font-black text-white tracking-tighter">
                        S/ {totalAPagar.toFixed(2)}
                      </span>
                   </div>
                </div>

                {totalAPagar <= 0 && carrito.items.length > 0 ? (
                  <button
                    onClick={() => navigate("/compras")}
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

      <AnimatePresence>
        {mensaje && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest z-[100] shadow-2xl"
          >
            {mensaje}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
