import React, { useEffect, useRef, useState } from "react";
import { MdLock, MdCheckCircle, MdPlayCircleFilled, MdMenuBook, MdArrowForwardIos, MdArrowDropDown, MdQuiz } from "react-icons/md";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

interface Curso {
  id_curso: number | string;
  nombre: string;
  progreso_total: number;
  lecciones_completadas: number;
  total_lecciones: number;
}
interface Leccion {
  id_leccion?: number | string;
  id?: number | string;
  titulo: string;
  duracion?: number;
  orden?: number;
  estado?: string;
  progreso_porcentaje?: number;
  es_actual?: boolean;
  completada?: boolean;
}
interface Modulo {
  id: number | string;
  titulo: string;
  orden: number;
  total_lecciones: number;
  lecciones_completadas: number;
  lecciones: Leccion[];
}

interface Props {
  curso: Curso;
  modulos: Modulo[];
  leccionActualId: number | string;
}

const SidebarIndice: React.FC<Props> = ({ curso, modulos, leccionActualId }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [modulosExpandidos, setModulosExpandidos] = useState<{[id: string]: boolean}>({});
  const [mensajeBloqueado, setMensajeBloqueado] = useState<{[key: string]: boolean}>({});
  const [posicionMensaje, setPosicionMensaje] = useState<{top: number, left: number} | null>(null);
  const navigate = useNavigate();

  // Inicializar estados de módulos (expandidos)
  useEffect(() => {
    if (!leccionActualId || modulos.length === 0 || !curso?.id_curso) return;

    const key = `modulos_expandidos_curso_${curso.id_curso}`;
    let inicial: {[id: string]: boolean} = {};
    const guardado = localStorage.getItem(key);
    if (guardado) {
      try {
        inicial = JSON.parse(guardado);
      } catch {
        inicial = {};
      }
    }
    const moduloActual = modulos.find(m => m.lecciones.some(l => String(l.id_leccion ?? l.id) === String(leccionActualId)));
    if (!moduloActual) return;
    // Siempre expandir el módulo actual
    modulos.forEach(m => {
      if (inicial[String(m.id)] === undefined) inicial[String(m.id)] = false;
    });
    inicial[String(moduloActual.id)] = true;
    setModulosExpandidos(inicial);
  }, [leccionActualId, modulos, curso?.id_curso]);

  // Guardar en localStorage al cambiar
  useEffect(() => {
    if (curso?.id_curso) {
      localStorage.setItem(`modulos_expandidos_curso_${curso.id_curso}`, JSON.stringify(modulosExpandidos));
    }
  }, [modulosExpandidos, curso?.id_curso]);

  // Scroll automático a la lección actual
  useEffect(() => {
    setTimeout(() => {
      const el = sidebarRef.current?.querySelector(`[data-leccion-id='${leccionActualId}']`);
      if (el && sidebarRef.current) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight-pulse");
        setTimeout(() => el.classList.remove("highlight-pulse"), 2000);
      }
    }, 300);
  }, [leccionActualId]);

  const toggleModulo = (id_modulo: string | number) => {
    setModulosExpandidos(prev => {
      const nuevo = { ...prev, [String(id_modulo)]: !prev[String(id_modulo)] };
      if (curso?.id_curso) {
        localStorage.setItem(`modulos_expandidos_curso_${curso.id_curso}`, JSON.stringify(nuevo));
      }
      return nuevo;
    });
  };

  const mensajeActivo = Object.values(mensajeBloqueado).some(Boolean);

  return (
    <>
      <div ref={sidebarRef} className="px-6 py-6 z-[200] relative bg-[#101A2B] text-gray-200 min-h-full">
        {/* Resumen de progreso */}
        <div className="mb-6">
          <div className="text-lg font-bold text-sky-400 mb-1">Progreso del curso</div>
          <div className="w-full h-3 bg-gray-700 rounded-full mb-2">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${curso?.progreso_total ?? 0}%` }} />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{curso?.lecciones_completadas ?? 0} de {curso?.total_lecciones ?? 0} lecciones</span>
            <span>{curso?.progreso_total ?? 0}%</span>
          </div>
        </div>

        {/* Lista de módulos y lecciones */}
        <div>
          {modulos.map((modulo) => {
            const expandido = !!modulosExpandidos[String(modulo.id)];
            return (
              <div key={modulo.id} className="mb-4">
                <div className="flex items-center font-semibold text-sky-400 mb-2 cursor-pointer select-none" onClick={() => toggleModulo(String(modulo.id))}>
                  <span className={`mr-2 transition-transform duration-200 ${expandido ? "rotate-90" : "rotate-0"}`}>
                    {expandido ? <MdArrowDropDown className="text-xl" /> : <MdArrowForwardIos className="text-base" />}
                  </span>
                  <span className="mr-2"><MdMenuBook className="text-xl" /></span>
                  {modulo.titulo}
                </div>
                {expandido && (
                  <div className="ml-4 overflow-visible transition-all duration-200 max-h-[1000px] opacity-100">
                    {modulo.lecciones.map((leccion, index) => {
                      let estadoColor = "";
                      let icono: React.ReactNode = "";
                      let extra: React.ReactNode = "";
                      const esActual = leccion.es_actual || false;
                      let bloqueada = false;

                      switch (leccion.estado) {
                        case "completada":
                          estadoColor = "bg-[#18263A] text-green-400 border-l-4 border-green-500";
                          icono = <MdCheckCircle className="text-lg text-green-400" />;
                          extra = null;
                          break;
                        case "en_curso":
                          estadoColor = "bg-[#18263A] text-sky-400 border-l-4 border-sky-400";
                          icono = <MdPlayCircleFilled className="text-lg text-sky-400" />;
                          extra = null;
                          break;
                        case "disponible":
                          estadoColor = "bg-[#18263A] text-gray-300 hover:bg-[#22304A]";
                          icono = <MdMenuBook className="text-lg text-gray-300" />;
                          break;
                        case "bloqueada":
                        default:
                          estadoColor = "bg-[#18263A] text-gray-500 cursor-not-allowed";
                          icono = <MdLock className="text-lg text-gray-500" />;
                          extra = null;
                          bloqueada = true;
                          break;
                      }

                      if (esActual && leccion.estado !== "completada") {
                        estadoColor = "bg-blue-100 text-blue-900 border-l-4 border-blue-500";
                        icono = <MdPlayCircleFilled className="text-lg text-blue-600" />;
                        extra = null;
                        // No marcar como bloqueada, solo ignorar el click
                        bloqueada = false;
                      }

                      const leccionKey = `leccion-${leccion.id_leccion ?? (leccion as any).id ?? index}`;
                      
                      return (
                        <div
                          key={leccionKey}
                          data-leccion-id={leccion.id_leccion ?? (leccion as any).id}
                          className={`relative flex items-center justify-between px-3 py-2 rounded transition-all mb-1 ${estadoColor} ${esActual ? "font-bold" : ""} text-gray-500`}
                          style={{ cursor: bloqueada ? "not-allowed" : "pointer", borderLeft: esActual ? "5px solid #2563eb" : undefined }}
                          onClick={async (e) => {
                            if (esActual && leccion.estado !== "completada") {
                              // Ignorar el click en la lección actual
                              return;
                            }
                            if (bloqueada) {
                              const key = `leccion-${leccion.id_leccion ?? (leccion as any).id ?? index}`;
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setPosicionMensaje({ top: rect.top + rect.height / 2, left: rect.right + 10 });
                              setMensajeBloqueado({[key]: true});
                              setTimeout(() => {
                                setMensajeBloqueado({});
                                setPosicionMensaje(null);
                              }, 3000);
                              return;
                            }
                            if (leccion.estado === "completada") {
                              navigate(`/curso/${curso.id_curso}/leccion/${leccion.id_leccion ?? leccion.id}`);
                              return;
                            }
                            if (leccion.estado === "disponible") {
                              const pendientes = JSON.parse(localStorage.getItem("heartbeats_pendientes") || "[]");
                              if (pendientes.length > 0) {
                                if (!window.confirm("Tu progreso actual se guardará automáticamente. ¿Continuar?")) {
                                  return;
                                }
                              }
                              localStorage.removeItem("heartbeats_pendientes");
                              if (!curso?.id_curso) {
                                alert("No se pudo obtener el id del curso. Por favor, recarga la página.");
                                return;
                              }
                              navigate(`/curso/${curso.id_curso}/leccion/${leccion.id_leccion ?? leccion.id}`);
                              if (window.innerWidth < 1024) {
                                setTimeout(() => {
                                  document.body.style.overflow = "auto";
                                }, 300);
                              }
                              setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }, 400);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {icono}
                            <span>{leccion.orden}. {leccion.titulo}</span>
                            {extra}
                          </div>
                          <span className="text-xs text-gray-400">{Math.round((leccion.duracion ?? 0)/60)} min</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón de examen final */}
        <div className="mt-8">
          {(curso?.progreso_total ?? 0) < 100 ? (
            <div className="bg-[#18263A] p-4 rounded text-center text-gray-400 border border-gray-700">
              <div className="flex items-center justify-center text-lg font-semibold mb-1 gap-2"><MdQuiz className="text-xl text-sky-400" /> Examen final</div>
              <div className="mb-2 flex items-center justify-center gap-1"><MdLock className="text-base text-gray-400" /> Bloqueado</div>
              <div>Completa todas las lecciones para acceder al examen</div>
              <div className="mt-1 text-xs">Faltan: {(curso?.total_lecciones ?? 0) - (curso?.lecciones_completadas ?? 0)} lecciones</div>
            </div>
          ) : (
            <button
              className="w-full bg-sky-600 border border-sky-400 text-white font-bold py-3 rounded hover:bg-sky-700 transition flex items-center justify-center gap-2"
              onClick={() => navigate(`/evaluation/${curso.id_curso}`)}
            >
              <MdQuiz className="text-xl text-white" /> Iniciar examen final
            </button>
          )}
        </div>
      </div>

      {/* Mensaje flotante con portal */}
      {mensajeActivo && posicionMensaje && createPortal(
        <div 
          className="fixed bg-red-500 text-white text-sm px-4 py-3 rounded-lg shadow-2xl whitespace-nowrap z-[9999] flex items-center gap-2"
          style={{ 
            top: `${posicionMensaje.top}px`, 
            left: `${posicionMensaje.left}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <MdLock className="text-base" /> Completa la lección anterior primero
        </div>,
        document.body
      )}
    </>
  );
};

export default SidebarIndice;
