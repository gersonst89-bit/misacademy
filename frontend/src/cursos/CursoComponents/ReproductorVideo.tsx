import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as Slider from "@radix-ui/react-slider";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import { API_URL } from "../../config/api";

interface Props {
  leccion: {
    url_video: string;
    titulo: string;
    id_leccion: number | string;
    orden?: number;
    duracion: number;
  };
  progreso: {
    id_progreso: number;
    ultimo_segundo_visto: number;
    porcentaje_completado: number;
    estado: string;
    duracion_video: number;
  };
  onLeccionCompletada?: (data: any) => void;
}

// Extrae el videoId de la URL (según la guía)
function extraerVideoIdDeURL(url: string): string {
  if (!url) return "";
  url = url.trim();
  if (url.includes("youtube.com/watch")) {
    const v = url.split("v=")[1]?.split("&")[0];
    return v || "";
  }
  if (url.includes("youtu.be/")) {
    return url.split("/").pop()?.split("?")[0] || "";
  }
  if (url.includes("youtube.com/embed/")) {
    return url.split("embed/")[1]?.split("?")[0] || "";
  }
  return url;
}

const HEARTBEAT_INTERVAL = 8000; // ms
const UMBRAL_COMPLETACION = 90; // %


const ReproductorVideo: React.FC<Props> = (props) => {
  const { leccion, progreso, onLeccionCompletada } = props;
  const playerRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isVolumeSliderActive, setIsVolumeSliderActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const videoUrl = leccion.url_video || "";
  const videoId = extraerVideoIdDeURL(videoUrl);

  // Validar videoId antes de renderizar el reproductor
  if (!videoId || typeof videoId !== 'string' || videoId.length !== 11) {
    return <div className="text-center text-red-500">Video no disponible o ID inválido.</div>;
  }

  // Heartbeat localStorage helpers
  function guardarHeartbeatPendiente(payload: any) {
    const pendientes = JSON.parse(localStorage.getItem("heartbeats_pendientes") || "[]");
    pendientes.push({ ...payload, timestamp: Date.now(), intentos: 1 });
    if (pendientes.length > 50) pendientes.splice(0, pendientes.length - 50);
    localStorage.setItem("heartbeats_pendientes", JSON.stringify(pendientes));
  }

  function enviarHeartbeatsPendientes(token: string) {
    const pendientes = JSON.parse(localStorage.getItem("heartbeats_pendientes") || "[]");
    if (!pendientes.length) return;
    const promises = pendientes.map((hb: any) =>
      axios.post(
        `${API_URL}/lecciones/${leccion.id_leccion}/heartbeat`,
        {
          id_progreso: hb.id_progreso,
          current_time: hb.current_time,
          previous_time: hb.previous_time,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );
    Promise.allSettled(promises).then((results) => {
      const fallidos: any[] = [];
      results.forEach((r, idx) => {
        if (r.status !== "fulfilled") {
          const hb = pendientes[idx];
          hb.intentos = (hb.intentos || 1) + 1;
          if (hb.intentos < 3) fallidos.push(hb);
        }
      });
      if (fallidos.length) {
        localStorage.setItem("heartbeats_pendientes", JSON.stringify(fallidos));
      } else {
        localStorage.removeItem("heartbeats_pendientes");
      }
    });
  }

  const previousTimeRef = useRef<number>(progreso?.ultimo_segundo_visto || 0);
  const initialProgresoIdRef = useRef<number | null>(null);
  // Proteger overlay contra manipulación (CORREGIDO)
  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    // 1. Funciones de bloqueo (Click derecho y Teclado)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 2. Función ROBUSTA para recrear el overlay
    const forceRestoreOverlay = () => {
      // Desconectamos el observador un momento para no causar bucles infinitos
      if (observerRef.current) observerRef.current.disconnect();

      // Verificamos si ya existe uno por si acaso (para no duplicar)
      const existing = containerElement.querySelector('[data-overlay-protection="true"]');
      if (!existing) {
        const overlay = document.createElement('div');
        // Importante: Copiamos los estilos exactos que usas en el JSX
        overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; user-select: none; -webkit-user-select: none;';
        overlay.setAttribute('data-overlay-protection', 'true');
        overlay.addEventListener('contextmenu', (e) => e.preventDefault()); // Bloqueo directo al elemento nuevo
        
        containerElement.appendChild(overlay);
        
        // LA CLAVE: Actualizamos la referencia de React al nuevo elemento creado
        overlayRef.current = overlay;
      }

      // Volvemos a encender el observador
      if (observerRef.current) {
        observerRef.current.observe(containerElement, { childList: true, subtree: true });
      }
    };

    // 3. El Vigilante (MutationObserver)
    observerRef.current = new MutationObserver((mutations) => {
      let needsRestore = false;
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          // Detectamos si lo que se borró fue nuestro overlay
          if (node instanceof HTMLElement) {
             // Comparamos si es la referencia que teníamos O si tiene el atributo de protección
             if (node === overlayRef.current || node.getAttribute('data-overlay-protection') === 'true') {
               needsRestore = true;
             }
          }
        });
      });

      if (needsRestore) {
        forceRestoreOverlay();
      }
    });

    // Iniciar vigilancia
    observerRef.current.observe(containerElement, {
      childList: true,
      subtree: true,
    });

    // Listeners generales
    containerElement.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventDevTools);

    // 4. Intervalo de seguridad (Backup por si falla el observer)
    const checkInterval = setInterval(() => {
      // Si la referencia existe pero NO está conectada al DOM (significa que fue borrada)
      // O si no encontramos ningún elemento con el atributo de protección
      const isDisconnected = overlayRef.current && !overlayRef.current.isConnected;
      const isMissing = !containerElement.querySelector('[data-overlay-protection="true"]');

      if (isDisconnected || isMissing) {
        forceRestoreOverlay();
      }
    }, 500);

    // Limpieza al desmontar
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      containerElement.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventDevTools);
      clearInterval(checkInterval);
    };
  }, []);

  // Capturar el id_progreso inicial solo una vez por lección
  useEffect(() => {
    if (progreso?.id_progreso) {
      initialProgresoIdRef.current = progreso.id_progreso;
    }
  }, [leccion.id_leccion]);

  useEffect(() => {
    if (!initialProgresoIdRef.current) return;
    const token = localStorage.getItem("token") || "";

    // Cargar YouTube API si no está presente
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Heartbeat principal
    function sendHeartbeat(esFinal = false) {
      if (!ytPlayerRef.current || !initialProgresoIdRef.current) return;
      
      const rawCurrentTime = ytPlayerRef.current.getCurrentTime?.();
      if (typeof rawCurrentTime !== 'number' || isNaN(rawCurrentTime)) return;
      
      const currentTime = Math.floor(rawCurrentTime);
      const payload = {
        id_progreso: initialProgresoIdRef.current,
        current_time: Math.max(0, currentTime),
        previous_time: Math.max(0, previousTimeRef.current),
      };
      previousTimeRef.current = currentTime;
      axios.post(`${API_URL}/lecciones/${leccion.id_leccion}/heartbeat`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (typeof onLeccionCompletada === "function") {
          onLeccionCompletada(res.data);
        }
      })
        .catch(() => {
          guardarHeartbeatPendiente(payload);
        });
    }

    // Heartbeat cada 8 segundos mientras reproduce
    function onPlayerStateChange(event: any) {
      if (event.data === 1) {
        // PLAYING
        setIsPlaying(true);
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => sendHeartbeat(false), HEARTBEAT_INTERVAL);
        }
        // Actualizar progreso visual cada segundo
        if (!progressIntervalRef.current) {
          progressIntervalRef.current = setInterval(() => {
            if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
              const time = ytPlayerRef.current.getCurrentTime();
              setCurrentTime(time);
              // Actualizar el tiempo máximo visto
              setMaxWatchedTime(prev => Math.max(prev, time));
            }
          }, 1000);
        }
      } else if (event.data === 2 || event.data === 0) {
        // PAUSED or ENDED
        setIsPlaying(false);
        sendHeartbeat(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }

    function onPlayerReady(event: any) {
      const dur = event.target.getDuration();
      setDuration(dur);
      // Establecer tiempo inicial si existe progreso
      if (progreso?.ultimo_segundo_visto > 0) {
        event.target.seekTo(progreso.ultimo_segundo_visto, true);
        setCurrentTime(progreso.ultimo_segundo_visto);
        setMaxWatchedTime(progreso.ultimo_segundo_visto);
      }
    }

    // Inicializar reproductor YouTube cuando la API esté lista
    function initPlayer() {
      if (!playerRef.current || !(window as any).YT || !(window as any).YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }
      
      // Destruir reproductor anterior si existe
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
      }
      
      ytPlayerRef.current = new (window as any).YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,              // Sin controles
          modestbranding: 1,        // Sin logo de YouTube
          rel: 0,                   // Sin videos relacionados
          showinfo: 0,              // Sin información del video
          fs: 0,                    // Sin botón de fullscreen
          disablekb: 1,             // Deshabilitar teclado
          iv_load_policy: 3,        // Sin anotaciones
          cc_load_policy: 0,        // Sin subtítulos por defecto
          playsinline: 1,           // Reproducir inline en móviles
          enablejsapi: 1,           // Habilitar API de JS
          origin: window.location.origin,
          widget_referrer: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });

      // Ocultar sugerencias de YouTube con CSS
      const style = document.createElement('style');
      style.textContent = `
        .ytp-pause-overlay,
        .ytp-scroll-min,
        .ytp-player-content,
        .ytp-endscreen-content,
        .ytp-ce-element,
        .ytp-cards-teaser,
        .ytp-suggested-action {
          display: none !important;
        }
      `;
      if (!document.getElementById('hide-yt-suggestions')) {
        style.id = 'hide-yt-suggestions';
        document.head.appendChild(style);
      }
    }

    initPlayer();

    // Enviar heartbeats pendientes al recuperar conexión
    function handleOnline() {
      enviarHeartbeatsPendientes(token);
    }
    window.addEventListener("online", handleOnline);

    // Limpiar intervalos y listeners al desmontar
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      window.removeEventListener("online", handleOnline);
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
      }
    };
  }, [leccion.id_leccion]);

  if (!videoId) {
    return <div className="text-center text-red-500">Video no disponible para esta lección.</div>;
  }

  const togglePlayPause = () => {
    if (ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (ytPlayerRef.current) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    // Solo permitir avanzar hasta el punto máximo que se ha reproducido
    if (newTime <= maxWatchedTime && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const time = (percentage / 100) * duration;
    setHoverTime(time);
    setHoverPosition(percentage);
  };

  const handleProgressLeave = () => {
    setHoverTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mb-6 z-0">
      <div 
        ref={containerRef}
        className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-lg mx-auto z-0 relative"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      >
        <style>{`
          #youtube-player-${leccion.id_leccion} .ytp-pause-overlay,
          #youtube-player-${leccion.id_leccion} .ytp-scroll-min,
          #youtube-player-${leccion.id_leccion} .ytp-player-content,
          #youtube-player-${leccion.id_leccion} .ytp-endscreen-content,
          #youtube-player-${leccion.id_leccion} .ytp-ce-element,
          #youtube-player-${leccion.id_leccion} .ytp-cards-teaser,
          #youtube-player-${leccion.id_leccion} .ytp-suggested-action {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `}</style>
        <div
          ref={playerRef}
          id={`youtube-player-${leccion.id_leccion}`}
          className="w-full h-full"
        />
        <div 
          ref={overlayRef}
          data-overlay-protection="true"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            zIndex: 10,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer',
          }} 
          onClick={togglePlayPause}
          onContextMenu={(e) => e.preventDefault()}
        />
        {/* Controles profesionales */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 z-20">
          {/* Barra de progreso principal */}
          <div 
            className="relative"
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            {/* Tooltip de previsualización */}
            {hoverTime !== null && (
              <div 
                className="absolute bottom-full mb-2 transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${hoverPosition}%` }}
              >
                <div className="bg-black/90 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  {formatTime(hoverTime)}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90 mx-auto"></div>
              </div>
            )}
            
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-2 cursor-pointer"
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
            >
            <Slider.Track className="bg-gray-600 relative grow rounded-full h-1.5">
              {/* Progreso máximo visto (buffer) */}
              <div 
                className="absolute bg-gray-400 rounded-full h-full"
                style={{ width: `${duration > 0 ? (maxWatchedTime / duration) * 100 : 0}%` }}
              />
              {/* Progreso actual */}
              <Slider.Range className="absolute bg-red-600 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-4 h-4 bg-white rounded-full shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 transition-transform"
              aria-label="Progress"
            />
          </Slider.Root>
          </div>

          {/* Controles inferiores */}
          <div className="flex items-center justify-between text-white mt-3">
            <div className="flex items-center gap-3">
              {/* Botón Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="hover:scale-110 transition-transform p-2 hover:bg-white/20 rounded-full"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              {/* Control de volumen */}
              <div 
                className="flex items-center relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <div className={`flex items-center gap-2 bg-black/90 rounded-full transition-all duration-200 ${
                  showVolumeSlider ? 'pr-4 pl-2' : 'px-2'
                }`}>
                  <button
                    onClick={toggleMute}
                    className="hover:scale-110 transition-transform p-2 hover:bg-white/20 rounded-full"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  {/* Slider de volumen integrado */}
                  <div 
                    className={`transition-all duration-200 overflow-hidden ${
                      showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'
                    }`}
                  >
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-24 h-5"
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                    >
                      <Slider.Track className="bg-gray-600 relative grow rounded-full h-1">
                        <Slider.Range className="absolute bg-white rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb
                        className="block w-3 h-3 bg-white rounded-full shadow hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white transition-transform"
                        aria-label="Volume"
                      />
                    </Slider.Root>
                  </div>
                </div>
              </div>

              {/* Tiempo */}
              <span className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Controles derechos */}
            <div className="flex items-center gap-2">
              <button
                className="hover:scale-110 transition-transform p-2 hover:bg-white/20 rounded-full"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReproductorVideo;
