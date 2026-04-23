import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdMenuBook,
  MdVideoLibrary,
  MdWidgets,
  MdCardMembership,
  MdPayment,
  MdLogout,
  MdMenu,
  MdExplore,
  MdAssignment,
  MdViewModule,
  MdInsertDriveFile,
  MdSettings,
  MdNotifications,
} from "react-icons/md";
import { apiUrl } from "../config/api";

import ConfirmModal from "./components/ConfirmModal";
import Acordeon from "./components/Acordeon";

import Usuarios from "./usuarios/tabla";
import { Lecciones } from "./lecciones/tabla";
import { Dashboard } from "./dashboard/graficos";
import PagosAdminPage from "./pagos/pagos";
import { RutasAcademicas } from "./rutas/tabla";
import { LineasAcademicas } from "./lineas/tabla";
import { Cursos } from "./cursos/tabla";
import { Evaluaciones } from "./evaluaciones/tabla";
import { Modulos } from "./modulos/tabla";
import { Materiales } from "./materiales/tabla";
import { Certificados } from "./certificados/tabla";
import { Configuracion } from "./configuracion/page";
import { Notificaciones } from "./notificaciones/page";

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rol, setRol] = useState<number | null>(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(apiUrl("/auth/profile"), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((r) => r.json())
      .then((p) => {
        setRol(p.id_rol);

        if (p.id_rol === 1) setActiveSection("dashboard"); 
        else if (p.id_rol === 3) setActiveSection("cursos"); 
        else setActiveSection("cursos");
      })
      .catch(() => {
        setRol(null);
        setActiveSection("cursos");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };


  if (activeSection === null) {
    return <></>; 
  }


  const isBlockedForTeacher = (section: string) => {
    if (rol !== 3) return false;
    return ["dashboard", "usuarios", "pagos","certificados", "notificaciones", "líneas académicas", "rutas"].includes(section);
  };


  const renderContent = () => {
    if (isBlockedForTeacher(activeSection)) {
      return (
        <div className="p-6 text-red-600 text-xl font-semibold">
          ⚠ Esta sección está bloqueada para tu rol.
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "usuarios":
        return <Usuarios />;
      case "cursos":
        return <Cursos />;
      case "rutas":
        return <RutasAcademicas />;
      case "lecciones":
        return <Lecciones />;
      case "líneas académicas":
        return <LineasAcademicas />;
      case "certificados":
        return <Certificados />;
      case "pagos":
        return <PagosAdminPage />;
      case "evaluaciones":
        return <Evaluaciones />;
      case "módulos":
        return <Modulos />;
      case "materiales":
        return <Materiales />;
      case "configuracion":
        return <Configuracion />;
      case "notificaciones":
        return <Notificaciones />;
      default:
        return <Dashboard />;
    }
  };

  const menuItemClass = (section: string) => {
    const isBlocked = isBlockedForTeacher(section);

    return `
      text-left w-full flex items-center gap-2 px-2 py-2 rounded 
      ${activeSection === section ? "bg-gray-700 font-semibold" : ""}
      ${isBlocked ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-700 cursor-pointer"} 
    `;
  };


  const handleMenuClick = (section: string) => {
    if (isBlockedForTeacher(section)) return;
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        message="¿Estás seguro de cerrar sesión?"
      />

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity sm:hidden ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0E1C2B] text-white flex flex-col px-6 pt-4 pb-3
          transform transition-transform sm:static sm:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-center mb-3">
          <Link to="/admin">
            <img src="/logomatt.png" alt="Logo" className="h-16 cursor-pointer" />
          </Link>
        </div>

        <nav className="flex-1 space-y-2 text-[15px]">

          <button onClick={() => handleMenuClick("dashboard")} className={menuItemClass("dashboard")}>
            <MdDashboard size={20} /> Dashboard
          </button>

          <button onClick={() => handleMenuClick("cursos")} className={menuItemClass("cursos")}>
            <MdMenuBook size={20} /> Cursos
          </button>

          <button onClick={() => handleMenuClick("rutas")} className={menuItemClass("rutas")}>
            <MdExplore size={20} /> Rutas
          </button>

          <button onClick={() => handleMenuClick("líneas académicas")} className={menuItemClass("líneas académicas")}>
            <MdWidgets size={20} /> Líneas académicas
          </button>

          <button onClick={() => handleMenuClick("usuarios")} className={menuItemClass("usuarios")}>
            <MdPeople size={20} /> Usuarios
          </button>

          <button onClick={() => handleMenuClick("certificados")} className={menuItemClass("certificados")}>
            <MdCardMembership size={20} /> Certificados
          </button>

          <button onClick={() => handleMenuClick("pagos")} className={menuItemClass("pagos")}>
            <MdPayment size={20} /> Pagos
          </button>

          <Acordeon title="Contenido">
            <button onClick={() => handleMenuClick("lecciones")} className={menuItemClass("lecciones")}>
              <MdVideoLibrary size={20} /> Lecciones
            </button>

            <button onClick={() => handleMenuClick("módulos")} className={menuItemClass("módulos")}>
              <MdViewModule size={20} /> Módulos
            </button>

            <button onClick={() => handleMenuClick("evaluaciones")} className={menuItemClass("evaluaciones")}>
              <MdAssignment size={20} /> Evaluaciones
            </button>

            <button onClick={() => handleMenuClick("materiales")} className={menuItemClass("materiales")}>
              <MdInsertDriveFile size={20} /> Materiales
            </button>
          </Acordeon>

          <button onClick={() => handleMenuClick("notificaciones")} className={menuItemClass("notificaciones")}>
            <MdNotifications size={20} /> Notificaciones
          </button>

          <button onClick={() => handleMenuClick("configuracion")} className={menuItemClass("configuracion")}>
            <MdSettings size={20} /> Configuración
          </button>
        </nav>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full text-left font-medium px-4 py-2 text-[15px] rounded hover:bg-gray-700 flex items-center gap-2 transition-all duration-200"
          >
            <MdLogout size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col max-h-screen">
        <header className="bg-white px-6 py-4 shadow hidden sm:flex">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {activeSection}
          </h1>
        </header>

        <main className="flex-1 bg-gray-50 overflow-y-auto max-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
