"use client";

import { useEffect, useState } from "react";
import { 
  IoCreateOutline, 
  IoTrashOutline, 
  IoAddOutline, 
  IoCheckmarkCircle, 
  IoRadioButtonOffOutline,
  IoStatsChartOutline,
  IoBulbOutline,
  IoOptionsOutline,
  IoListOutline,
  IoAlertCircleOutline
} from "react-icons/io5";
import { apiUrl } from "../../config/api";
import AdminModal from "../Components/AdminModal";
import InputComponent from "../Components/InputComponent";

function authHeaders() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

interface OpcionRespuesta {
  id_opcion: number;
  id_pregunta: number;
  texto_opcion: string;
  es_correcta: number | boolean;
}

interface Pregunta {
  id_pregunta: number;
  id_evaluacion: number;
  texto_pregunta: string;
  tipo: string;
  puntos: number;
  orden: number;
}

interface PreguntaConOpciones extends Pregunta {
  opciones: OpcionRespuesta[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id_evaluacion: number | null;
}

export default function AgregarPreguntasModal({ isOpen, onClose, id_evaluacion }: Props) {
  const [preguntas, setPreguntas] = useState<PreguntaConOpciones[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // States para crear/editar pregunta
  const [crearPreguntaOpen, setCrearPreguntaOpen] = useState(false);
  const [editPregunta, setEditPregunta] = useState<Pregunta | null>(null);
  const [nuevaPregunta, setNuevaPregunta] = useState({
    texto_pregunta: "",
    tipo: "opcion_multiple",
    puntos: 1,
    orden: 1,
  });

  // States para crear/editar opcion
  const [crearOpcionOpen, setCrearOpcionOpen] = useState<{open: boolean, id_pregunta: number | null}>({ open: false, id_pregunta: null });
  const [editOpcion, setEditOpcion] = useState<OpcionRespuesta | null>(null);
  const [nuevaOpcion, setNuevaOpcion] = useState({
    texto_opcion: "",
    es_correcta: false,
  });

  useEffect(() => {
    if (isOpen && id_evaluacion) {
      cargarPreguntas();
    } else if (!isOpen) {
      setPreguntas([]);
    }
  }, [isOpen, id_evaluacion]);

  async function cargarPreguntas() {
    if (!id_evaluacion) return;
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl(`/admin/preguntas?id_evaluacion=${id_evaluacion}`), {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      
      const rawPreguntas = Array.isArray(data) ? data : (data.data || []);
      
      const normalizadas = rawPreguntas.map((preg: any) => ({
        ...preg,
        texto_pregunta: preg.texto_pregunta || preg.texto,
        puntos: Number(preg.puntos || preg.puntaje || 0),
        opciones: (preg.opciones || []).map((opt: any) => ({
            ...opt,
            texto_opcion: opt.texto_opcion || opt.texto,
            es_correcta: Boolean(opt.es_correcta)
        }))
      }));

      setPreguntas(normalizadas);
    } catch (error) {
      console.error("Error cargando preguntas:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const crearPregunta = async () => {
    try {
      const payload = {
        id_evaluacion,
        texto: nuevaPregunta.texto_pregunta,
        tipo: nuevaPregunta.tipo,
        puntaje: nuevaPregunta.puntos,
        orden: nuevaPregunta.orden,
      };
      const res = await fetch(apiUrl("/admin/preguntas"), {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setCrearPreguntaOpen(false);
        setNuevaPregunta({ texto_pregunta: "", tipo: "opcion_multiple", puntos: 1, orden: 1 });
        cargarPreguntas();
      } else {
        const errorData = await res.json();
        alert("Error al crear pregunta: " + (errorData.message || "Error desconocido"));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al crear pregunta");
    }
  };

  const guardarPregunta = async () => {
    if (!editPregunta) return;
    try {
      const payload = {
        id_evaluacion: editPregunta.id_evaluacion,
        texto: editPregunta.texto_pregunta,
        tipo: editPregunta.tipo,
        puntaje: editPregunta.puntos,
        orden: editPregunta.orden,
      };
      const res = await fetch(apiUrl(`/admin/preguntas/${editPregunta.id_pregunta}`), {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditPregunta(null);
        cargarPreguntas();
      } else {
        const errorData = await res.json();
        alert("Error al guardar pregunta: " + (errorData.message || "Error desconocido"));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al guardar pregunta");
    }
  };

  const eliminarPregunta = async (id: number) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    try {
      const res = await fetch(apiUrl(`/admin/preguntas/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      if (res.ok) cargarPreguntas();
      else alert("Error al eliminar pregunta");
    } catch (error) {
      console.error(error);
      alert("Error de conexión al eliminar pregunta");
    }
  };

  const crearOpcion = async () => {
    if (!crearOpcionOpen.id_pregunta) return;
    try {
      const payload = {
        id_pregunta: crearOpcionOpen.id_pregunta,
        texto: nuevaOpcion.texto_opcion,
        es_correcta: nuevaOpcion.es_correcta,
      };
      const res = await fetch(apiUrl("/admin/opciones-respuesta"), {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setCrearOpcionOpen({ open: false, id_pregunta: null });
        setNuevaOpcion({ texto_opcion: "", es_correcta: false });
        cargarPreguntas();
      } else {
        const errorData = await res.json();
        alert("Error al crear opción: " + (errorData.message || "Error desconocido"));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al crear opción");
    }
  };

  const guardarOpcion = async () => {
    if (!editOpcion) return;
    try {
      const payload = {
        id_pregunta: editOpcion.id_pregunta,
        texto: editOpcion.texto_opcion,
        es_correcta: editOpcion.es_correcta,
      };
      const res = await fetch(apiUrl(`/admin/opciones-respuesta/${editOpcion.id_opcion}`), {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditOpcion(null);
        cargarPreguntas();
      } else {
        const errorData = await res.json();
        alert("Error al guardar opción: " + (errorData.message || "Error desconocido"));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al guardar opción");
    }
  };

  const eliminarOpcion = async (id: number) => {
    if (!confirm("¿Eliminar esta opción?")) return;
    try {
      const res = await fetch(apiUrl(`/admin/opciones-respuesta/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      if (res.ok) cargarPreguntas();
      else alert("Error al eliminar opción");
    } catch (error) {
      console.error(error);
      alert("Error de conexión al eliminar opción");
    }
  };

  const totalPuntos = preguntas.reduce((acc, p) => acc + (p.puntos || 0), 0);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Banco de Preguntas"
      maxWidth="max-w-6xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global del Examen</span>
              <span className="text-[13px] font-black text-slate-700">{preguntas.length} Preguntas / {totalPuntos} Puntos</span>
            </div>
          </div>
          <button onClick={onClose} className="px-10 py-3 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all border border-white/10">Finalizar Edición</button>
        </div>
      }
    >
      <div className="space-y-8 p-1">
        {/* Statistics and Quick Action Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
           <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100/50">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                 <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center"><IoListOutline size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Reactivos</p>
                    <p className="text-lg font-black text-slate-900 leading-none">{preguntas.length}</p>
                 </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><IoStatsChartOutline size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Puntaje Acumulado</p>
                    <p className="text-lg font-black text-slate-900 leading-none">{totalPuntos}</p>
                 </div>
              </div>
              <button
                onClick={() => setCrearPreguntaOpen(true)}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-3 bg-[#0E1C2B] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 group"
              >
                <IoAddOutline size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Nueva Pregunta
              </button>
           </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-6">
             <div className="w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-sky-500/20" />
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Banco de Datos...</p>
          </div>
        ) : preguntas.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-8 bg-slate-50/30 rounded-[3rem] border border-dashed border-slate-200/60">
             <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-900/5 flex items-center justify-center text-slate-200">
                <IoBulbOutline size={40} />
             </div>
             <div className="text-center space-y-2">
                <h5 className="text-[14px] font-black text-slate-700 uppercase tracking-widest">Evaluación Vacía</h5>
                <p className="text-[12px] font-medium text-slate-400 max-w-xs">Define los reactivos técnicos para este examen académico.</p>
             </div>
          </div>
        ) : (
          <div className="space-y-6">
            {preguntas.map((p, idx) => (
              <div key={p.id_pregunta} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-500 group/card overflow-hidden">
                 {/* Card Header */}
                 <div className="p-6 md:p-8 bg-slate-50/30 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex gap-5 flex-1">
                       <div className="w-12 h-12 shrink-0 bg-[#0E1C2B] text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg shadow-slate-900/20">
                          {idx + 1}
                       </div>
                       <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] font-black text-sky-600 uppercase tracking-[0.2em] bg-sky-50 px-3 py-1 rounded-lg border border-sky-100/50">{p.puntos} {p.puntos === 1 ? "PUNTO" : "PUNTOS"}</span>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-lg">ORDEN #{p.orden}</span>
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-auto">ID #{p.id_pregunta}</span>
                          </div>
                          <h5 className="text-[17px] font-black text-slate-800 leading-tight group-hover/card:text-slate-900 transition-colors">
                             {p.texto_pregunta}
                          </h5>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0 self-end md:self-start">
                      <button 
                         onClick={() => setEditPregunta({ ...p })} 
                         className="p-3 bg-white text-slate-400 hover:text-amber-500 rounded-xl transition-all shadow-sm border border-slate-100 hover:scale-110"
                         title="Editar Pregunta"
                      >
                         <IoCreateOutline size={18} />
                      </button>
                      <button 
                         onClick={() => eliminarPregunta(p.id_pregunta)} 
                         className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm border border-slate-100 hover:scale-110"
                         title="Eliminar Pregunta"
                      >
                         <IoTrashOutline size={18} />
                      </button>
                    </div>
                 </div>

                 {/* Options Section */}
                 <div className="p-6 md:p-8 space-y-4 bg-white">
                    <div className="flex items-center gap-3 mb-2 ml-1">
                       <IoOptionsOutline className="text-slate-400" size={14} />
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Opciones de Respuesta</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {p.opciones.map((op) => (
                         <div key={op.id_opcion} className={`p-5 rounded-2xl border transition-all duration-300 flex justify-between items-center group/opt relative
                            ${op.es_correcta 
                              ? "bg-emerald-50/40 border-emerald-200/60 shadow-sm" 
                              : "bg-slate-50/20 border-slate-100 hover:bg-white hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5"}
                         `}>
                            <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
                               <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-500
                                  ${op.es_correcta 
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                    : "bg-white text-slate-300 group-hover/opt:text-sky-500 shadow-sm border border-slate-100"}
                               `}>
                                  {op.es_correcta ? <IoCheckmarkCircle size={16} /> : <IoRadioButtonOffOutline size={16} />}
                               </div>
                               <span className={`text-[13px] font-bold truncate ${op.es_correcta ? "text-emerald-900" : "text-slate-600"}`} title={op.texto_opcion}>
                                  {op.texto_opcion}
                               </span>
                            </div>
                            
                            <div className="flex gap-1.5 opacity-0 group-hover/opt:opacity-100 transition-all translate-x-2 group-hover/opt:translate-x-0 relative z-10 ml-2">
                               <button onClick={() => setEditOpcion({ ...op })} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all" title="Editar Opción"><IoCreateOutline size={15} /></button>
                               <button onClick={() => eliminarOpcion(op.id_opcion)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar Opción"><IoTrashOutline size={15} /></button>
                            </div>

                            {op.es_correcta && (
                              <div className="absolute top-0 right-0 p-1">
                                <span className="text-[7px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-bl-lg uppercase tracking-tighter border-l border-b border-emerald-200/50">Correcta</span>
                              </div>
                            )}
                         </div>
                       ))}
                       
                       <button 
                         onClick={() => setCrearOpcionOpen({ open: true, id_pregunta: p.id_pregunta })}
                         className="p-5 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/30 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] group/addopt"
                       >
                         <IoAddOutline size={18} className="group-hover/addopt:rotate-90 transition-transform duration-300" />
                         Añadir Alternativa
                       </button>
                    </div>

                    {p.opciones.length === 0 && (
                      <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
                        <IoAlertCircleOutline size={18} />
                        <span className="text-[11px] font-bold">Esta pregunta requiere al menos una opción de respuesta configurada.</span>
                      </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sub-Modals (Pregunta Create/Edit) */}
      <AdminModal
        isOpen={crearPreguntaOpen || !!editPregunta}
        onClose={() => { setCrearPreguntaOpen(false); setEditPregunta(null); }}
        title={editPregunta ? "Actualizar Pregunta" : "Configurar Nueva Pregunta"}
        maxWidth="max-w-md"
        footer={
          <div className="flex gap-4">
             <button onClick={() => { setCrearPreguntaOpen(false); setEditPregunta(null); }} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Descartar</button>
             <button 
                onClick={editPregunta ? guardarPregunta : crearPregunta} 
                className="px-8 py-3 bg-[#0E1C2B] text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-lg shadow-slate-900/10"
             >
               {editPregunta ? "Guardar Cambios" : "Añadir al Banco"}
             </button>
          </div>
        }
      >
        <div className="space-y-6">
           <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <IoBulbOutline className="text-amber-500" size={18} />
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planteamiento del Reactivo</label>
              </div>
              <textarea
                value={editPregunta ? editPregunta.texto_pregunta : nuevaPregunta.texto_pregunta}
                onChange={(e) => editPregunta ? setEditPregunta({...editPregunta, texto_pregunta: e.target.value}) : setNuevaPregunta({...nuevaPregunta, texto_pregunta: e.target.value})}
                placeholder="Escribe el enunciado técnico aquí..."
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-[13px] font-medium h-32 text-slate-700 placeholder:text-slate-300 resize-none shadow-sm"
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <InputComponent
                label="Valor (Puntos)"
                type="number"
                value={String(editPregunta ? editPregunta.puntos : nuevaPregunta.puntos)}
                onChange={(e) => editPregunta ? setEditPregunta({...editPregunta, puntos: Number(e.target.value)}) : setNuevaPregunta({...nuevaPregunta, puntos: Number(e.target.value)})}
              />
              <InputComponent
                label="Orden de Aparición"
                type="number"
                value={String(editPregunta ? editPregunta.orden : nuevaPregunta.orden)}
                onChange={(e) => editPregunta ? setEditPregunta({...editPregunta, orden: Number(e.target.value)}) : setNuevaPregunta({...nuevaPregunta, orden: Number(e.target.value)})}
              />
           </div>
        </div>
      </AdminModal>

      {/* Sub-Modals (Opcion Create/Edit) */}
      <AdminModal
        isOpen={crearOpcionOpen.open || !!editOpcion}
        onClose={() => { setCrearOpcionOpen({open: false, id_pregunta: null}); setEditOpcion(null); }}
        title={editOpcion ? "Editar Respuesta" : "Nueva Alternativa de Respuesta"}
        maxWidth="max-w-sm"
        footer={
          <div className="flex gap-4">
             <button onClick={() => { setCrearOpcionOpen({open: false, id_pregunta: null}); setEditOpcion(null); }} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
             <button 
               onClick={editOpcion ? guardarOpcion : crearOpcion} 
               className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-lg shadow-emerald-900/10"
             >
               Confirmar Opción
             </button>
          </div>
        }
      >
        <div className="space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <IoOptionsOutline className="text-sky-500" size={18} />
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuración de Alternativa</label>
           </div>

           <InputComponent
             label="Contenido de la Opción"
             value={editOpcion ? editOpcion.texto_opcion : nuevaOpcion.texto_opcion}
             onChange={(e) => editOpcion ? setEditOpcion({...editOpcion, texto_opcion: e.target.value}) : setNuevaOpcion({...nuevaOpcion, texto_opcion: e.target.value})}
             placeholder="Ej: Opción verdadera o técnica"
           />
           
           <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer group transition-all hover:bg-emerald-50 hover:border-emerald-200 shadow-sm">
              <div className="relative flex items-center justify-center">
                 <input
                   type="checkbox"
                   className="peer w-6 h-6 rounded-lg border-slate-200 text-emerald-500 focus:ring-emerald-500/10 transition-all cursor-pointer bg-white"
                   checked={!!(editOpcion ? editOpcion.es_correcta : nuevaOpcion.es_correcta)}
                   onChange={(e) => editOpcion ? setEditOpcion({...editOpcion, es_correcta: e.target.checked}) : setNuevaOpcion({...nuevaOpcion, es_correcta: e.target.checked})}
                 />
              </div>
              <div className="flex flex-col min-w-0">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-600 transition-colors">Validación Académica</span>
                 <span className="text-[12px] font-bold text-slate-600 truncate">Es la respuesta correcta</span>
              </div>
           </label>
        </div>
      </AdminModal>
    </AdminModal>
  );
}
