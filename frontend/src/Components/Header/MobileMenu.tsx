import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isUserLoggedIn: boolean;
  user: any;
  goPerfil: () => void;
  handleLogout: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isUserLoggedIn,
  user,
  goPerfil,
  handleLogout,
}) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex overflow-hidden"
        >
          {/* Overlay oscuro de fondo */}
          <div
            className="flex-1 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Panel Lateral Premium de Cristal Tintado */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-[320px] bg-[#03070c]/95 backdrop-blur-2xl text-white h-full p-8 shadow-2xl border-l border-white/5 relative overflow-hidden"
          >
            {/* Glow orb de fondo */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none -z-0" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none -z-0" />

            <div className="relative z-10 flex justify-between items-center mb-16">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-sky-500/10 border border-sky-500/30 rounded-lg flex items-center justify-center">
                  <Sparkles size={14} className="text-sky-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.3em] uppercase text-white">
                  MENÚ
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 border border-white/5 transition"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <nav className="relative z-10 flex flex-col gap-6 text-base font-black uppercase tracking-widest">
              {["Inicio", "Cursos", "Líneas", "Consulta"].map((item) => {
                const isActive =
                  location.pathname ===
                  (item === "Inicio"
                    ? "/"
                    : item === "Líneas"
                    ? "/lineas-academicas"
                    : `/${item
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")}`);

                return (
                  <Link
                    key={item}
                    to={
                      item === "Líneas"
                        ? "/lineas-academicas"
                        : `/${
                            item
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "") === "inicio"
                              ? ""
                              : item
                                  .toLowerCase()
                                  .normalize("NFD")
                                  .replace(/[\u0300-\u036f]/g, "")
                          }`
                    }
                    onClick={onClose}
                    className={`transition-all flex items-center justify-between group py-1.5 ${
                      isActive ? "text-sky-400" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
                      )}
                      <span className={isActive ? "text-white" : ""}>{item}</span>
                    </div>
                    <div className="w-0 group-hover:w-8 h-px bg-sky-500 transition-all duration-500" />
                  </Link>
                );
              })}

              <div className="pt-12 mt-8 border-t border-white/5 flex flex-col gap-4">
                {!isUserLoggedIn ? (
                  <>
                    <Link
                      to="/registro"
                      className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-black uppercase tracking-widest text-center shadow-lg shadow-sky-500/10 active:scale-95"
                      onClick={onClose}
                    >
                      Registrarse
                    </Link>
                    <Link
                      to="/login"
                      className="w-full py-4.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest text-center active:scale-95"
                      onClick={onClose}
                    >
                      Iniciar Sesión
                    </Link>
                  </>
                ) : (
                  <>
                    {(user?.id_rol === 1 || user?.id_rol === 2) && (
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className="text-sky-400 text-xs font-black tracking-widest uppercase py-2"
                      >
                        ADMIN PANEL
                      </Link>
                    )}
                    <Link
                      to="/compras"
                      onClick={onClose}
                      className="text-xs font-black tracking-widest uppercase text-gray-400 hover:text-white py-2"
                    >
                      MIS CURSOS
                    </Link>
                    <Link
                      to="/carrito"
                      onClick={onClose}
                      className="text-xs font-black tracking-widest uppercase text-gray-400 hover:text-white py-2"
                    >
                      MI CARRITO
                    </Link>
                    <button
                      onClick={() => {
                        onClose();
                        goPerfil();
                      }}
                      className="text-left text-xs font-black tracking-widest uppercase text-gray-400 hover:text-white py-2"
                    >
                      PERFIL
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      className="text-left text-xs font-black tracking-widest uppercase text-rose-500 py-2 border-t border-white/5 mt-4"
                    >
                      SALIR
                    </button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
