"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { Check, Copy, Info, Smartphone, Building2, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface TipoPago {
  id_tipo_pago: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

const INFO_PAGOS: Record<string, any> = {
  "1": { // Yape
    color: "bg-purple-500",
    icon: <Smartphone className="text-purple-400" />,
    numero: "987 654 321",
    titular: "MIS ACADEMY SOLUTIONS",
    instrucciones: "Escanea el código QR o envía el pago al número celular indicado.",
    qr: "/assets/qr-yape.png" 
  },
  "2": { // Plin
    color: "bg-teal-500",
    icon: <Smartphone className="text-teal-400" />,
    numero: "987 654 321",
    titular: "MIS ACADEMY SOLUTIONS",
    instrucciones: "Escanea el código QR o realiza el Plin al número celular indicado.",
    qr: "/assets/qr-plin.png"
  },
  "3": { // Transferencia
    color: "bg-blue-500",
    icon: <Building2 className="text-blue-400" />,
    bancos: [
      { nombre: "BCP", cuenta: "191-12345678-0-12", cci: "002-191-0012345678012-55" },
      { nombre: "BBVA", cuenta: "0011-0123-0100045678", cci: "011-123-000100045678-99" }
    ],
    titular: "MIS ACADEMY SOLUTIONS S.A.C.",
    instrucciones: "Realiza la transferencia a cualquiera de nuestras cuentas bancarias."
  }
};

