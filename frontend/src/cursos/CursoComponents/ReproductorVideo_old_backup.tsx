import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/youtube";
import axios from "axios";

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
  const playerRef = useRef<ReactPlayer>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const videoUrl = leccion.url_video || "";

  // Validar URL antes de renderizar
  if (!videoUrl) {
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
        `https://misacademy.siteedufuture.xyz/api/lecciones/${leccion.id_leccion}/heartbeat`,
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

  // Capturar el id_progreso inicial
  useEffect(() => {
    if (progreso?.id_progreso) {
      initialProgresoIdRef.current = progreso.id_progreso;
    }
  }, [leccion.id_leccion]);

  // Heartbeat system
  useEffect(() => {
    if (!initialProgresoIdRef.current || !isPlaying) return;
    const token = localStorage.getItem("token") || "";

    const sendHeartbeat = () => {
      if (!playerRef.current || !initialProgresoIdRef.current) return;
      
      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      const payload = {
        id_progreso: initialProgresoIdRef.current,
        current_time: Math.max(0, currentTime),
        previous_time: Math.max(0, previousTimeRef.current),
      };
      previousTimeRef.current = currentTime;
      
      axios.post(`https://misacademy.siteedufuture.xyz/api/lecciones/${leccion.id_leccion}/heartbeat`, payload, {
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
    };

    // Enviar heartbeat cada 8 segundos
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, leccion.id_leccion]);

  // Enviar heartbeats pendientes al recuperar conexión
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const handleOnline = () => enviarHeartbeatsPendientes(token);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);
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
      axios.post(`https://misacademy.siteedufuture.xyz/api/lecciones/${leccion.id_leccion}/heartbeat`, payload, {
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

  const handleVolumeChange = (newVolume: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(newVolume);
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (ytPlayerRef.current) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume || 50);
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    }
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
          }} 
          onContextMenu={(e) => e.preventDefault()}
        />
        <button
          onClick={togglePlayPause}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg z-20 transition-all"
          style={{ width: '64px', height: '64px' }}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 z-20">
          <div className="flex items-center gap-2 text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-red-600 h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
            
            {/* Control de volumen */}
            <div 
              className="relative flex items-center gap-1"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all"
                title={isMuted ? "Activar sonido" : "Silenciar"}
              >
                {isMuted || volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : volume > 50 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                  </svg>
                )}
              </button>
              
              {/* Slider de volumen */}
              {showVolumeSlider && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-2 rounded">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 accent-red-600"
                    style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReproductorVideo;
