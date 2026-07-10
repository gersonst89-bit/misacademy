import React, { useState, useEffect, useRef } from "react";
import InputComponent from "../Components/InputComponent";
import SearchableSelect from "../Components/SearchableSelect";
import type { Leccion, Modulo, Curso } from "../../types/models";
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

interface EditLeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leccion: Leccion;
  onSave: (updatedLeccion: Leccion) => Promise<boolean>;
}

export const EditLeccionModal: React.FC<EditLeccionModalProps> = ({
  isOpen,
  onClose,
  leccion,
  onSave,
}) => {
  const [titulo, setTitulo] = useState(leccion.titulo);
  const [descripcion, setDescripcion] = useState(leccion.descripcion ?? "");
  const [urlVideo, setUrlVideo] = useState(leccion.url_video ?? "");
  const [videoId, setVideoId] = useState<string | null>(
    getYoutubeId(leccion.url_video ?? "")
  );
  const [duracion, setDuracion] = useState(leccion.duracion?.toString() ?? "");
  const [calculandoDuracion, setCalculandoDuracion] = useState(false);
  const [orden, setOrden] = useState(leccion.orden?.toString() ?? "1");
  const [estado, setEstado] = useState<Leccion["estado"]>(
    leccion.estado ?? "Publicado"
  );

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(
    null
  );
  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(
    null
  );

  const [errorOrden, setErrorOrden] = useState("");

  const initializedRef = useRef(false);

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

    const fetchAllModulos = async () => {
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

    const fetchLecciones = async () => {
      try {
        const res = await apiClient.get("/admin/lecciones");
        const data = res.data;
        setLecciones(data.data || []);
      } catch (error) {
        console.error("Error cargando las lecciones:", error);
      }
    };

    Promise.all([fetchCursos(), fetchAllModulos(), fetchLecciones()]).then(
      () => {
        setLoadingData(false);
      }
    );
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !leccion || initializedRef.current) return;
    if (modulos.length === 0 || cursos.length === 0) return;

    setTitulo(leccion.titulo);
    setDescripcion(leccion.descripcion ?? "");
    setUrlVideo(leccion.url_video ?? "");
    setDuracion(leccion.duracion?.toString() ?? "");
    setOrden(leccion.orden?.toString() ?? "1");
    setEstado(leccion.estado ?? "Publicado");
    setVideoId(getYoutubeId(leccion.url_video ?? ""));

    const modulo =
      modulos.find((m) => m.id_modulo === leccion.id_modulo) || null;
    setModuloSeleccionado(modulo);

    const curso = modulo
      ? cursos.find((c) => c.id_curso === modulo.id_curso) || null
      : null;
    setCursoSeleccionado(curso);

    setErrorOrden("");
    initializedRef.current = true;
  }, [isOpen, leccion, modulos, cursos]);

  useEffect(() => {
    if (!isOpen) initializedRef.current = false;
  }, [isOpen]);

  const handleSave = async () => {
    setErrorOrden("");

    if (!cursoSeleccionado) {
      setErrorOrden("Selecciona un curso.");
      return;
    }

    if (!moduloSeleccionado) {
      setErrorOrden("Selecciona un módulo.");
      return;
    }

    if (!titulo.trim()) {
      setErrorOrden("El título es obligatorio.");
      return;
    }

    const ordenNum = parseInt(orden, 10);
    if (!ordenNum || ordenNum < 1) {
      setErrorOrden("El orden debe ser ≥ 1.");
      return;
    }

    const payload = {
      titulo,
      descripcion: descripcion.trim() || null,
      url_video: urlVideo.trim() || null,
      duracion: duracion ? parseInt(duracion, 10) : 0,
      orden: ordenNum,
      estado,
      id_modulo: moduloSeleccionado.id_modulo,
    };

    const ok = await onSave({ ...leccion, ...payload });
    if (ok) {
      onClose();
    } else {
      setErrorOrden("No se pudo guardar la lección. Inténtalo nuevamente.");
    }
  };

  const cursoOptions = cursos.map((c) => ({
    value: c.id_curso,
    label: c.nombre,
  }));

  const modulosOptions = modulos
    .filter(
      (m) => !cursoSeleccionado || m.id_curso === cursoSeleccionado.id_curso
    )
    .map((m) => ({
      value: m.id_modulo,
      label: m.titulo,
    }));

  const handleCursoChange = (id: number | "") => {
    const curso = cursos.find((c) => c.id_curso === id) || null;
    setCursoSeleccionado(curso);

    if (
      !curso ||
      (moduloSeleccionado && moduloSeleccionado.id_curso !== curso.id_curso)
    ) {
      setModuloSeleccionado(null);
    }
  };

  const handleModuloChange = (id: number | "") => {
    const modulo = modulos.find((m) => m.id_modulo === id) || null;
    setModuloSeleccionado(modulo);

    if (modulo) {
      const curso = cursos.find((c) => c.id_curso === modulo.id_curso) || null;
      setCursoSeleccionado(curso);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Lección"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Edición en Tiempo Real
          </div>
          <button
            onClick={handleSave}
            disabled={calculandoDuracion || loadingData}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50"
          >
            {calculandoDuracion ? "Cargando..." : "Guardar Cambios"}
          </button>
          <button onClick={onClose} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm">
            Cancelar
          </button>
        </>
      }
    >
      {loadingData ? (
        <div className="py-16 md:py-20 flex flex-col items-center justify-center gap-6">
          <div className="w-12 h-12 md:w-14 md:h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <div className="flex flex-col items-center gap-1">
             <span className="text-amber-600 font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] animate-pulse">Sincronizando Datos</span>
             <p className="text-slate-400 text-[10px] md:text-[11px] font-bold">Obteniendo estructura...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          <div className="p-6 md:p-8 bg-amber-50/40 rounded-[2rem] md:rounded-[2.5rem] border border-amber-100/50 space-y-5 md:space-y-6 mx-1 md:mx-0">
             <div className="flex items-center gap-2 mb-2 ml-1">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ubicación Académica</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2 ml-1">Programa</label>
                  <SearchableSelect
                    value={cursoSeleccionado?.id_curso || ""}
                    onChange={handleCursoChange}
                    options={cursoOptions}
                    placeholder="Seleccionar..."
                  />
                </div>

                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2 ml-1">Módulo</label>
                  <SearchableSelect
                    value={moduloSeleccionado?.id_modulo || ""}
                    onChange={handleModuloChange}
                    options={modulosOptions}
                    placeholder="Seleccionar..."
                  />
                </div>
             </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-50/40 rounded-[2rem] md:rounded-[3rem] border border-slate-100/50 space-y-5 md:space-y-6 mx-1 md:mx-0">
             <div className="flex items-center gap-2 mb-2 ml-1">
                <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Atributos Multimedia</span>
             </div>

             <InputComponent
               label="Título de la Lección"
               value={titulo}
               placeholder="Ej: Introducción a React"
               onChange={(e) => setTitulo(e.target.value)}
             />

             <div>
               <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Descripción</label>
               <textarea
                 value={descripcion}
                 onChange={(e) => setDescripcion(e.target.value)}
                 className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm font-bold h-28 md:h-32 text-slate-900 placeholder:text-slate-300"
                 placeholder="Objetivos de aprendizaje..."
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

          {videoId && (
            <YoutubeDurationHidden
              videoId={videoId}
              onDuration={(duration) => {
                setDuracion(Math.round(duration / 60).toString());
                setCalculandoDuracion(false);
              }}
            />
          )}

          {errorOrden && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake mx-1">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <p className="text-[10px] md:text-xs font-bold text-rose-600 uppercase tracking-wider">{errorOrden}</p>
            </div>
          )}
        </div>
      )}
    </AdminModal>
  );
};
