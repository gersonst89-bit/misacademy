import React, { useState, useEffect } from "react";
import { MdMenu, MdErrorOutline, MdLock } from "react-icons/md";
import SidebarIndice from "./CursoComponents/SidebarIndice";
import HeaderLeccion from "./CursoComponents/HeaderLeccion";
import ReproductorVideo from "./CursoComponents/ReproductorVideo";
import BarraProgreso from "./CursoComponents/BarraProgreso";
import DescripcionLeccion from "./CursoComponents/DescripcionLeccion";
import MaterialesModulo from "./CursoComponents/MaterialesModulo";
import NavegacionRapida from "./CursoComponents/NavegacionRapida";
import ModalCompletacion from "./CursoComponents/ModalCompletacion";
import { useParams } from "react-router-dom";
import axios from "axios";
import HeaderLeccionSimple from "./CursoComponents/HeaderLeccionSimple";
import { API_URL } from "../config/api";

// LayoutDosColumnas: estructura responsive sin header propio
const LayoutDosColumnas: React.FC<{ sidebar: React.ReactNode; children: React.ReactNode }> = ({ sidebar, children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Escuchar evento global para abrir el sidebar desde el header
  React.useEffect(() => {
    const handler = () => setSidebarVisible(true);
    window.addEventListener("abrirSidebarCurso", handler);
    return () => window.removeEventListener("abrirSidebarCurso", handler);
  }, []);

  return (
    <div className="flex w-full h-screen bg-[#0D1A28] relative overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-[360px] h-full overflow-y-auto bg-[#101A2B] border-r border-gray-800 shadow-lg z-10">
        {sidebar}
      </aside>
      {/* Botón hamburguesa móvil (sin header) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[130] bg-[#101A2B] border border-gray-700 shadow p-2 rounded-full flex items-center justify-center"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
        onClick={() => setSidebarVisible(true)}
        aria-label="Abrir menú"
      >
        <MdMenu className="text-2xl text-sky-400" />
      </button>
      {/* Sidebar móvil */}
      {sidebarVisible && (
        <div className="fixed inset-0 z-[120] flex backdrop-blur-lg bg-transparent">
          <div className="w-4/5 max-w-xs bg-[#101A2B] h-full shadow-lg p-4 overflow-y-auto animate-slide-in-left border-r border-gray-800">
            <button
              className="absolute top-4 right-4 bg-gray-200 text-gray-700 rounded-full p-2"
              onClick={() => setSidebarVisible(false)}
              aria-label="Cerrar menú"
            >
              ✕
            </button>
            {sidebar}
          </div>
          <div className="flex-1" onClick={() => setSidebarVisible(false)} />
        </div>
      )}
      {/* Contenido principal */}
      <main
        className="flex-1 h-full overflow-y-auto px-2 py-3 sm:px-4 sm:py-6 md:px-8 md:py-10 lg:px-12 lg:py-12 max-w-full z-0 bg-[#0D1A28] text-gray-200 pt-16"
      >
        {children}
      </main>
    </div>
  );
};

const PaginaLeccion: React.FC = () => {
  const { idCurso, idLeccion } = useParams();
  const [estadoPagina, setEstadoPagina] = useState<'cargando'|'listo'|'error'|'acceso-denegado'>("cargando");
  const [curso, setCurso] = useState<any>(null);
  const [modulos, setModulos] = useState<any[]>([]);
  const [leccionActual, setLeccionActual] = useState<any>(null);
  const [progresoActual, setProgresoActual] = useState<any>(null);
  const [navegacion, setNavegacion] = useState<any>({ leccionAnterior: null, leccionSiguiente: null });
  const [puedeAccederSiguiente, setPuedeAccederSiguiente] = useState<boolean>(true);
  const [ui, setUI] = useState<any>({ sidebarAbierto: false, modalCompletacionVisible: false, modalBloqueoVisible: false });
  const [datosCompletacion, setDatosCompletacion] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // Paso 1: cargar datos iniciales
  useEffect(() => {
    async function cargarDatos() {
      setEstadoPagina("cargando");
      try {
        const token = localStorage.getItem("token");
        // 1. Acceso y progreso de la lección
        const resLeccion = await axios.get(`${API_URL}/lecciones/${idLeccion}/acceso`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataLeccion = resLeccion.data;
        // 3. Progreso completo del curso (sidebar) - SIEMPRE
        let dataProgreso = null;
        try {
          const resProgreso = await axios.get(`${API_URL}/cursos/${idCurso}/progreso`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          dataProgreso = resProgreso.data;
          setCurso({ ...dataProgreso.curso, id_curso: dataProgreso.curso.id });
          // Marcar la lección actual en la estructura antes de setModulos
          const estructuraConActual = dataProgreso.modulos.map((mod: any) => ({
            ...mod,
            lecciones: mod.lecciones.map((lec: any) => ({
              ...lec,
              es_actual: String(lec.id_leccion ?? lec.id) === String(idLeccion)
            }))
          }));
          setModulos(estructuraConActual);
        } catch {
          setCurso(null);
          setModulos([]);
        }
        // Si no puede acceder, bloquear la vista aunque el status sea 200
        if (dataLeccion.puede_acceder === false) {
          setError(dataLeccion);
          setEstadoPagina("acceso-denegado");
          return;
        }
        // 2. Datos completos de la lección (incluye url_video)
        const resLeccionInfo = await axios.get(`${API_URL}/lecciones/${idLeccion}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const infoLeccion = resLeccionInfo.data;
        // Asigna todos los campos de la lección incluyendo url_video
        setLeccionActual({
          ...infoLeccion.leccion,
          ...dataLeccion.progreso,
        });
        setProgresoActual(dataLeccion.progreso);

        // Obtener navegación real desde el backend
        const resNavegacion = await axios.get(`${API_URL}/lecciones/${idLeccion}/navegacion`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const navData = resNavegacion.data;
        setNavegacion({
          leccionAnterior: navData.anterior,
          leccionSiguiente: navData.siguiente
        });
        // Consultar acceso para la lección siguiente si existe
        if (navData.siguiente?.id_leccion) {
          try {
            const resAccesoSiguiente = await axios.get(`${API_URL}/lecciones/${navData.siguiente.id_leccion}/acceso`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setPuedeAccederSiguiente(!!resAccesoSiguiente.data.puede_acceder);
          } catch {
            setPuedeAccederSiguiente(false);
          }
        } else {
          setPuedeAccederSiguiente(true);
        }
        setEstadoPagina("listo");
      } catch (e: any) {
        if (e.response?.status === 403) {
          // Consultar progreso aunque acceso denegado
          try {
            const token = localStorage.getItem("token");
            const resProgreso = await axios.get(`${API_URL}/cursos/${idCurso}/progreso`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const dataProgreso = resProgreso.data;
            setCurso({ ...dataProgreso.curso, id_curso: dataProgreso.curso.id });
            const estructuraConActual = dataProgreso.modulos.map((mod: any) => ({
              ...mod,
              lecciones: mod.lecciones.map((lec: any) => ({
                ...lec,
                es_actual: String(lec.id_leccion ?? lec.id) === String(idLeccion)
              }))
            }));
            setModulos(estructuraConActual);
          } catch {
            setCurso(null);
            setModulos([]);
          }
          setError(e.response.data);
          setEstadoPagina("acceso-denegado");
        } else if (e.response?.status === 404) {
          setError({ mensaje: "Lección no encontrada" });
          setEstadoPagina("error");
        } else {
          setError(e);
          setEstadoPagina("error");
        }
      }
    }
    cargarDatos();
  }, [idCurso, idLeccion]);

  // Paso 2: manejo de estados de carga y error
  if (estadoPagina === "cargando") {
    return (
      <div className="flex flex-col h-screen bg-[#0D1A28]">
      <HeaderLeccionSimple curso={curso} />
      <div className="flex flex-1 overflow-hidden">
      <LayoutDosColumnas
        sidebar={<SidebarIndice
          curso={curso}
          modulos={modulos}
          leccionActualId={leccionActual?.id_leccion}
        />}
      >
        <div className="flex items-center justify-center w-full h-[350px]">
          <span className="animate-spin h-12 w-12 mr-3 border-4 border-blue-500 border-t-transparent rounded-full"></span>
        </div>
      </LayoutDosColumnas>
      </div>
      </div>
    );
  }
  if (estadoPagina === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0D1A28] text-red-500">
        <div className="flex items-center justify-center mb-4">
          <MdErrorOutline className="text-6xl text-red-500 drop-shadow-lg" />
        </div>
        <div className="text-2xl font-bold mb-2">Error al cargar la lección</div>
        <div className="text-base text-gray-400 mb-4">Ocurrió un problema inesperado. Por favor, intenta nuevamente.</div>
        <button className="mt-2 px-5 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition" onClick={()=>window.location.reload()}>Reintentar</button>
      </div>
    );
  }
  if (estadoPagina === "acceso-denegado") {
    // Buscar la primera lección disponible en la estructura de módulos (según respuesta de progreso)
    let idLeccionDisponible = null;
    let tituloLeccionDisponible = null;
    let nombreCurso = curso?.nombre || "";
    for (const mod of modulos) {
      if (Array.isArray(mod.lecciones)) {
        const disponible = mod.lecciones.find((l: any) => l.estado === "disponible" || l.estado === "en_curso");
        if (disponible) {
          idLeccionDisponible = disponible.id_leccion ?? disponible.id;
          tituloLeccionDisponible = disponible.titulo;
          break;
        }
      }
    }
    const req = error?.leccion_requerida;
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0D1A28] text-gray-200">
        <div className="flex items-center justify-center mb-4">
          <MdLock className="text-6xl text-sky-400 drop-shadow-lg" />
        </div>
        <div className="text-2xl font-bold mb-2 text-sky-400">Lección bloqueada</div>
        <div className="text-base text-gray-400 mb-2">Lección disponible para continuar:</div>
        <div className="font-semibold text-lg text-white mb-2">{tituloLeccionDisponible ?? req?.titulo}</div>
        <span className="text-sm text-gray-500 mb-4">Progreso: {req?.progreso ?? 0}%</span>
        {idLeccionDisponible ? (
          <button className="mt-2 px-5 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition" onClick={()=>window.location.href=`/curso/${curso?.id_curso ?? idCurso}/leccion/${idLeccionDisponible}`}>Ir a la lección disponible: {tituloLeccionDisponible}</button>
        ) : (
          <div className="text-sm text-gray-400 mt-2">No hay lección disponible para continuar en el curso <b>{nombreCurso}</b>.</div>
        )}
      </div>
    );
  }

  // Paso 3: render layout y componentes hijos
  // No renderizar SidebarIndice hasta que curso.id_curso esté definido
  if (!curso?.id_curso) {
    return <div className="flex items-center justify-center h-screen text-blue-700">Cargando curso...</div>;
  }
  return (
    <div className="flex flex-col h-screen bg-[#0D1A28]">
    <HeaderLeccionSimple curso={curso}/>
    <div className="flex flex-1 overflow-hidden">
    <LayoutDosColumnas
      sidebar={<SidebarIndice
        curso={curso}
        modulos={modulos}
        leccionActualId={leccionActual?.id_leccion}
      />}
    >
      <HeaderLeccion leccion={leccionActual} curso={curso} />
      <ReproductorVideo
        leccion={leccionActual}
        progreso={progresoActual}
        onLeccionCompletada={async (data) => {
          if (data?.leccion_completada) {
            setDatosCompletacion(data);
            setUI((prev: any) => ({ ...prev, modalCompletacionVisible: true }));
            // Si hay siguiente lección, consultar acceso y actualizar estado
            if (navegacion.leccionSiguiente?.id_leccion) {
              try {
                const token = localStorage.getItem("token");
                const resAccesoSiguiente = await axios.get(`${API_URL}/lecciones/${navegacion.leccionSiguiente.id_leccion}/acceso`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setPuedeAccederSiguiente(!!resAccesoSiguiente.data.puede_acceder);
              } catch {
                setPuedeAccederSiguiente(false);
              }
            }
              // Actualizar sidebar: consultar progreso y recargar estructura, pero sin limpiar el estado principal
              setUI((prev: any) => ({ ...prev, sidebarActualizando: true }));
              try {
                const token = localStorage.getItem("token");
                const resProgreso = await axios.get(`${API_URL}/cursos/${idCurso}/progreso`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const dataProgreso = resProgreso.data;
                setCurso((prevCurso: any) => ({ ...prevCurso, ...dataProgreso.curso, id_curso: dataProgreso.curso.id }));
                const estructuraConActual = dataProgreso.modulos.map((mod: any) => ({
                  ...mod,
                  lecciones: mod.lecciones.map((lec: any) => ({
                    ...lec,
                    es_actual: String(lec.id_leccion ?? lec.id) === String(idLeccion)
                  }))
                }));
                setModulos(estructuraConActual);
              } catch (e) {
                // Si falla, no actualiza el sidebar
              }
              setUI((prev: any) => ({ ...prev, sidebarActualizando: false }));
          }
          // Actualizar progreso del curso si viene en la respuesta
          if (data?.progreso_curso && curso) {
            setCurso((prev: any) => ({ ...prev, progreso_total: data.progreso_curso }));
          }
          // Mapear correctamente los campos del progreso recibido del backend
          if (data?.progreso) {
            setProgresoActual((prevProgreso: any) => ({
              porcentaje_completado: data.progreso.porcentaje ?? prevProgreso?.porcentaje_completado ?? 0,
              tiempo_visualizacion: data.progreso.tiempo_visto ?? prevProgreso?.tiempo_visualizacion ?? 0,
              duracion_video: data.progreso.duracion_total ?? prevProgreso?.duracion_video ?? 0,
              estado: data.progreso.estado ?? prevProgreso?.estado ?? 'No iniciado',
              ultimo_segundo_visto: data.progreso.ultimo_segundo ?? prevProgreso?.ultimo_segundo_visto ?? 0,
            }));
          }
        }}
      />
      <BarraProgreso progreso={progresoActual} />
      <DescripcionLeccion leccion={leccionActual} />
      {/* Materiales del módulo actual */}
      {(() => {
        // Buscar el módulo actual según la lección actual
        const moduloActual = modulos.find(mod => mod.lecciones.some((lec: any) => String(lec.id_leccion ?? lec.id) === String(leccionActual?.id_leccion)));
        if (!moduloActual) return null;
        return <MaterialesModulo idModulo={moduloActual.id} />;
      })()}
      <NavegacionRapida idCurso={idCurso ?? ""} navegacion={navegacion} puedeAccederSiguiente={puedeAccederSiguiente} />
      {ui.modalCompletacionVisible && (
        <ModalCompletacion
          curso={curso}
          leccion={leccionActual}
          onContinuar={() => {
            setUI((prev: any) => ({ ...prev, modalCompletacionVisible: false }));
            // Navegar a la siguiente lección si existe
            if (datosCompletacion?.siguiente_leccion) {
              window.location.href = `/curso/${idCurso}/leccion/${datosCompletacion.siguiente_leccion.id_leccion}`;
            }
          }}
          onCerrar={() => {
            setUI((prev: any) => ({ ...prev, modalCompletacionVisible: false }));
          }}
        />
      )}
    </LayoutDosColumnas>
    </div>
    </div>
  );
};

export default PaginaLeccion;
