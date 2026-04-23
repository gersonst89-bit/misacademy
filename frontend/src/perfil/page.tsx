// src/perfil/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputComponent from "../admin/components/InputComponent";
import type { Usuario } from "../types/models";
import { API_URL } from "../config/api";

const API_BASE = API_URL;
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export default function PerfilPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario>({
    id_usuario: undefined as any,
    nombre: "",
    apellido: "",
    email: "",
    // DNI ya no se usa
    dni: "" as any,
    // La contraseña ya no se actualiza aquí
    password: "" as any,
    id_rol: 2,
    estado: "Activo",
    imagen_perfil: null,
    biografia: "",
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // envío de correo para cambio de contraseña
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState<string>("");

  // archivo/vista previa + control de URLs blob
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState<number>(0); // solo para http(s)
  const prevObjectUrlRef = useRef<string | null>(null);

  // Validación: solo nombre, apellido, email
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
    if (/^https?:\/\//i.test(s)) return s;
    return `${API_ORIGIN}${s.startsWith("/") ? "" : "/"}${s}`;
  };

  const mapUsuario = (data: any): Usuario => ({
    id_usuario: Number(data.id_usuario ?? data.id ?? data.user_id ?? undefined),
    nombre: data.nombre ?? data.first_name ?? "",
    apellido: data.apellido ?? data.last_name ?? "",
    email: data.email ?? "",
    // campos que ya no usamos se dejan vacíos para compatibilidad
    dni: "" as any,
    id_rol: Number(data.id_rol ?? data.rol_id ?? 2),
    estado: data.estado ?? "Activo",
    imagen_perfil: data.imagen_perfil ?? data.avatar ?? null,
    biografia: data.biografia ?? data.bio ?? "",
    email_verificado: data.email_verificado ?? data.email_verified ?? undefined,
    fecha_registro: data.fecha_registro ?? data.created_at ?? undefined,
    ultimo_acceso: data.ultimo_acceso ?? data.last_login ?? undefined,
    // no exponemos password
    password: "" as any,
  });

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setCargando(false);
        return;
      }
      try {
        const r = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (r.ok) {
          const data = await r.json();
          const user = mapUsuario(data);
          setUsuario(user);
          const src = normalizeUrl(user.imagen_perfil as any);
          setAvatarPreview(src || null);
          setAvatarVersion(Date.now()); // solo afecta a http(s)
        }
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
      const token = localStorage.getItem("token");
      if (!token) {
        setGuardando(false);
        return;
      }

      const form = new FormData();
      form.append("_method", "PUT"); // por compatibilidad
      form.append("nombre", usuario.nombre);
      form.append("apellido", usuario.apellido ?? "");
      form.append("email", usuario.email ?? "");
      // DNI y password ya NO se envían
      if (usuario.biografia) form.append("biografia", usuario.biografia);
      if (avatarFile) form.append("imagen_perfil", avatarFile);

      const resp = await fetch(`${API_BASE}/usuario/perfil`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: form,
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        console.error("Error al actualizar perfil:", resp.status, txt);
        alert("No se pudo actualizar el perfil.");
        return;
      }

      const data = await resp.json().catch(() => ({} as any));
      const rawUser = data.usuario ?? data.user ?? data.data ?? data ?? undefined;
      if (rawUser) {
        const mapped = mapUsuario(rawUser);
        setUsuario((prev) => ({ ...prev, ...mapped }));

        const serverImg = normalizeUrl(mapped.imagen_perfil as any);
        if (serverImg) {
          setAvatarPreview(serverImg);
          setAvatarVersion(Date.now());
        } else if (prevObjectUrlRef.current) {
          setAvatarPreview(prevObjectUrlRef.current);
        }
        setAvatarFile(null);
      }
    } catch (err) {
      console.error("Error guardando perfil:", err);
      alert("Ocurrió un error guardando tu perfil.");
    } finally {
      setGuardando(false);
    }
  };

  // Enviar correo de cambio de contraseña (usa /auth/change-password)
  const handleEnviarCorreoReset = async () => {
    setResetMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      setResetMsg("Debes iniciar sesión nuevamente para cambiar tu contraseña.");
      return;
    }

    if (!usuario.email?.trim()) {
      setResetMsg("Debes tener un correo válido en tu perfil.");
      return;
    }

    try {
      setSendingReset(true);
      const r = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        // por si el backend lo usa; si no, lo ignora
        body: JSON.stringify({ email: usuario.email }),
      });

      if (!r.ok) {
        let msg = "No se pudo enviar el correo para cambiar la contraseña.";
        try {
          const js = await r.json();
          msg = js.message || js.error || msg;
        } catch {}
        setResetMsg(msg);
        return;
      }

      setResetMsg(
        "Te enviamos un enlace para cambiar tu contraseña. Revisa tu bandeja de entrada o spam."
      );
    } catch (e) {
      console.error(e);
      setResetMsg("Error de red al solicitar el cambio de contraseña.");
    } finally {
      setSendingReset(false);
    }
  };

  const fmtFecha = (v?: string | null) => {
    if (!v) return "—";
    const safe = String(v).replace(" ", "T");
    const d = new Date(safe);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-PE");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#050b15] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin" />
            <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150" />
          </div>
          <p className="text-slate-200 font-medium">Cargando tu perfil…</p>
        </div>
      </div>
    );
  }

  // Construir src final para avatar
  const avatarSrc = (() => {
    const src = avatarPreview || "";
    if (!src) return "";
    if (/^(blob:|data:)/i.test(src)) return src;
    return `${src}${src.includes("?") ? "&" : "?"}t=${avatarVersion}`;
  })();

  return (
    <div className="min-h-screen bg-[#050b15] perfil-page">
      <style>{`
        .perfil-page label { color: #e5e7eb !important; }
        .perfil-page input, .perfil-page textarea, .perfil-page select {
          background-color: rgba(15,23,42,0.9) !important;
          border-color: rgba(51,65,85,0.9) !important;
          color: #e5e7eb !important;
        }
        .perfil-page input::placeholder, .perfil-page textarea::placeholder {
          color: #9ca3af !important;
          opacity: 1;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-sky-900/20 via-transparent to-fuchsia-700/10 blur-3xl" />

      <main className="relative mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400/80 mb-1">
              Panel de usuario
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Mi Perfil
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Personaliza tu perfil y mantén tu cuenta al día. Para cambiar tu contraseña, te
              enviaremos un correo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/50 bg-sky-500/10 px-4 py-1 text-xs font-semibold text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {usuario.estado === "Activo" ? "Cuenta activa" : usuario.estado}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-600/70 bg-slate-900/70 px-4 py-1 text-xs font-semibold text-slate-200">
              {usuario.id_rol === 1
                ? "Administrador"
                : usuario.id_rol === 3
                ? "Docente"
                : "Estudiante"}
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <aside className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-sky-700/40 bg-gradient-to-b from-sky-900/40 via-slate-950 to-slate-950 shadow-xl shadow-sky-900/40">
              <div className="absolute inset-x-0 -top-20 h-32 bg-sky-500/20 blur-3xl" />
              <div className="relative px-6 pt-6 pb-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full bg-slate-900 border-2 border-sky-500/80 shadow-lg shadow-sky-900/60 overflow-hidden flex items-center justify-center">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-semibold text-sky-100">
                          {usuario.nombre?.[0]?.toUpperCase() ?? "U"}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 shadow-md shadow-emerald-800">
                      <span className="block h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {usuario.nombre || usuario.apellido
                        ? `${usuario.nombre} ${usuario.apellido}`
                        : "Usuario sin nombre"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {usuario.email || "Sin correo registrado"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <label className="block text-sm font-semibold text-slate-100">
                    Foto de perfil
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-slate-200
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-sky-500/80 file:text-slate-900
                      hover:file:bg-sky-400/90 cursor-pointer"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Selecciona un archivo JPG o PNG. Si no eliges ninguna imagen, se mantendrá la
                    actual.
                  </p>
                  {avatarFile && (
                    <p className="text-[11px] text-emerald-400">
                      Imagen lista para subir: {avatarFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-700/70 bg-slate-950/80 px-6 py-4">
                <dl className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Email verificado</dt>
                    <dd className="font-medium">{usuario.email_verificado ? "Sí" : "No"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Fecha de registro</dt>
                    <dd className="font-medium">{fmtFecha(usuario.fecha_registro)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Último acceso</dt>
                    <dd className="font-medium">{fmtFecha(usuario.ultimo_acceso)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            {/* Datos personales */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/80 backdrop-blur-xl shadow-xl shadow-black/40">
              <div className="border-b border-slate-700/70 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Información personal</h2>
                  <p className="text-xs text-slate-400">Edita tus datos básicos.</p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Fila 1: Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputComponent
                    label="Nombre"
                    placeholder="Nombre"
                    value={usuario.nombre}
                    onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
                  />
                  <InputComponent
                    label="Apellido"
                    placeholder="Apellido"
                    value={usuario.apellido}
                    onChange={(e) => setUsuario({ ...usuario, apellido: e.target.value })}
                  />
                </div>

                {/* Fila 2: Email + tarjeta cambio de contraseña */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  <InputComponent
                    type="email"
                    label="Email"
                    placeholder="correo@dominio.com"
                    value={usuario.email}
                    onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
                  />

                  {/* Cambio de contraseña por correo */}
                  <div className="rounded-lg border border-sky-800/50 bg-sky-900/10 p-4 flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-slate-100">
                        Cambiar contraseña por correo
                      </p>
                      <p className="text-xs text-slate-400">
                        Te enviaremos un enlace de cambio a{" "}
                        <span className="font-medium text-sky-300">
                          {usuario.email || "tu correo"}
                        </span>
                        .
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button
                        onClick={handleEnviarCorreoReset}
                        disabled={sendingReset || !usuario.email}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                          !sendingReset
                            ? "bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-900/50"
                            : "bg-sky-500/40 text-slate-200 cursor-not-allowed"
                        }`}
                      >
                        {sendingReset ? "Enviando…" : "Enviar correo"}
                      </button>
                      <button
                        onClick={() => navigate(0)}
                        className="border border-slate-600/80 px-4 py-2 rounded-md text-sm text-slate-100 hover:bg-slate-800/80 transition-colors"
                      >
                        Volver
                      </button>
                    </div>

                    {!!resetMsg && (
                      <p
                        aria-live="polite"
                        className={`mt-2 text-[11px] font-medium ${
                          resetMsg.toLowerCase().includes("enlace")
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {resetMsg}
                      </p>
                    )}
                  </div>
                </div>

                {/* Biografía */}
                <div>
                  <label className="block text-sm pb-1 font-semibold">Biografía</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                    placeholder="Cuéntanos un poco sobre ti, tus intereses o tu experiencia…"
                    rows={4}
                    value={usuario.biografia ?? ""}
                    onChange={(e) =>
                      setUsuario({
                        ...usuario,
                        biografia: e.target.value,
                      })
                    }
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Esta información podría mostrarse en tus cursos, rutas y certificados.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-700/70 px-6 py-4 flex justify-end gap-3 bg-slate-950/90 rounded-b-2xl">
                <button
                  onClick={() => navigate(-1)}
                  className="border border-slate-600/80 px-5 py-2 rounded-md text-sm text-slate-100 hover:bg-slate-800/80 transition-colors"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={!puedeGuardar || guardando}
                  className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                    puedeGuardar && !guardando
                      ? "bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-900/50"
                      : "bg-sky-500/40 text-slate-200 cursor-not-allowed"
                  }`}
                >
                  {guardando ? "Guardando cambios…" : "Guardar cambios"}
                </button>
              </div>
            </div>

            {/* Información de la cuenta */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/40">
              <div className="border-b border-slate-700/70 px-6 py-4">
                <h2 className="text-base font-semibold text-white">Información de la cuenta</h2>
                <p className="text-xs text-slate-400">
                  Resumen técnico de tu cuenta dentro de la plataforma.
                </p>
              </div>

              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Rol</p>
                  <p className="font-medium text-slate-100">
                    {usuario.id_rol === 1
                      ? "Administrador"
                      : usuario.id_rol === 3
                      ? "Docente"
                      : "Estudiante"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Estado</p>
                  <p className="font-medium text-slate-100">{usuario.estado}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Email verificado</p>
                  <p className="font-medium text-slate-100">
                    {usuario.email_verificado ? "Sí" : "No"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wide">
                    Fecha de registro
                  </p>
                  <p className="font-medium text-slate-100">{fmtFecha(usuario.fecha_registro)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Último acceso</p>
                  <p className="font-medium text-slate-100">{fmtFecha(usuario.ultimo_acceso)}</p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
