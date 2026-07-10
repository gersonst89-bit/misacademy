// src/perfil/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MdEdit, 
  MdCameraAlt, 
  MdEmail, 
  MdVerified, 
  MdCalendarToday, 
  MdLogin,
  MdSecurity,
  MdSave,
  MdArrowBack
} from "react-icons/md";
import InputComponent from "../admin/Components/InputComponent";
import SkillRadarChart from "./components/SkillRadarChart";
import type { Usuario } from "../types/models";
import { API_URL } from "../config/api";
import { apiClient } from "../services/apiClient";

const API_BASE = API_URL;

export default function PerfilPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario>({
    id_usuario: undefined as any,
    nombre: "",
    apellido: "",
    email: "",
    dni: "" as any,
    password: "" as any,
    id_rol: 2,
    estado: "Activo",
    imagen_perfil: null,
    biografia: "",
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState<number>(0);
  const prevObjectUrlRef = useRef<string | null>(null);

  const puedeGuardar = useMemo(
    () =>
      usuario.nombre.trim().length > 0 &&
      usuario.apellido.trim().length > 0 &&
      usuario.email.trim().length > 0,
    [usuario]
  );

  const normalizeUrl = (u?: string | null) => {
    if (!u) return "";
    const s = String(u);
    if (/^https?:\/\//i.test(s) || /^(blob:|data:)/i.test(s)) return s;
    const cleanPath = s.replace(/^\/?(api\/)?/, "");
    return `${API_BASE}/${cleanPath}`;
  };

  const mapUsuario = (data: any): Usuario => ({
    id_usuario: Number(data.id_usuario ?? data.id ?? data.user_id ?? undefined),
    nombre: data.nombre ?? data.first_name ?? "",
    apellido: data.apellido ?? data.last_name ?? "",
    email: data.email ?? "",
    dni: "" as any,
    id_rol: Number(data.id_rol ?? data.rol_id ?? 2),
    estado: data.estado ?? "Activo",
    imagen_perfil: data.imagen_perfil ?? data.avatar ?? null,
    biografia: data.biografia ?? data.bio ?? "",
    email_verificado: data.email_verificado ?? data.email_verified ?? undefined,
    fecha_registro: data.fecha_registro ?? data.created_at ?? undefined,
    ultimo_acceso: data.ultimo_acceso ?? data.last_login ?? undefined,
    password: "" as any,
  });

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const r = await apiClient.get("/auth/profile");
        const data = r.data;
        const user = mapUsuario(data);
        setUsuario(user);
        const src = normalizeUrl(user.imagen_perfil as any);
        setAvatarPreview(src || null);
        setAvatarVersion(Date.now());
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setAvatarFile(file);
    if (prevObjectUrlRef.current) {
      URL.revokeObjectURL(prevObjectUrlRef.current);
      prevObjectUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    prevObjectUrlRef.current = url;
    setAvatarPreview(url);
  };

  const handleGuardar = async () => {
    if (!puedeGuardar) return;
    try {
      setGuardando(true);

      const form = new FormData();
      form.append("nombre", usuario.nombre);
      form.append("apellido", usuario.apellido ?? "");
      form.append("email", usuario.email ?? "");
      if (usuario.biografia) form.append("biografia", usuario.biografia);
      if (avatarFile) form.append("imagen_perfil", avatarFile);

      const resp = await apiClient.put("/perfil", form);
      const data = resp.data;
      const rawUser = data.usuario ?? data.user ?? data.data ?? data;
      if (rawUser) {
        const mapped = mapUsuario(rawUser);
        setUsuario((prev) => ({ ...prev, ...mapped }));
        const serverImg = normalizeUrl(mapped.imagen_perfil as any);
        if (serverImg) {
          setAvatarPreview(serverImg);
          setAvatarVersion(Date.now());
        }
        setAvatarFile(null);
      }
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEnviarCorreoReset = async () => {
    setResetMsg("");
    if (!usuario.email?.trim()) return;
    try {
      setSendingReset(true);
      const r = await apiClient.post("/auth/change-password", { email: usuario.email });
      setResetMsg("¡Enlace enviado! Revisa tu bandeja de entrada.");
    } catch (e) {
      setResetMsg("No se pudo enviar el correo o error de conexión.");
    } finally {
      setSendingReset(false);
    }
  };

  const fmtFecha = (v?: string | null) => {
    if (!v) return "—";
    const safe = String(v).replace(" ", "T");
    const d = new Date(safe);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (cargando) return (
    <div className="min-h-screen bg-[#050b15] flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  const avatarSrc = (() => {
    const src = avatarPreview || "";
    if (!src) return "";
    if (/^(blob:|data:)/i.test(src)) return src;
    return `${src}${src.includes("?") ? "&" : "?"}t=${avatarVersion}`;
  })();

  return (
    <div className="min-h-screen bg-[#050b15] text-slate-200 relative overflow-hidden font-outfit selection:bg-sky-500/30">
      {/* Cinematic Background Elements */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-8 bg-sky-500 rounded-full" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-sky-400">Portal de Talento</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Mi Perfil <span className="text-sky-500">Académico</span></h1>
            <p className="text-slate-400 text-sm max-w-lg font-medium">Gestiona tu identidad digital y mantén tus habilidades actualizadas para el mercado tecnológico.</p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${usuario.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${usuario.estado === 'Activo' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {usuario.estado === "Activo" ? "Cuenta Verificada" : "Cuenta Inactiva"}
            </div>
            <div className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
              {usuario.id_rol === 1 ? "Super Administrador" : usuario.id_rol === 2 ? "Instructor MIS" : "Estudiante VIP"}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-8">
          {/* Left Column: Visual Profile & Skills */}
          <aside className="space-y-8">
            {/* Identity Card */}
            <div className="group relative rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 shadow-2xl overflow-hidden transition-all hover:border-sky-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] -mr-16 -mt-16 group-hover:bg-sky-500/20 transition-all" />
              
              <div className="relative flex flex-col items-center text-center">
                {/* Avatar with Ring */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-fuchsia-500 rounded-full blur-md opacity-40 group-hover:opacity-100 transition-opacity animate-spin-slow" />
                  <div className="relative w-32 h-32 rounded-full border-4 border-[#050b15] overflow-hidden bg-slate-900 flex items-center justify-center">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Perfil" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-4xl font-black text-sky-400">{usuario.nombre?.[0] || 'U'}</span>
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 w-10 h-10 bg-sky-500 hover:bg-sky-400 text-[#050b15] rounded-full flex items-center justify-center cursor-pointer border-4 border-[#050b15] shadow-xl transition-all hover:scale-110">
                    <MdCameraAlt size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                  {usuario.nombre} {usuario.apellido}
                </h2>
                <p className="text-sky-400/70 text-xs font-bold lowercase tracking-widest mb-6">{usuario.email}</p>

                <div className="w-full pt-6 border-t border-white/5 space-y-4 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter">
                    <span className="text-slate-500 flex items-center gap-1.5"><MdVerified className="text-sky-500" /> Verificado</span>
                    <span className={usuario.email_verificado ? 'text-emerald-400' : 'text-amber-400'}>{usuario.email_verificado ? 'SÍ' : 'PENDIENTE'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter">
                    <span className="text-slate-500 flex items-center gap-1.5"><MdCalendarToday className="text-sky-500" /> Miembro desde</span>
                    <span className="text-slate-300">{fmtFecha(usuario.fecha_registro)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter">
                    <span className="text-slate-500 flex items-center gap-1.5"><MdLogin className="text-sky-500" /> Último acceso</span>
                    <span className="text-slate-300">{fmtFecha(usuario.ultimo_acceso)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Chart Card */}
            <div className="rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-center text-sky-400 mb-6">Radar de Skills</h3>
              <div className="relative h-64 flex items-center justify-center">
                <SkillRadarChart 
                  data={[
                    { axis: "Frontend", value: 85 },
                    { axis: "Backend", value: 70 },
                    { axis: "IA", value: 45 },
                    { axis: "Negocios", value: 60 },
                    { axis: "Soft Skills", value: 90 },
                    { axis: "Cloud", value: 75 },
                  ]} 
                />
              </div>
              <p className="text-[10px] text-center text-slate-300 italic mt-4">Actualizado automáticamente por tus logros.</p>
            </div>
          </aside>

          {/* Right Column: Form Sections */}
          <section className="space-y-8">
            {/* Info Card */}
            <div className="rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/20">
                    <MdEdit size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Editar Información</h3>
                    <p className="text-xs text-slate-400 font-medium">Personaliza cómo te ven en la plataforma.</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-sky-500/40 uppercase tracking-widest hidden md:block">Account Settings</div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Nombres</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-sky-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 font-medium"
                      placeholder="Tu nombre"
                      value={usuario.nombre}
                      onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Apellidos</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-sky-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 font-medium"
                      placeholder="Tu apellido"
                      value={usuario.apellido}
                      onChange={(e) => setUsuario({ ...usuario, apellido: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Correo Electrónico</label>
                    <div className="relative">
                      <MdEmail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:border-sky-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 font-medium"
                        type="email"
                        placeholder="tu@correo.com"
                        value={usuario.email}
                        onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-sky-500/[0.03] border border-sky-500/10 rounded-[2rem] p-6 flex flex-col justify-between group hover:bg-sky-500/[0.05] transition-all">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MdSecurity className="text-sky-400" />
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Seguridad</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Actualiza tu contraseña para mantener tu cuenta segura.</p>
                    </div>
                    <button 
                      onClick={handleEnviarCorreoReset}
                      disabled={sendingReset}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-500 hover:text-[#050b15] hover:border-sky-500 transition-all shadow-xl"
                    >
                      {sendingReset ? "Procesando..." : "Cambiar Contraseña"}
                    </button>
                    {resetMsg && <p className="mt-2 text-[10px] text-center font-bold text-sky-400 animate-pulse">{resetMsg}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Resumen Profesional (Biografía)</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-white focus:border-sky-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 font-medium min-h-[150px] resize-none"
                    placeholder="Cuéntanos sobre tu trayectoria y metas académicas..."
                    value={usuario.biografia || ""}
                    onChange={(e) => setUsuario({ ...usuario, biografia: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-500 ml-2 italic">Este resumen aparecerá en tus certificaciones compartibles.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row justify-end gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="px-8 py-4 rounded-2xl bg-white/5 text-slate-400 text-sm font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <MdArrowBack /> Cancelar
                </button>
                <button 
                  onClick={handleGuardar}
                  disabled={!puedeGuardar || guardando}
                  className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white text-sm font-black uppercase tracking-widest shadow-2xl shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {guardando ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : <MdSave size={18} />}
                  Guardar Cambios
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
    </div>
  );
}
