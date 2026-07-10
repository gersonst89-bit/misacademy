import { useEffect, useState, useRef } from "react";
import { FaEdit, FaSearch, FaInfoCircle, FaUserPlus, FaPlus, FaChevronDown, FaTrash, FaUserSlash } from "react-icons/fa";
import InputComponent from "../Components/InputComponent";
import AdminModal from "../Components/AdminModal";
import InfoUsuarioModal from "./InfoUsuarioModal";
import DeleteModal from "../Components/DeleteModal";
import type { Usuario } from "../../types/models";
import { apiUrl } from "../../config/api";
import { apiClient } from "../../services/apiClient";

function FiltroEstado({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const estados = [
    { value: "", label: "Estados", color: "text-sky-600", bg: "bg-sky-50" },
    { value: "Activo", label: "Activo", color: "text-emerald-600", bg: "bg-emerald-50" },
    { value: "Inactivo", label: "Inactivo", color: "text-slate-600", bg: "bg-slate-50" },
  ];

  const current = estados.find(e => e.value === value) || estados[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${value === 'Activo' ? 'bg-emerald-500 animate-pulse' : value === 'Inactivo' ? 'bg-slate-400' : 'bg-sky-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{current.label}</span>
        <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => {
                onChange(e.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${value === e.value 
                  ? `${e.bg} ${e.color} shadow-sm` 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                e.value === 'Activo' ? 'bg-emerald-500' : 
                e.value === 'Inactivo' ? 'bg-slate-400' : 'bg-sky-500'
              }`} />
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FiltroRol({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const roles = [
    { value: "", label: "Roles", color: "text-sky-600", bg: "bg-sky-50" },
    { value: "1", label: "Admin", color: "text-amber-600", bg: "bg-amber-50" },
    { value: "2", label: "Docente", color: "text-purple-600", bg: "bg-purple-50" },
    { value: "3", label: "Estudiante", color: "text-sky-600", bg: "bg-sky-50" },
  ];

  const current = roles.find(r => r.value === value) || roles[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm w-full sm:w-auto"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">{current.label}</span>
        <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => {
                onChange(r.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${value === r.value 
                  ? `${r.bg} ${r.color} shadow-sm` 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAccionModal, setShowAccionModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [usuarioAccion, setUsuarioAccion] = useState<Usuario | null>(null);
  const [tipoAccion, setTipoAccion] = useState<"desactivar" | "eliminar_force" | null>(null);
  const [errorCompras, setErrorCompras] = useState<{has_pagos: boolean, pagos: any[], message: string} | null>(null);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Debounce para la búsqueda (espera 500ms)
  const [searchDebounced, setSearchDebounced] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(search);
      setPagina(1); // Resetear a página 1 al buscar
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsuarios = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const params: any = {
        page: pagina,
        per_page: 15,
      };
      if (searchDebounced) params.search = searchDebounced;
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroRol) params.id_rol = filtroRol;

      const res = await apiClient.get("/admin/usuarios", { params, signal });

      const data = res.data;
      if (data.data) {
        setUsuarios(data.data);
        setTotalPaginas(data.last_page || 1);
      } else {
        setUsuarios([]);
      }
    } catch (error: any) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
        return;
      }
      console.error("Error al obtener usuarios:", error);
      setUsuarios([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUsuarios(controller.signal);
    return () => {
      controller.abort();
    };
  }, [pagina, searchDebounced, filtroEstado, filtroRol]);

  const openModal = (usuario?: Usuario) => {
    if (usuario) {
      setSelectedUsuario(usuario);
    } else {
      setSelectedUsuario({
        nombre: "",
        apellido: "",
        email: "",
        dni: "",
        password: "",
        id_rol: 3, // Estudiante
        estado: "Activo",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedUsuario) return;
    try {
      const cleanData = {
        nombre: selectedUsuario.nombre,
        apellido: selectedUsuario.apellido,
        email: selectedUsuario.email,
        dni: selectedUsuario.dni,
        telefono: (selectedUsuario as any).telefono,
        id_rol: selectedUsuario.id_rol,
        estado: selectedUsuario.estado,
      };

      // Si es creación, incluimos el password
      if (!selectedUsuario.id_usuario && selectedUsuario.password) {
        (cleanData as any).password = selectedUsuario.password;
      }

      if (selectedUsuario.id_usuario) {
        await apiClient.put(`/admin/usuarios/${selectedUsuario.id_usuario}`, cleanData);
      } else {
        await apiClient.post(`/admin/usuarios`, cleanData);
      }

      alert(
        `Usuario ${
          selectedUsuario.id_usuario ? "actualizado" : "creado"
        } con éxito`
      );
      setShowModal(false);
      fetchUsuarios();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || error.message || "Error al guardar usuario");
    }
  };

  const handleAccion = async () => {
    if (!usuarioAccion || !tipoAccion) return;
    try {
      const endpoint = tipoAccion === "desactivar" 
        ? `/admin/usuarios/${usuarioAccion.id_usuario}` 
        : `/admin/usuarios/${usuarioAccion.id_usuario}/force`;

      await apiClient.delete(endpoint);

      alert(`Usuario ${tipoAccion === "desactivar" ? "desactivado" : "eliminado"} con éxito`);
      setShowAccionModal(false);
      setUsuarioAccion(null);
      setErrorCompras(null);
      fetchUsuarios();
    } catch (error: any) {
      console.error(error);
      const err = error.response?.data || {};
      if (err.has_pagos) {
          setShowAccionModal(false);
          setErrorCompras({
              message: err.message,
              has_pagos: err.has_pagos,
              pagos: err.pagos
          });
          return;
      }
      alert(err.message || `Error al ${tipoAccion === "desactivar" ? "desactivar" : "eliminar"} usuario`);
    }
  };

  return (

    <div className="space-y-6 md:space-y-8 animate-fadeIn px-2 md:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
        <div className="relative flex-1 max-w-lg group w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o DNI..."
            className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm text-slate-900 font-medium placeholder:text-slate-400 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FiltroEstado
              value={filtroEstado}
              onChange={setFiltroEstado}
            />

            <FiltroRol
              value={filtroRol}
              onChange={setFiltroRol}
            />
          </div>

          <button 
            onClick={() => openModal()}
            className="w-full sm:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-8 py-3.5 md:py-4 rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-[10px] md:text-[11px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            <FaPlus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Vista Desktop (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Usuario</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Contacto</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Rol</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando perfiles...</span>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                      <FaSearch size={48} className="text-gray-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No se encontraron resultados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id_usuario} className="group hover:bg-slate-50/80 transition-all duration-500">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600 font-black shadow-sm group-hover:scale-105 transition-all duration-500 border border-white shrink-0">
                          {u.imagen_perfil ? (
                            <img 
                              src={apiUrl(u.imagen_perfil.replace(/^\/?(api\/)?/, ""))} 
                              className="w-full h-full object-cover"
                              alt="Perfil"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                (e.target as HTMLImageElement).parentElement!.innerText = u.nombre?.charAt(0) || "U";
                              }}
                            />
                          ) : (
                            <span className="text-sm font-black opacity-70">{u.nombre?.charAt(0) || "U"}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight truncate">{u.nombre} {u.apellido}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">DNI: {u.dni || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[13px] font-bold text-slate-600 tracking-tight">{u.email}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border
                        ${u.id_rol === 1 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
                          u.id_rol === 2 ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : 
                          "bg-sky-500/10 text-sky-600 border-sky-500/20"}
                      `}>
                        {u.id_rol === 1 ? "Admin" : u.id_rol === 2 ? "Docente" : "Estudiante"}
                      </div>
                    </td>
                      <td className="px-8 py-6 text-center">
                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all duration-500
                          ${u.estado?.toLowerCase() === "activo" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-[0_0_15px_rgba(100,116,139,0.1)]"}
                        `}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.estado?.toLowerCase() === "activo" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          {u.estado}
                        </div>
                      </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
                          <button
                            onClick={() => openModal(u)}
                            className="p-2.5 rounded-xl text-amber-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Editar"
                          >
                            <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button
                            onClick={() => {
                              setUsuarioAccion(u);
                              setTipoAccion("desactivar");
                              setShowAccionModal(true);
                            }}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Desactivar"
                          >
                            <FaUserSlash size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setUsuarioAccion(u);
                              setTipoAccion("eliminar_force");
                              setShowAccionModal(true);
                            }}
                            className="p-2.5 rounded-xl text-rose-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Eliminar Definitivamente"
                          >
                            <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUsuario(u);
                              setShowInfoModal(true);
                            }}
                            className="p-2.5 rounded-xl text-sky-500 hover:bg-white hover:shadow-sm transition-all"
                            title="Detalles"
                          >
                            <FaInfoCircle size={16} />
                          </button>
                        </div>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil (Cards Urban SaaS) */}
        <div className="md:hidden divide-y divide-slate-50">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cargando...</span>
            </div>
          ) : usuarios.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-bold italic text-xs">No hay usuarios disponibles</div>
          ) : (
            usuarios.map((u) => (
              <div key={u.id_usuario} className="p-6 space-y-5 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-50 shadow-sm flex items-center justify-center text-slate-600 font-black shrink-0">
                      {u.imagen_perfil ? (
                        <img 
                          src={apiUrl(u.imagen_perfil.replace(/^\/?(api\/)?/, ""))} 
                          className="w-full h-full object-cover"
                          alt="Perfil"
                        />
                      ) : (
                        <span className="text-xl opacity-70">{u.nombre?.charAt(0) || "U"}</span>
                      )}
                   </div>
                   <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-base font-black text-slate-900 tracking-tight leading-tight truncate">{u.nombre} {u.apellido}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border
                          ${u.id_rol === 1 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
                            u.id_rol === 2 ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : 
                            "bg-sky-500/10 text-sky-600 border-sky-500/20"}
                        `}>
                          {u.id_rol === 1 ? "Admin" : u.id_rol === 2 ? "Docente" : "Estudiante"}
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border
                          ${u.estado?.toLowerCase() === "activo" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600 border-slate-500/20"}
                        `}>
                          {u.estado}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-1.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Correo Electrónico</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">DNI: {u.dni || "—"}</span>
                   </div>
                   <span className="text-xs font-bold text-slate-600 break-all">{u.email}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                  <button onClick={() => openModal(u)} className="p-3 bg-white text-amber-500 rounded-xl shadow-sm flex items-center justify-center hover:scale-95 transition-transform"><FaEdit size={18} /></button>
                  <button onClick={() => { setUsuarioAccion(u); setTipoAccion("desactivar"); setShowAccionModal(true); }} className="p-3 bg-white text-slate-500 rounded-xl shadow-sm flex items-center justify-center hover:scale-95 transition-transform" title="Desactivar"><FaUserSlash size={18} /></button>
                  <button onClick={() => { setUsuarioAccion(u); setTipoAccion("eliminar_force"); setShowAccionModal(true); }} className="p-3 bg-white text-rose-500 rounded-xl shadow-sm flex items-center justify-center hover:scale-95 transition-transform" title="Eliminar Definitivamente">
                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                  <button onClick={() => { setSelectedUsuario(u); setShowInfoModal(true); }} className="p-3 bg-white text-sky-500 rounded-xl shadow-sm flex items-center justify-center hover:scale-95 transition-transform"><FaInfoCircle size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación Profesional Urban SaaS */}
        <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
             <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Página <span className="text-sky-600">{pagina}</span> de {totalPaginas}
                </span>
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultados filtrados: {usuarios.length}</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || loading}
              className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas || loading}
              className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 shadow-lg disabled:opacity-30 transition-all active:scale-95"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>


      {/* Modal para información del usuario */}
      {showInfoModal && selectedUsuario && (
        <InfoUsuarioModal
          usuario={selectedUsuario}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* Modal para crear/editar usuario */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedUsuario?.id_usuario ? "Editar Perfil" : "Nueva Identidad"}
        footer={
          <>
            <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
              {selectedUsuario?.id_usuario ? "Actualización de Datos" : "Registro de Usuario"}
            </div>
            <button
              onClick={handleSave}
              className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5"
            >
              {selectedUsuario?.id_usuario ? "Guardar Cambios" : "Confirmar Registro"}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-xs"
            >
              Cancelar
            </button>
          </>
        }
      >
        {selectedUsuario && (
          <div className="space-y-6 md:space-y-8">
            {/* Module 1: Personal Data */}
            <div className="bg-slate-50/40 p-6 md:p-8 rounded-[2rem] border border-slate-100/50 space-y-6 mx-1 md:mx-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-sky-600/70">Módulo 01</h3>
                  <span className="text-base font-black text-slate-900 tracking-tight leading-none">Datos Personales</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <InputComponent
                  label="Nombre"
                  placeholder="Ej. Juan"
                  value={selectedUsuario.nombre}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      nombre: e.target.value,
                    })
                  }
                />
                <InputComponent
                  label="Apellido"
                  placeholder="Ej. Pérez"
                  value={selectedUsuario.apellido}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      apellido: e.target.value,
                    })
                  }
                />
                <InputComponent
                  label="DNI"
                  placeholder="Ej. 70654321"
                  value={selectedUsuario.dni || ""}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      dni: e.target.value,
                    })
                  }
                />
                <InputComponent
                  label="Teléfono"
                  placeholder="Ej. +51 987654321"
                  value={(selectedUsuario as any).telefono || ""}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      telefono: e.target.value,
                    } as any)
                  }
                />
              </div>
            </div>

            {/* Module 2: Account Access */}
            <div className="bg-slate-50/40 p-6 md:p-8 rounded-[2rem] border border-slate-100/50 space-y-6 mx-1 md:mx-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600/70">Módulo 02</h3>
                  <span className="text-base font-black text-slate-900 tracking-tight leading-none">Acceso y Seguridad</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <InputComponent
                  type="email"
                  label="Email"
                  placeholder="correo@ejemplo.com"
                  value={selectedUsuario.email}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      email: e.target.value,
                    })
                  }
                />
               
                {!selectedUsuario.id_usuario && (
                  <InputComponent
                    type="password"
                    label="Password"
                    placeholder="Mínimo 6 caracteres"
                    value={selectedUsuario.password || ""}
                    onChange={(e) =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        password: e.target.value,
                      })
                    }
                  />
                )}

                <div className="flex flex-col gap-2 w-full group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Rol Académico
                  </label>
                  <select
                    value={selectedUsuario.id_rol}
                    onChange={(e) =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        id_rol: Number(e.target.value),
                      })
                    }
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-900 font-bold text-sm"
                  >
                    <option value={1}>Administrador</option>
                    <option value={3}>Estudiante</option>
                    <option value={2}>Docente</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 w-full group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Estado de Perfil
                  </label>
                  <select
                    value={selectedUsuario.estado}
                    onChange={(e) =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        estado: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-900 font-bold text-sm"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <DeleteModal
        isOpen={showAccionModal}
        onClose={() => {
          setShowAccionModal(false);
          setUsuarioAccion(null);
        }}
        onConfirm={handleAccion}
        itemName={tipoAccion === "desactivar" 
            ? `(DESACTIVAR) ${usuarioAccion?.nombre || ""} ${usuarioAccion?.apellido || ""}` 
            : `(ELIMINAR DEFINITIVAMENTE) ${usuarioAccion?.nombre || ""} ${usuarioAccion?.apellido || ""}`}
      />

      {/* Modal para Mostrar Error de Compras */}
      {errorCompras && (
        <AdminModal
          isOpen={true}
          onClose={() => setErrorCompras(null)}
          title="Acción Denegada"
          footer={
              <button onClick={() => setErrorCompras(null)} className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5">Entendido</button>
          }
        >
          <div className="space-y-6 md:space-y-8">
            <div className="bg-slate-50/40 p-6 md:p-8 rounded-[2rem] border border-rose-100/50 space-y-6 mx-1 md:mx-0">
               <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl mb-4 text-sm font-bold border border-rose-100 flex gap-3 items-center">
                 <FaInfoCircle size={24} className="shrink-0" />
                 {errorCompras.message}
               </div>
               {errorCompras.pagos && errorCompras.pagos.length > 0 && (
                   <div className="space-y-3 mt-4">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">Historial de Compras</h4>
                     {errorCompras.pagos.map((pago: any) => (
                        <div key={pago.id_pago} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3">
                           <div>
                             <p className="text-sm font-black text-slate-700">Monto Total: S/ {pago.monto_total}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fecha: {new Date(pago.fecha_pago).toLocaleDateString()}</p>
                           </div>
                           <div className="px-4 py-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl text-[10px] font-black uppercase w-fit">
                             Estado: {pago.estado}
                           </div>
                        </div>
                     ))}
                     <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                       <p className="text-xs text-amber-700 font-bold leading-relaxed">
                         Recomendación: Si deseas ocultar a este usuario del sistema, por favor utiliza la opción <span className="font-black bg-amber-200/50 px-2 py-0.5 rounded">"Desactivar"</span> en lugar de "Eliminar Definitivamente".
                       </p>
                     </div>
                   </div>
               )}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
