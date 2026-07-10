import React, { useState, useEffect, useMemo, useRef } from "react";
import type { Curso, Modulo, Leccion } from "../../types/models";
import InputComponent from "../Components/InputComponent";
import SearchableSelect from "../Components/SearchableSelect";
import { apiClient } from "../../services/apiClient";
import AdminModal from "../Components/AdminModal";

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

interface YoutubeDurationHiddenProps {
  videoId: string;
  onDuration: (duration: number) => void;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function YoutubeDurationHidden({
  videoId,
  onDuration,
}: YoutubeDurationHiddenProps) {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoId) return;
    let player: any = null;

    function loadYTScript(callback: () => void) {
      if (window.YT && window.YT.Player) {
        callback();
        return;
      }
      
      const existingScript = document.getElementById("yt-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "yt-iframe-api";
        document.body.appendChild(tag);
      }
      
      const oldCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (oldCallback) oldCallback();
        callback();
      };
    }

    function createPlayer() {
      if (!playerRef.current) return;
      
      player = new window.YT.Player(playerRef.current, {
        videoId,
        height: "0",
        width: "0",
        events: {
          onReady: (event: any) => {
            try {
              let duration = event.target.getDuration();
              if (!duration || duration === 0) {
                setTimeout(() => {
                  if (event.target && typeof event.target.getDuration === 'function') {
                    duration = event.target.getDuration();
                    if (duration && duration > 0) {
                      onDuration(duration);
                    }
                  }
                }, 1500);
              } else {
                onDuration(duration);
              }
            } catch (e) {
              console.warn("Error getting YT duration:", e);
            }
          },
          onError: () => {
            onDuration(0);
          },
        },
      });
    }

    loadYTScript(createPlayer);

    return () => {
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch (e) {
          console.warn("Error destroying YT player:", e);
        }
      }
    };
  }, [videoId, onDuration]);

  return <div ref={playerRef} style={{ display: "none" }} />;
}

