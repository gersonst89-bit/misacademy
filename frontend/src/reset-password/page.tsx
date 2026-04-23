import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { API_URL } from "../config/api";

const API_BASE = API_URL;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Enlace inválido o incompleto.");
    }
  }, [token, email]);

  const passLen = password.length;
  const passOk = passLen >= 8;
  const canSubmit = passOk && password === passwordConfirmation && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passOk) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo restablecer la contraseña.");
      }

      setSuccess("¡Contraseña restablecida exitosamente! Redirigiendo a login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.message || "Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden grid place-items-center pb-4">
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(60%_60%_at_50%_0%,#0ea5e9_0%,transparent_60%),radial-gradient(50%_50%_at_100%_100%,#1e293b_0%,transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl bg-[#0b1220]/80 backdrop-blur shadow-2xl ring-1 ring-white/10 p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-sky-600/20">
              <Lock size={24} className="text-sky-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Restablecer contraseña
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 mb-2">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Mínimo 8 caracteres {passLen > 0 && `(${passLen})`}
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showPass2 ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass2((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
                >
                  {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-600/20 border border-green-500/30 text-green-300 px-4 py-3 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-lg font-semibold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-950 transition"
            >
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-sky-400 text-sm hover:underline"
            >
              Volver a login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
