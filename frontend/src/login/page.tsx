import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { API_URL } from "../config/api";

const API_BASE = API_URL;

type FetchJson = { ok: boolean; data: any };

async function postJson(url: string, body: any): Promise<FetchJson> {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await r.json()
      : await r.text();
    return { ok: r.ok, data };
  } catch (e) {
    return { ok: false, data: { error: "Error de red" } };
  }
}

/* ========================
   Modal: Recuperar contraseña (solo email)
======================== */
function ForgotEmailModal({
  isOpen,
  defaultEmail,
  onClose,
}: {
  isOpen: boolean;
  defaultEmail?: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [sending, setSending] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || "");
      setSending(false);
      setDoneMsg(null);
      setErrMsg(null);
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleSend = async () => {
    setErrMsg(null);
    setDoneMsg(null);
    if (!email.trim()) {
      setErrMsg("Ingresa tu correo.");
      return;
    }
    setSending(true);
    const res = await postJson(`${API_BASE}/auth/forgot-password`, {
      email: email.trim(),
    });
    setSending(false);

    if (!res.ok) {
      const msg =
        res.data?.message ||
        res.data?.error ||
        "No se pudo enviar el correo de recuperación.";
      setErrMsg(msg);
      return;
    }
    // Éxito: mostramos confirmación para que revise su correo
    setDoneMsg(
      "Te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada o spam."
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-[#0b1220] text-white shadow-2xl ring-1 ring-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-sky-600/20">
            <Mail size={20} className="text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold">Recuperar contraseña</h3>
        </div>

        <p className="text-sm text-white/80 mb-4">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu
          contraseña.
        </p>

        <label className="block text-sm text-white/80 mb-2">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@dominio.com"
          className="w-full mb-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
          disabled={sending}
        />

        {errMsg && <div className="text-red-400 text-sm mb-3">{errMsg}</div>}
        {doneMsg && (
          <div className="text-emerald-400 text-sm mb-3">{doneMsg}</div>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            disabled={sending}
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 font-semibold"
          >
            {sending ? "Enviando…" : "Enviar correo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================
   Página de Login
======================== */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setCheckingAuth(false);

    fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Token inválido");
        return r.json();
      })
      .then((p) => {
        const idRol = p.id_rol;
        if (idRol === 1) navigate("/admin", { replace: true });
        else if (idRol === 2) navigate("/cursos", { replace: true });
        else if (idRol === 3) navigate("/admin", { replace: true });
        else setCheckingAuth(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setCheckingAuth(false);
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Error al iniciar sesión");
        return;
      }
      localStorage.setItem("token", data.token);

      const p = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
          Accept: "application/json",
        },
      }).then((r) => r.json());

      const idRol = p.id_rol;
      if (idRol === 1) navigate("/admin", { replace: true });
      else if (idRol === 2) navigate("/cursos", { replace: true });
      else if (idRol === 3) navigate("/admin", { replace: true });
      else setError("Rol no reconocido");
    } catch (err) {
      console.error(err);
      setError("Error de red o del servidor");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <div className="relative w-12 h-12">
          <div className="absolute w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
          <div className="absolute w-8 h-8 top-2 left-2 rounded-full border-4 border-sky-700 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-950 relative overflow-hidden grid place-items-center pb-4">
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(60%_60%_at_50%_0%,#0ea5e9_0%,transparent_60%),radial-gradient(50%_50%_at_100%_100%,#1e293b_0%,transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-[#0b1220]/80 backdrop-blur shadow-2xl ring-1 ring-white/10 p-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6">
              Iniciar sesión
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@dominio.com"
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sky-400 text-sm hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold bg-sky-600 hover:bg-sky-700 focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-950 transition"
              >
                {loading ? "Cargando…" : "Iniciar sesión"}
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
            </form>

            <p className="mt-6 text-center text-white/70">
              ¿No tienes una cuenta?{" "}
              <a
                href="/registro"
                className="text-sky-400 font-semibold hover:underline"
              >
                Regístrate gratis
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de recuperación por correo */}
      <ForgotEmailModal
        isOpen={forgotOpen}
        defaultEmail={email}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}