export const AddLeccionModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newLeccion: Omit<Leccion, "id_leccion">) => Promise<any>;
}) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState("");
  const [calculandoDuracion, setCalculandoDuracion] = useState(false);
  const [urlVideo, setUrlVideo] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [orden, setOrden] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursoSelected, setCursoSelected] = useState<number | "">("");
  const [moduloSelected, setModuloSelected] = useState<number | "">("");

  const [estado, setEstado] = useState<"Publicado" | "Activo" | "Inactivo">("Publicado");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCursos = async () => {
      let allCursos: Curso[] = [];
      let page = 1;

      try {
        while (true) {
          const res = await apiClient.get("/admin/cursos", {
            params: { page }
          });

          const data = res.data;
          const items = data.data || [];

          if (items.length === 0) break;

          allCursos = [...allCursos, ...items];
          page++;
        }
      } catch (error) {
        console.error("Error cargando cursos:", error);
      }

      setCursos(allCursos);
    };

    const fetchModulos = async () => {
      try {
        let pagina = 1;
        let todosLosModulos: Modulo[] = [];
        let totalPages = 1;

        do {
          const res = await apiClient.get("/admin/modulos", {
            params: { page: pagina }
          });

          const data = res.data;
          todosLosModulos = [...todosLosModulos, ...(data.data || [])];
          totalPages = data.last_page || data.meta?.last_page || 1;
          pagina++;
        } while (pagina <= totalPages);

        setModulos(todosLosModulos);
      } catch (error) {
        console.error("Error cargando módulos:", error);
      }
    };

    fetchCursos();
    fetchModulos();
  }, [isOpen]);

  const modulosFiltrados = useMemo(() => {
    if (cursoSelected === "") return [];
    return modulos.filter((m) => m.id_curso === Number(cursoSelected));
  }, [cursoSelected, modulos]);

  const handleSave = async () => {
    setErrorMessage(null);

    if (!titulo.trim() || !moduloSelected) {
      setErrorMessage("Por favor, complete todos los campos requeridos.");
      return;
    }

    const nuevaLeccion: any = {
      titulo,
      descripcion: descripcion || "",
      url_video: urlVideo || "",
      duracion: duracion ? parseInt(duracion) : 0,
      estado,
      orden: orden ? parseInt(orden) : 1,
      id_modulo: Number(moduloSelected),
    };

    try {
      const result = await onSave(nuevaLeccion);

      if (result === true) {
        setErrorMessage(null);
        onClose();
        return;
      }

      if (result && typeof result === "object") {
        if (result.errors && typeof result.errors === "object") {
          const firstFieldErrors = Object.values(result.errors)[0];
          if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
            setErrorMessage(firstFieldErrors[0]);
            return;
          }
        }

        if (typeof result.message === "string") {
          setErrorMessage(result.message);
          return;
        }
      }

      setErrorMessage("No se pudo guardar la lección. Revisa los datos.");
    } catch (error: any) {
      console.log("Error al crear lección (catch):", error);

      if (error?.errors && typeof error.errors === "object") {
        const firstFieldErrors = Object.values(error.errors)[0];
        if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
          setErrorMessage(firstFieldErrors[0]);
          return;
        }
      }

      if (typeof error?.message === "string") {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("No se pudo guardar la lección. Revisa los datos.");
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Nueva Lección"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Sincronización Automática YT
          </div>
          <button
            onClick={handleSave}
            disabled={calculandoDuracion}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50"
          >
            {calculandoDuracion ? "Cargando..." : "Publicar Lección"}
          </button>
          <button onClick={onClose} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm">
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6 md:space-y-8">
        <div className="p-6 md:p-8 bg-slate-100/40 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200/50 space-y-5 md:space-y-6 mx-1 md:mx-0">
           <div className="flex items-center gap-2 mb-2 ml-1">
              <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Configuración Académica</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Programa</label>
                <SearchableSelect
                  value={cursoSelected}
                  onChange={(v) => {
                    const cursoId = v === "" ? "" : Number(v);
                    setCursoSelected(cursoId);
                    setModuloSelected("");
                  }}
                  options={cursos.map((c) => ({
                    value: c.id_curso,
                    label: c.nombre,
                  }))}
                  placeholder="Buscar curso..."
                />
              </div>

              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Módulo</label>
                {!cursoSelected ? (
                  <div className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-300 italic flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    Requiere programa
                  </div>
                ) : (
                  <SearchableSelect
                    value={moduloSelected}
                    onChange={(v) => setModuloSelected(v === "" ? "" : Number(v))}
                    options={modulosFiltrados.map((m) => ({
                      value: m.id_modulo,
                      label: m.titulo,
                    }))}
                    placeholder="Buscar módulo..."
                  />
                )}
              </div>
           </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-50/40 rounded-[2rem] md:rounded-[3rem] border border-slate-100/50 space-y-5 md:space-y-6 mx-1 md:mx-0">
           <div className="flex items-center gap-2 mb-2 ml-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contenido Multimedia</span>
           </div>

           <InputComponent
             label="Título de la Lección"
             value={titulo}
             placeholder="Ej: Análisis de Arquitecturas"
             onChange={(e) => setTitulo(e.target.value)}
           />

           <div>
             <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Descripción</label>
             <textarea
               value={descripcion}
               onChange={(e) => setDescripcion(e.target.value)}
               className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm font-bold h-28 md:h-32 text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
               placeholder="Objetivos de la sesión..."
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="relative group">
                 <InputComponent
                   label="URL YouTube"
                   value={urlVideo}
                   placeholder="https://youtube.com/..."
                   onChange={(e) => {
                     setUrlVideo(e.target.value);
                     const id = getYoutubeId(e.target.value);
                     setVideoId(id);
                     if (id) setCalculandoDuracion(true);
                   }}
                 />
                 {calculandoDuracion && (
                   <div className="absolute right-4 bottom-4">
                     <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                   </div>
                 )}
              </div>

              <div className="relative">
                 <InputComponent
                   label="Duración (Min)"
                   type="number"
                   value={duracion}
                   disabled
                   placeholder="Calculando..."
                   onChange={() => {}}
                 />
                 <div className="absolute right-4 bottom-4 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-2 py-1 rounded-md border border-sky-100">Auto</div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
             <InputComponent
               label="Orden"
               type="number"
               value={orden}
               placeholder="Ej: 1"
               onChange={(e) => setOrden(e.target.value)}
             />
             <div>
               <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Estado</label>
               <select
                 value={estado}
                 onChange={(e) => setEstado(e.target.value as any)}
                 className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-900 cursor-pointer"
               >
                 <option value="Publicado">Publicado</option>
                 <option value="Activo">Borrador</option>
                 <option value="Inactivo">Inactivo</option>
               </select>
             </div>
           </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake mx-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <p className="text-[10px] md:text-xs font-bold text-rose-600 uppercase tracking-wider">{errorMessage}</p>
          </div>
        )}
      </div>

      {videoId && (
        <YoutubeDurationHidden
          videoId={videoId}
          onDuration={(duration) => {
            setDuracion(Math.round(duration / 60).toString());
            setCalculandoDuracion(false);
          }}
        />
      )}
    </AdminModal>
  );
};