export default function Pago() {
  const navigate = useNavigate();

  const [carrito, setCarrito] = useState<CarritoData | null>(null);
  const [metodosPago, setMetodosPago] = useState<TipoPago[]>([]);
  const [loadingMetodos, setLoadingMetodos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pagoData, setPagoData] = useState({
    id_tipo_pago: "",
    referencia_externa: "",
  });

  const [imagenComprobante, setImagenComprobante] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiado(label);
    setTimeout(() => setCopiado(null), 2000);
  };

  useEffect(() => {
    const data = localStorage.getItem("carritoData");
    if (data) setCarrito(JSON.parse(data));
  }, []);

  useEffect(() => {
    const fetchMetodosPago = async () => {
      try {
        const res = await fetch(`${API_URL}/tipos-pagos`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status === "success") {
          const activos = data.tipos_pagos.filter(
            (tp: any) => tp.activo === true || tp.activo === 1
          );
          setMetodosPago(activos);
        }
      } catch (err) {
        console.error("Error al cargar tipos de pago:", err);
      } finally {
        setLoadingMetodos(false);
      }
    };
    fetchMetodosPago();
  }, []);

  const [compras, setCompras] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const res = await fetch(`${API_URL}/compras/historial`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setCompras(data.compras || data.data || []);
        }
      } catch (err) {
        console.error("Error al cargar historial:", err);
      }
    };
    fetchCompras();
  }, []);

  const total =
    carrito?.items.reduce((acc, item) => {
      const isCurso = !!item.curso;
      const data = isCurso ? item.curso : item.ruta;
      const alreadyOwned = compras.some((c: any) => 
        (isCurso && (c.curso?.id_curso === (data as Curso)?.id_curso || c.id_curso === (data as Curso)?.id_curso)) ||
        (!isCurso && (c.ruta?.id_ruta === (data as Ruta)?.id_ruta || c.id_ruta === (data as Ruta)?.id_ruta))
      );
      if (alreadyOwned) return acc;
      return acc + Number(item.precio || 0);
    }, 0) || 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPagoData({ ...pagoData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenComprobante(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!aceptado) {
      setError("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    if (!pagoData.id_tipo_pago) {
      setError("Selecciona un método de pago.");
      return;
    }

    setError("");
    setLoading(true);

    try {

      const formData = new FormData();
      formData.append("id_tipo_pago", pagoData.id_tipo_pago);
      formData.append("concepto", "Pago de cursos del carrito");
      formData.append(
        "detalles_transaccion",
        carrito?.items.map((i) => (i.curso?.titulo || i.ruta?.nombre || "Ítem")).join(", ") || ""
      );
      if (pagoData.referencia_externa)
        formData.append("referencia_externa", pagoData.referencia_externa);
      if (imagenComprobante)
        formData.append("imagen_comprobante", imagenComprobante);
      
      // AÑADIMOS EL MONTO Y LOS CURSOS/RUTAS QUE FALTABAN
      formData.append("monto_total", total.toString());
      
      const cursosParaPagar = carrito?.items.filter(i => {
        if (!i.curso) return false;
        return !compras.some(c => (c.curso?.id_curso === i.curso?.id_curso || c.id_curso === i.curso?.id_curso));
      }).map(i => ({
        id_curso: i.curso?.id_curso,
        precio: i.precio
      })) || [];

      const rutasParaPagar = carrito?.items.filter(i => {
        if (!i.ruta) return false;
        return !compras.some(c => (c.ruta?.id_ruta === i.ruta?.id_ruta || c.id_ruta === i.ruta?.id_ruta));
      }).map(i => ({
        id_ruta: i.ruta?.id_ruta,
        precio: i.precio
      })) || [];

      formData.append("cursos", JSON.stringify(cursosParaPagar));
      formData.append("rutas", JSON.stringify(rutasParaPagar));

      const res = await fetch(`${API_URL}/pagos`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 201 && data.status === "success") {
        await fetch(`${API_URL}/carrito/vaciar`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        localStorage.removeItem("carritoData");

        setMostrarModal(true);
      } else {
        setError(data.mensaje || "Error al registrar el pago.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleAceptar = () => {
    setMostrarModal(false);
    navigate("/cursos");
  };

  if (!carrito || carrito.items.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-3">No hay cursos para pagar.</h1>
        <button
          onClick={() => navigate("/cursos")}
          className="bg-sky-600 px-6 py-2 rounded-lg hover:bg-sky-700 transition"
        >
          Ir a cursos
        </button>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#03070c] overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-sky-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-800/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-12 px-6 lg:px-8 text-white font-sans animate-in fade-in duration-500">
        <div className="text-center mb-12 relative">
          {/* Aura de brillo detrás del título */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-20 bg-sky-500/20 blur-[60px] pointer-events-none" />
          
          <h1 className="text-5xl md:text-7xl font-black font-['Outfit'] uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-blue-500 mb-3 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            Finalizar Compra
          </h1>
          <div className="flex items-center justify-center gap-3">
             <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-sky-500/50" />
             <p className="text-sky-400 font-black tracking-[0.3em] uppercase text-[10px] bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
               Estás a un paso de tu certificación
             </p>
             <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-sky-500/50" />
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
          <h2 className="text-xl font-bold font-['Outfit'] mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">1</span>
            Resumen de compra
          </h2>

          <div className="space-y-4">
            {carrito.items.map((item) => {
              const isCurso = !!item.curso;
              const itemData = isCurso ? item.curso : item.ruta;
              if (!itemData) return null;

              const alreadyOwned = compras.some((c: any) => 
                (isCurso && (c.curso?.id_curso === (itemData as Curso).id_curso || c.id_curso === (itemData as Curso).id_curso)) ||
                (!isCurso && (c.ruta?.id_ruta === (itemData as Ruta).id_ruta || c.id_ruta === (itemData as Ruta).id_ruta))
              );

              return (
                <div
                  key={item.id_item}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl p-4 border transition-all duration-300 gap-4 ${alreadyOwned ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/40'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={itemData.imagen || "/placeholder.jpg"}
                        alt={isCurso ? (itemData as any).titulo : (itemData as any).nombre}
                        className="w-20 h-20 rounded-xl object-cover border border-white/5 shadow-lg group-hover:scale-105 transition-transform"
                      />
                      {alreadyOwned && (
                        <div className="absolute inset-0 bg-emerald-500/40 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                          <Check className="text-black w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-bold font-['Outfit'] text-lg tracking-tight mb-1 ${alreadyOwned ? 'text-emerald-400' : 'text-white'}`}>
                        {isCurso ? (itemData as any).titulo : (itemData as any).nombre}
                      </h3>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider">
                        {alreadyOwned ? "Ya en tu biblioteca" : (isCurso ? "Curso Individual" : "Ruta de Aprendizaje")}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0 mt-2 sm:mt-0">
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${alreadyOwned ? 'text-emerald-400' : 'text-white/40'}`}>Precio</p>
                    <p className={`font-black text-xl font-['Outfit'] ${alreadyOwned ? 'text-gray-400/70 line-through' : 'text-sky-400'}`}>
                      S/ {Number(item.precio || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-br from-sky-500/10 to-blue-600/5 border border-sky-500/20 rounded-[2rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 blur-[60px] -mr-24 -mt-24 pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
               <div className="text-center sm:text-left">
                  <p className="text-sky-400/60 font-black text-[11px] uppercase tracking-[0.3em] mb-2">Resumen de Inversión</p>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <span className="text-white/40 text-2xl font-black font-['Outfit']">S/</span>
                    <h3 className="text-white font-black text-6xl font-['Outfit'] tracking-tighter drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                      {total.toFixed(2)}
                    </h3>
                  </div>
               </div>
               <div className="h-20 w-[1px] bg-white/10 hidden sm:block" />
               <div className="flex flex-col items-center sm:items-end">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Listo para procesar</span>
                  </div>
                  <p className="text-white/30 text-[10px] font-bold text-center sm:text-right max-w-[150px]">
                    Incluye acceso de por vida y certificado digital.
                  </p>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
          <h2 className="text-xl font-bold font-['Outfit'] mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">2</span>
            Método de pago
          </h2>

          <div className="space-y-6 flex-1">
            <div className="space-y-2 relative z-20">
              <label className="text-[11px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-white/70 ml-2">Selecciona un método</label>
              <div className="relative">
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-5 py-4 rounded-[1.25rem] bg-black/40 border transition-all cursor-pointer flex items-center justify-between shadow-inner ${isDropdownOpen ? 'border-sky-500/50 ring-2 ring-sky-500/20' : 'border-white/10 hover:border-white/20'}`}
                >
                  <span className={!pagoData.id_tipo_pago ? "text-white/50 font-medium text-sm" : "text-white font-bold text-sm"}>
                    {loadingMetodos ? "Cargando métodos..." : (metodosPago.find(m => m.id_tipo_pago.toString() === pagoData.id_tipo_pago.toString())?.nombre || "Elige una opción...")}
                  </span>
                  <svg className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-sky-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#0a1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                      {metodosPago.map((metodo) => (
                        <div
                          key={metodo.id_tipo_pago}
                          onClick={() => {
                            setPagoData({ ...pagoData, id_tipo_pago: metodo.id_tipo_pago.toString() });
                            setIsDropdownOpen(false);
                          }}
                          className={`px-4 py-3 rounded-xl cursor-pointer font-bold text-sm transition-all flex items-center gap-2 ${pagoData.id_tipo_pago === metodo.id_tipo_pago.toString() ? 'bg-sky-500/20 text-sky-400' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                        >
                          {pagoData.id_tipo_pago === metodo.id_tipo_pago.toString() && <Check size={16} />}
                          <span className={pagoData.id_tipo_pago === metodo.id_tipo_pago.toString() ? '' : 'ml-6'}>
                            {metodo.nombre}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* INFO DINÁMICA DEL MÉTODO SELECCIONADO */}
            <AnimatePresence mode="wait">
              {pagoData.id_tipo_pago && INFO_PAGOS[pagoData.id_tipo_pago] && (
                <motion.div
                  key={pagoData.id_tipo_pago}
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-6 space-y-5 relative">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-white/5 rounded-lg">
                          {INFO_PAGOS[pagoData.id_tipo_pago].icon}
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-white">Datos de Pago</h4>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{INFO_PAGOS[pagoData.id_tipo_pago].titular}</p>
                       </div>
                    </div>

                    {(pagoData.id_tipo_pago === "1" || pagoData.id_tipo_pago === "2") && (
                      <div className="flex flex-col sm:flex-row gap-5 items-center">
                        <div className="w-28 h-28 bg-white p-2 rounded-2xl shrink-0 shadow-lg shadow-black/50">
                           {/* Aquí iría la imagen real del QR */}
                           <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                              <QrCode className="text-gray-400" size={32} />
                           </div>
                        </div>
                        <div className="flex-1 space-y-3 w-full text-center sm:text-left min-w-0">
                           <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Número Celular</p>
                           <div className="flex items-center justify-between gap-2 bg-black/40 pl-4 pr-2 py-3 rounded-xl border border-white/5 w-full">
                              <span className="text-lg font-black font-['Outfit'] tracking-wider whitespace-nowrap">{INFO_PAGOS[pagoData.id_tipo_pago].numero}</span>
                              <button 
                                onClick={() => handleCopy(INFO_PAGOS[pagoData.id_tipo_pago].numero, "Celular")}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-sky-400 transition-all shrink-0"
                              >
                                {copiado === "Celular" ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                              </button>
                           </div>
                        </div>
                      </div>
                    )}

                    {pagoData.id_tipo_pago === "3" && (
                      <div className="space-y-4">
                        {INFO_PAGOS[pagoData.id_tipo_pago].bancos.map((b: any, idx: number) => (
                          <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3">
                             <div className="flex items-center justify-between">
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{b.nombre}</span>
                             </div>
                             <div className="space-y-2">
                                <div className="flex items-center justify-between group">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Número de Cuenta</span>
                                      <span className="text-sm font-bold font-mono tracking-tight">{b.cuenta}</span>
                                   </div>
                                   <button 
                                      onClick={() => handleCopy(b.cuenta, `Cuenta ${b.nombre}`)}
                                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-sky-400 transition-all"
                                   >
                                      {copiado === `Cuenta ${b.nombre}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                   </button>
                                </div>
                                <div className="flex items-center justify-between group">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">CCI (Interbancario)</span>
                                      <span className="text-[11px] font-bold font-mono tracking-tight text-white/70">{b.cci}</span>
                                   </div>
                                   <button 
                                      onClick={() => handleCopy(b.cci, `CCI ${b.nombre}`)}
                                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-sky-400 transition-all"
                                   >
                                      {copiado === `CCI ${b.nombre}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                   </button>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                       <Info className="text-blue-400 shrink-0" size={14} />
                       <p className="text-[10px] text-blue-200/60 leading-normal font-medium">{INFO_PAGOS[pagoData.id_tipo_pago].instrucciones}</p>
                    </div>

                    {copiado && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="absolute bottom-4 right-4 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg"
                      >
                        {copiado} Copiado
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[11px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-white/70 ml-2">Comprobante (Imagen o PDF)</label>
              <div className="relative">
                 <input
                   type="file"
                   accept="image/*,application/pdf"
                   onChange={handleFileChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div className={`w-full flex items-center justify-center gap-3 px-5 py-6 rounded-[1.25rem] border-2 border-dashed transition-all ${imagenComprobante ? 'border-sky-500/50 bg-sky-500/5' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                    {imagenComprobante ? (
                       <span className="text-sm font-bold text-sky-400 truncate max-w-[200px]">{imagenComprobante.name}</span>
                    ) : (
                       <span className="text-sm font-bold text-white/40">Haz clic o arrastra tu comprobante aquí</span>
                    )}
                 </div>
              </div>
            </div>

            {preview && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={preview}
                  alt="Vista previa comprobante"
                  className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </motion.div>
            )}

            <div className="flex items-start gap-3 mt-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <input
                type="checkbox"
                id="acepto"
                checked={aceptado}
                onChange={(e) => setAceptado(e.target.checked)}
                className="mt-1 w-4 h-4 accent-sky-500 cursor-pointer rounded border-white/20 bg-black/40"
              />
              <label htmlFor="acepto" className="text-xs text-white/60 leading-relaxed font-medium">
                He leído y acepto los{" "}
                <button
                  type="button"
                  onClick={() => setMostrarTerminos(true)}
                  className="text-sky-400 font-bold hover:text-sky-300 transition-colors"
                >
                  Términos y Condiciones
                </button>
                {" "}para procesar mi pago.
              </label>
            </div>

            {error && (
               <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-xs font-bold text-center">
                  {error}
               </motion.div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !aceptado}
            className={`mt-8 w-full py-4 rounded-[1.25rem] bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-[13px] tracking-widest uppercase shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] focus:ring-4 focus:ring-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Confirmar pago y enviar"
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleAceptar} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-[#050a12] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl w-full max-w-md overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-16 -mt-16 pointer-events-none" />
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-emerald-400 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black font-['Outfit'] mb-3 text-white">
                ¡Pago registrado!
              </h2>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">
                Revisa tu correo electrónico. Te avisaremos en breve cuando tu acceso sea habilitado tras validar el comprobante.
              </p>
              <button
                onClick={handleAceptar}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                Volver a Cursos
              </button>
            </motion.div>
          </div>
        )}

        {mostrarTerminos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMostrarTerminos(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-[#050a12] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/10 blur-[50px] -ml-16 -mt-16 pointer-events-none" />
              <h3 className="text-xl font-black font-['Outfit'] text-white mb-4">
                Términos y Condiciones
              </h3>
              <div className="text-sm text-white/50 space-y-4 mb-8 leading-relaxed max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                <p>
                  Al confirmar tu pago, aceptas las políticas establecidas por la plataforma MIS ACADEMY. Todos los pagos serán procesados de forma segura y verificada.
                </p>
                <p>
                  En caso de error en el pago o causas justificadas, el estudiante podrá solicitar un reembolso dentro de los primeros <strong className="text-white">7 días hábiles</strong> tras la confirmación del mismo. Pasado este plazo, no se aceptarán solicitudes de devolución.
                </p>
                <p>
                  El acceso al curso se habilitará una vez validado el comprobante correspondiente. Cualquier irregularidad en la información del pago podría retrasar la activación del curso.
                </p>
              </div>
              <button
                onClick={() => setMostrarTerminos(false)}
                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-sky-500/20 transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
