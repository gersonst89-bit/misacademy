import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Sparkles, User, LogOut } from "lucide-react";

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  goPerfil: () => void;
  handleLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  isOpen,
  onClose,
  user,
  goPerfil,
  handleLogout,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay sutil para el dropdown de perfil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[90]"
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-5 w-72 bg-[#050a12]/90 backdrop-blur-2xl p-4 rounded-[2rem] z-[100] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden"
          >
            {/* Reflection effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex items-center gap-4 px-4 py-4 mb-2 bg-white/5 rounded-[1.5rem] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate leading-none mb-1">
                  {user?.nombre}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="grid gap-1 mt-4">
              {(user?.id_rol === 1 || user?.id_rol === 2) && (
                <Link
                  to="/admin"
                  className="group/item flex items-center gap-3 px-4 py-3 hover:bg-sky-500/10 text-sky-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  onClick={onClose}
                >
                  <LayoutDashboard className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                  <span className="tracking-wide">Panel de Control</span>
                </Link>
              )}

              {!(user?.id_rol === 1 || user?.id_rol === 2) && (
                <Link
                  to="/compras"
                  className="group/item flex items-center gap-3 px-4 py-3 hover:bg-sky-500/10 text-slate-300 hover:text-sky-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  onClick={onClose}
                >
                  <Sparkles className="w-4 h-4 group-hover/item:scale-110 transition-transform text-slate-500 group-hover/item:text-sky-400" />
                  <span className="tracking-wide">Mis Cursos</span>
                </Link>
              )}

              <button
                onClick={() => {
                  onClose();
                  goPerfil();
                }}
                className="group/item flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-left w-full"
              >
                <User className="w-4 h-4 group-hover/item:scale-110 transition-transform text-slate-500 group-hover/item:text-sky-400" />
                <span className="tracking-wide">Mi Perfil</span>
              </button>

              <div className="h-px bg-white/5 my-2 mx-4" />

              <button
                onClick={handleLogout}
                className="group/item flex items-center gap-3 px-4 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-black text-xs rounded-xl transition-all cursor-pointer text-left w-full"
              >
                <LogOut className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                <span className="tracking-widest uppercase text-[10px]">
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
