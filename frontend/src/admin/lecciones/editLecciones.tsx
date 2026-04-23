import React, { useState, useEffect, useRef } from "react";
import InputComponent from "../components/InputComponent";
import SearchableSelect from "../components/SearchableSelect";
import type { Leccion, Modulo, Curso } from "../../types/models";
import { apiUrl,API_URL } from "../../config/api";

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
  useEffect(() => {
    if (!videoId) return;

    let player: any = null;

    const playerDiv = document.getElementById("yt-player-hidden");
    if (playerDiv) playerDiv.innerHTML = "";

    function loadYTScript(callback: () => void) {
      if (window.YT && window.YT.Player) {
        callback();
        return;
      }

      const existingScript = document.getElementById("yt-iframe-api");
      if (existingScript) {
        existingScript.remove();
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.id = "yt-iframe-api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = callback;
    }

    function createPlayer() {
      player = new window.YT.Player("yt-player-hidden", {
        videoId,
        height: "0",
        width: "0",
        events: {
          onReady: (event: any) => {
            let duration = event.target.getDuration();

            if (!duration || duration === 0) {
              // Reintentar si la duración es 0
              setTimeout(() => {
                duration = event.target.getDuration();
                if (duration && duration > 0) {
                  onDuration(duration);
                  event.target.destroy();
                }
              }, 1000);
            } else {
              onDuration(duration);
              event.target.destroy();
            }
          },
          onError: () => {
            onDuration(0);
            if (player) player.destroy();
          },
        },
      });
    }

    loadYTScript(createPlayer);

    return () => {
      if (player) player.destroy();
    };
  }, [videoId, onDuration]);

  return <div id="yt-player-hidden" style={{ display: "none" }} />;
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

    const token = localStorage.getItem("token");

    const fetchCursos = async () => {
      let allCursos: Curso[] = [];
      let page = 1;

      while (true) {
        const res = await fetch(
          `${API_URL}/mis-cursos?page=${page}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) break;

        const data = await res.json();
        const items = data.data || data.cursos?.data || data.cursos || [];

        if (items.length === 0) break;

        allCursos = [...allCursos, ...items];
        page++;
      }

      setCursos(allCursos);
    };

    const fetchAllModulos = async () => {
      try {
        let pagina = 1;
        let todosLosModulos: Modulo[] = [];
        let totalPages = 1;

        do {
          const res = await fetch(
            `${API_URL}/modulos/mis?page=${pagina}`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );

          const data = await res.json();
          todosLosModulos = [...todosLosModulos, ...(data.data || [])];
          totalPages = data.meta?.last_page || 1;
          pagina++;
        } while (pagina <= totalPages);

        setModulos(todosLosModulos);
      } catch (error) {
        console.error("Error cargando módulos:", error);
      }
    };

    const fetchLecciones = async () => {
      try {
        const res = await fetch(
          `${API_URL}/lecciones`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const data = await res.json();
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

    const ordenExiste = lecciones.some(
      (l) =>
        l.id_modulo === moduloSeleccionado.id_modulo &&
        l.orden === ordenNum &&
        l.id_leccion !== leccion.id_leccion
    );

    if (ordenExiste) {
      setErrorOrden(
        "Ya existe una lección con ese orden en el módulo seleccionado."
      );
      return;
    }

    const updatedLeccion: Leccion = {
      ...leccion,
      titulo,
      descripcion: descripcion.trim() || null,
      url_video: urlVideo.trim() || null,
      duracion: duracion ? parseInt(duracion, 10) : null,
      orden: ordenNum,
      estado,
      id_modulo: moduloSeleccionado.id_modulo,
      fecha_creacion: leccion.fecha_creacion,
      fecha_actualizacion: new Date().toISOString(),
    };

    const ok = await onSave(updatedLeccion);
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

  if (!isOpen) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-sky-600 mb-4" />
          <div className="text-lg text-gray-700 font-semibold">
            Cargando datos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Editar Lección
        </h2>

        {/* Curso */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Curso
          </label>
          <SearchableSelect
            value={cursoSeleccionado?.id_curso || ""}
            onChange={handleCursoChange}
            options={cursoOptions}
            placeholder="Selecciona un curso…"
            noOptionsMessage="No hay cursos"
          />
        </div>

        {/* Módulo */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Módulo
          </label>
          <SearchableSelect
            value={moduloSeleccionado?.id_modulo || ""}
            onChange={handleModuloChange}
            options={modulosOptions}
            placeholder="Selecciona un módulo…"
            noOptionsMessage="No hay módulos"
          />
        </div>

        {/* Título */}
        <InputComponent
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ingresa el título de la lección"
        />

        {/* Descripción */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ingresa la descripción de la lección"
            className="mt-1 p-2 w-full border border-gray-300 focus:ring-2 h-32 resize-none overflow-auto rounded-lg shadow-sm focus:outline-none focus:ring-sky-600 focus:border-sky-600"
          />
        </div>

        {/* URL Video */}
        <InputComponent
          label="URL del Video"
          value={urlVideo}
          onChange={(e) => {
            setUrlVideo(e.target.value);
            const id = getYoutubeId(e.target.value);
            setVideoId(id);
            if (id) setCalculandoDuracion(true);
          }}
          placeholder="Ingresa la URL del video"
        />

        {videoId && (
          <YoutubeDurationHidden
            videoId={videoId}
            onDuration={(duration) => {
              setDuracion(Math.round(duration).toString());
              setCalculandoDuracion(false);
            }}
          />
        )}

        {/* Duración */}
        <InputComponent
          label="Duración (min)"
          type="number"
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
          placeholder="Ingresa la duración en minutos"
          disabled
        />

        {/* Orden */}
        <InputComponent
          label="Orden"
          type="number"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          placeholder="Ingresa el orden de la lección"
        />

        {errorOrden && (
          <div className="mb-4 mt-2 text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 text-center text-sm">
            {errorOrden}
          </div>
        )}

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-sky-600 rounded hover:bg-sky-700 transition text-white text-md ${
              calculandoDuracion ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={calculandoDuracion}
          >
            {calculandoDuracion ? "Calculando duración..." : "Guardar"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
