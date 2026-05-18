import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Route as RouteIcon, 
  Layers, 
  Settings, 
  Bell, 
  CreditCard, 
  Award, 
  LogOut, 
  Menu, 
  ExternalLink, 
  ChevronDown, 
  Video, 
  FolderTree, 
  FileCheck,
  Search,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { apiUrl } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";

import ConfirmModal from "./Components/ConfirmModal";
import Acordeon from "./Components/Acordeon";

import Usuarios from "./usuarios/tabla";
import { Lecciones } from "./lecciones/tabla";
import { Dashboard } from "./dashboard/graficos";
import PagosAdminPage from "./pagos/pagos";
import { RutasAcademicas } from "./rutas/tabla";
import { LineasAcademicas } from "./lineas/tabla";
import { Cursos } from "./cursos/tabla";
import Evaluaciones from "./evaluaciones/tabla";
import { Modulos } from "./modulos/tabla";
import { Materiales } from "./materiales/tabla";
import Certificados from "./certificados/tabla";

import { Configuracion } from "./configuracion/page";
import { Notificaciones } from "./notificaciones/page";

export default function AdminLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [rol, setRol] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Optimizar para móvil al cargar
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 640) {
        setIsSidebarHidden(true);
        setSidebarOpen(false);
      } else {
        setIsSidebarHidden(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sincronizar sección activa con la URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      if (tab !== activeSection && !isBlockedForTeacher(tab)) {
        setActiveSection(tab);
      }
    } else {
      // Si no hay tab, volvemos a la sección por defecto según el rol
      if (rol === 1) {
        setActiveSection("dashboard");
      } else if (rol === 2) {
        setActiveSection("cursos");
      }
    }
  }, [searchParams, rol, activeSection]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [activeSection]);

  const isBlockedForTeacher = (section: string) => {
    if (rol !== 2) return false;
    return [
      "dashboard",
      "usuarios",
      "pagos",
      "certificados",
      "notificaciones",
      "lineas",
      "rutas",
    ].includes(section);
  };

  const handleMenuClick = (section: string) => {
    if (isBlockedForTeacher(section)) return;
    setSearchParams({ tab: section });
    setActiveSection(section);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      handleMenuClick(e.detail);
    };
    window.addEventListener('navigate-to-section', handleNavigate);
    return () => window.removeEventListener('navigate-to-section', handleNavigate);
  }, []);

  useEffect(() => {
    const userStored = localStorage.getItem("user");
    if (!userStored) {
      window.location.href = "/login";
      return;
    }

    fetch(apiUrl("/auth/profile"), {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((p) => {
        const userRole = p.id_rol || p.user?.id_rol || 3;
        setRol(userRole);
        setUserData(p.user || p);

        // Ya no redirigimos aquí, dejamos que el Guardia externo lo maneje
        if (userRole === 2) {
          setActiveSection("cursos");
        } else if (userRole === 1) {
          setActiveSection("dashboard");
        }
      })
      .catch((err) => {
        console.error("Error fetching profile in AdminLayout:", err);
        // Si falla, al menos intentamos mostrar el dashboard si el guardia lo permitió
        if (!activeSection) setActiveSection("dashboard");
      });
  }, []);


  const handleLogout = async () => {
    localStorage.removeItem("user");
    try {
      await fetch(apiUrl("/auth/logout"), { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error("Error during admin logout:", err);
    }
    // Limpiar CSRF token en memoria para que el próximo login genere uno fresco
    
    window.location.href = "/";
  };

  if (activeSection === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#03070c] gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white font-black tracking-[0.2em] uppercase text-sm italic">MIS <span className="text-sky-500">Academy</span></h2>
          <p className="text-sky-400/60 text-[9px] font-bold uppercase tracking-[0.3em]">Cargando Entorno Seguro</p>
        </div>
      </div>
    );
  }


  const renderContent = () => {
    if (isBlockedForTeacher(activeSection)) {
      return (
        <div className="p-10 text-red-500 font-black bg-red-500/5 rounded-3xl border border-red-500/10 flex items-center gap-4 uppercase tracking-widest text-xs">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
             <Settings className="w-5 h-5" />
          </div>
          <span>Acceso Restringido: Esta sección no está habilitada para tu rol.</span>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard": return <Dashboard />;
      case "usuarios": return <Usuarios />;
      case "cursos": return <Cursos />;
      case "rutas": return <RutasAcademicas />;
      case "lecciones": return <Lecciones />;
      case "lineas": return <LineasAcademicas />;
      case "certificados": return <Certificados />;
      case "pagos": return <PagosAdminPage />;
      case "evaluaciones": return <Evaluaciones />;
      case "modulos": return <Modulos />;
      case "materiales": return <Materiales />;
      case "configuracion": return <Configuracion />;
      case "notificaciones": return <Notificaciones />;
      default: return <Dashboard />;
    }
  };

  const menuItemClass = (section: string) => {
    const isBlocked = isBlockedForTeacher(section);
    const isActive = activeSection === section;
    const isCollapsed = window.innerWidth >= 640 && isSidebarHidden;

    return `
      text-left w-full flex items-center gap-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group
      ${isActive 
        ? "bg-sky-500/10 text-sky-400 font-black border-l-[3px] border-sky-400 rounded-l-none shadow-[inset_10px_0_15px_-10px_rgba(14,165,233,0.3)]" 
        : "text-slate-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent"}
      ${isBlocked ? "opacity-20 cursor-not-allowed grayscale" : "cursor-pointer"} 
      ${isCollapsed ? "justify-center h-11 w-11 mx-auto gap-0 px-0" : "px-4 py-2.5"}
    `;
  };


  return (
    <div className="flex h-screen overflow-hidden bg-[#03070c]" translate="no">
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        message="¿Estás seguro de cerrar sesión?"
      />

      {/* Determinar si mostrar etiquetas (Labels) */}
      {(() => {
        const showLabels = window.innerWidth < 640 ? sidebarOpen : !isSidebarHidden;
        const isCollapsed = window.innerWidth >= 640 && isSidebarHidden;
        
        return (
          <>
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md sm:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
              initial={false}
              animate={{ 
                width: window.innerWidth < 640 ? (sidebarOpen ? 288 : 0) : (isSidebarHidden ? 80 : 288),
                x: window.innerWidth < 640 ? (sidebarOpen ? 0 : -288) : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className={`fixed top-0 left-0 bottom-0 z-50 bg-[#050a10] text-white flex flex-col pt-8 pb-6
                sm:sticky sm:top-0 sm:h-screen
                border-r border-white/5 relative overflow-hidden
              `}
            >
              <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

              <div className={`px-6 mb-10 flex items-center justify-between relative z-10 ${isCollapsed ? "justify-center px-0" : ""}`}>
                {showLabels && (
                  <Link to="/admin" className="flex items-center gap-3 group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img src="/logomatt.png" alt="Logo" className="h-8 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm leading-tight tracking-tight text-white uppercase italic text-[11px] whitespace-nowrap">MIS <span className="text-sky-500">Academy</span></span>
                      <span className="text-[7px] uppercase tracking-[0.4em] text-white/30 font-black">Admin Panel</span>
                    </div>
                  </Link>
                )}
                {isCollapsed && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src="/logomatt.png" alt="Logo" className="h-8 w-auto relative z-10" />
                  </div>
                )}

                <button className="sm:hidden text-gray-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
                  <Menu size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-1 overflow-y-auto sidebar-scrollbar pb-8 relative z-10">
                {showLabels && <div className="text-[8px] uppercase tracking-[0.3em] text-white/20 font-black px-5 mb-4 mt-2">Navegación</div>}
                
                <Link 
                  to="/" 
                  className={`flex items-center justify-between w-full px-5 py-4 rounded-xl bg-gradient-to-r from-sky-500/10 to-transparent border border-sky-500/20 text-sky-400 hover:from-sky-500/20 transition-all duration-500 mb-6 group ${isCollapsed ? "justify-center px-0 border-none bg-transparent" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={16} className="group-hover:rotate-12 transition-transform" />
                    {showLabels && <span className="font-black text-[10px] uppercase tracking-widest">Ver Sitio</span>}
                  </div>
                  {showLabels && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,1)] animate-pulse" />}
                </Link>

                {!isBlockedForTeacher("dashboard") && (
                  <button onClick={() => handleMenuClick("dashboard")} className={menuItemClass("dashboard")}>
                    <LayoutDashboard size={16} />
                    {showLabels && <span className="text-[10px] uppercase tracking-wider">Dashboard</span>}
                  </button>
                )}

                {showLabels && <div className="pt-4 text-[7px] uppercase tracking-[0.3em] text-white/20 font-black px-4 mb-2">Estructura</div>}
                <button onClick={() => handleMenuClick("cursos")} className={menuItemClass("cursos")}>
                  <BookOpen size={16} />
                  {showLabels && <span className="text-[10px] uppercase tracking-wider">Cursos</span>}
                </button>

                {!isBlockedForTeacher("rutas") && (
                  <button onClick={() => handleMenuClick("rutas")} className={menuItemClass("rutas")}>
                    <RouteIcon size={16} />
                    {showLabels && <span className="text-[10px] uppercase tracking-wider">Rutas</span>}
                  </button>
                )}

                {!isBlockedForTeacher("lineas") && (
                  <button onClick={() => handleMenuClick("lineas")} className={menuItemClass("lineas")}>
                    <Layers size={16} />
                    {showLabels && <span className="text-[10px] uppercase tracking-wider">Líneas Académicas</span>}
                  </button>
                )}

                {showLabels && <div className="pt-4 text-[7px] uppercase tracking-[0.3em] text-white/20 font-black px-4 mb-2">Gestión</div>}
                {!isBlockedForTeacher("usuarios") && (
                  <button onClick={() => handleMenuClick("usuarios")} className={menuItemClass("usuarios")}>
                    <Users size={16} />
                    {showLabels && <span className="text-[10px] uppercase tracking-wider">Usuarios</span>}
                  </button>
                )}

                {!isBlockedForTeacher("pagos") && (
                  <button onClick={() => handleMenuClick("pagos")} className={menuItemClass("pagos")}>
                    <CreditCard size={16} />
                    {showLabels && <span className="text-[10px] uppercase tracking-wider">Pagos</span>}
                  </button>
                )}

                {!isBlockedForTeacher("certificados") && (
                  <button onClick={() => handleMenuClick("certificados")} className={menuItemClass("certificados")}>
                    <Award size={16} />
                    {showLabels && <span className="text-[10px] uppercase tracking-wider">Certificados</span>}
                  </button>
                )}

                {showLabels && <div className="pt-4 text-[7px] uppercase tracking-[0.3em] text-white/20 font-black px-4 mb-2">Contenido</div>}
                <button onClick={() => handleMenuClick("modulos")} className={menuItemClass("modulos")}>
                  <Layers size={16} />
                  {showLabels && <span className="text-[10px] uppercase tracking-wider">Módulos</span>}
                </button>
                <button onClick={() => handleMenuClick("lecciones")} className={menuItemClass("lecciones")}>
                  <Video size={16} />
                  {showLabels && <span className="text-[10px] uppercase tracking-wider">Lecciones</span>}
                </button>
                <button onClick={() => handleMenuClick("evaluaciones")} className={menuItemClass("evaluaciones")}>
                  <FileCheck size={16} />
                  {showLabels && <span className="text-[10px] uppercase tracking-wider">Exámenes</span>}
                </button>
                <button onClick={() => handleMenuClick("materiales")} className={menuItemClass("materiales")}>
                  <Search size={16} />
                  {showLabels && <span className="text-[10px] uppercase tracking-wider">Recursos</span>}
                </button>

                {showLabels && <div className="pt-8 text-[8px] uppercase tracking-[0.3em] text-white/20 font-black px-5 mb-4">Ajustes del Sistema</div>}

                <button onClick={() => handleMenuClick("notificaciones")} className={menuItemClass("notificaciones")}>
                  <Bell size={18} />
                  {showLabels && <span className="text-[11px] uppercase tracking-wider">Notificaciones</span>}
                </button>

                <button onClick={() => handleMenuClick("configuracion")} className={menuItemClass("configuracion")}>
                  <Settings size={18} />    
                  {showLabels && <span className="text-[11px] uppercase tracking-wider">Configuración</span>}
                </button>
              </nav>

              <div className={`mt-auto pt-6 border-t border-white/5 relative z-10 bg-[#050a10]/80 backdrop-blur-xl ${isCollapsed ? "px-0 flex flex-col items-center pb-6" : "px-5 pb-6"}`}>
                <div className={`group transition-all duration-500 cursor-pointer ${isCollapsed ? "mb-6" : "bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5 hover:bg-sky-500/10 hover:border-sky-500/20"}`}>
                  <div className="relative">
                    <div className={`${isCollapsed ? "w-12 h-12 rounded-xl" : "w-11 h-11 rounded-xl"} overflow-hidden bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-white font-black shadow-2xl group-hover:border-sky-500 transition-all text-[12px]`}>
                      {(() => {
                        const imgPath = userData?.imagen_perfil || userData?.user?.imagen_perfil || userData?.usuario?.imagen_perfil;
                        const nombre = userData?.nombre || userData?.user?.nombre || userData?.usuario?.nombre || "A";

                        if (imgPath) {
                          const finalUrl = `${apiUrl("/").replace(/\/$/, "")}/${imgPath.replace(/^\/?(api\/)?/, "")}`;
                          return (
                            <img 
                              src={finalUrl} 
                              className="w-full h-full object-cover"
                              alt="Perfil"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes("cdn-icons-png")) {
                                  target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                }
                              }}
                            />
                          );
                        }
                        return nombre.charAt(0).toUpperCase();
                      })()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#050a10] rounded-full shadow-[0_0_10px_rgba(16,185,129,1)] ${isCollapsed ? "w-3.5 h-3.5" : "w-3 h-3"}`} />
                  </div>
                  {showLabels && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] font-black truncate text-white tracking-tight leading-tight">{userData?.nombre?.split(" ")[0] || "Admin"}</span>
                      <span className="text-[9px] text-sky-400 font-black uppercase tracking-[0.2em] mt-0.5">
                        {rol === 1 ? "Administrador" : rol === 2 ? "Coach" : "Staff"}
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className={`font-black text-[9px] uppercase tracking-[0.3em] rounded-xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 flex items-center transition-all duration-300 group ${isCollapsed ? "justify-center w-12 h-12" : "w-full px-5 py-3.5 gap-3"}`}
                >
                  <LogOut size={16} className={isCollapsed ? "" : "group-hover:translate-x-1 transition-transform"} /> 
                  {showLabels && <span>Cerrar Sesión</span>}
                </button>
              </div>
            </motion.aside>
          </>
        );
      })()}

      <motion.div 
        className="flex-1 flex flex-col h-screen overflow-hidden bg-white relative"
      >
        <header className="bg-white/80 backdrop-blur-2xl px-4 md:px-8 py-4 md:py-5 border-b border-gray-100 flex items-center justify-between z-30 sticky top-0">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Sidebar Toggle Button - Premium Style */}
            <button 
              onClick={() => setIsSidebarHidden(!isSidebarHidden)}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white text-sky-500 hover:text-sky-600 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)] border border-slate-200 transition-all duration-300 active:scale-95 group"
              title={isSidebarHidden ? "Mostrar Menú" : "Ocultar Menú"}
            >
              {isSidebarHidden ? (
                <ChevronsRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              ) : (
                <ChevronsLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              )}
            </button>

            <button className="sm:hidden text-slate-900 p-2 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
                {activeSection?.charAt(0).toUpperCase() + activeSection?.slice(1) || "Dashboard"}
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="text-sky-500">MIS Academy</span>
                <span>/</span>
                <span>{activeSection || "Dashboard"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black text-slate-900 tracking-tight">Hola, {userData?.nombre?.split(" ")[0]} 👋</span>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-sky-500 group-hover:bg-sky-50 group-hover:border-sky-100 transition-all duration-300">
                <Bell size={18} />
              </div>
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-sky-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            </div>
          </div>
        </header>

        <main ref={mainContentRef} className="flex-1 overflow-y-auto bg-[#FDFDFD] sidebar-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6"
          >
            {renderContent()}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
