import React, { useState, useEffect, useMemo } from "react";
import type { Curso, Modulo, Leccion } from "../../types/models";
import InputComponent from "../components/InputComponent";
import SearchableSelect from "../components/SearchableSelect";
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        const items = data.data || [];

        if (items.length === 0) break;

        allCursos = [...allCursos, ...items];
        page++;
      }

      setCursos(allCursos);
    };

    const fetchModulos = async () => {
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

    const nuevaLeccion: Omit<Leccion, "id_leccion"> = {
      titulo,
      descripcion,
      url_video: urlVideo || null,
      duracion: duracion ? parseInt(duracion) : null,
      estado: "Publicado",
      orden: orden ? parseInt(orden) : 1,
      id_modulo: moduloSelected,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: null,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Agregar Nueva Lección
        </h2>

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Curso
        </label>
        <SearchableSelect
          value={cursoSelected}
          onChange={(v) => {
            const cursoId = v === "" ? "" : Number(v);
            setCursoSelected(cursoId);
            setModuloSelected("");
            const filtrados = modulos.filter((m) => m.id_curso === cursoId);
            console.log("Módulos disponibles para este curso:", filtrados);
          }}
          options={cursos.map((c) => ({
            value: c.id_curso,
            label: c.nombre,
          }))}
          placeholder="Selecciona un curso"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1 mt-4">
          Módulo
        </label>
        {!cursoSelected ? (
          <div className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 mb-4">
            Selecciona un curso primero
          </div>
        ) : (
          <SearchableSelect
            value={moduloSelected}
            onChange={(v) => setModuloSelected(v === "" ? "" : Number(v))}
            options={modulosFiltrados.map((m) => ({
              value: m.id_modulo,
              label: m.titulo,
            }))}
            placeholder="Selecciona un módulo"
          />
        )}

        <label className="block text-sm font-semibold text-gray-700 mt-4">
          Título
        </label>
        <input
          type="text"
          value={titulo}
          placeholder="Título"
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 mb-4"
        />

        <label className="block text-sm font-semibold text-gray-700 ">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 p-2 w-full border h-28 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 mb-2"
          placeholder="Descripción"
        />

        <InputComponent
          label="URL del Video"
          value={urlVideo}
          placeholder="URL del Video"
          onChange={(e) => {
            setUrlVideo(e.target.value);
            const id = getYoutubeId(e.target.value);
            setVideoId(id);
            if (id) setCalculandoDuracion(true);
          }}
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

        <InputComponent
          label="Duración (min)"
          type="number"
          placeholder="Duración (min)"
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
          disabled
        />

        <InputComponent
          label="Orden"
          type="number"
          placeholder="Orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        />

        {errorMessage && (
          <div className="mt-4 mb-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 text-center">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-sky-600 rounded text-white hover:bg-sky-700 ${
              calculandoDuracion ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={calculandoDuracion}
          >
            {calculandoDuracion ? "Calculando duración..." : "Agregar"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
