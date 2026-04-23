import { useState } from "react";
import { Eye, EyeOff, Info } from "lucide-react";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const passLen = password.length;
  const passOk = passLen >= 8;
  const canSubmit =
    nombre.trim() !== "" &&
    apellido.trim() !== "" &&
    email.trim() !== "" &&
    passOk &&
    password === passwordConfirmation &&
    !loading;

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
      const payload = {
        id_rol: 2,
        nombre,
        apellido,
        email,
        password,
        password_confirmation: passwordConfirmation,
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.errors) {
          const msg = Object.values<string[]>(data.errors).flat().join(" ");
          throw new Error(msg);
        }
        throw new Error(data?.message || "No se pudo completar el registro.");
      }

      setSuccess(
        "¡Registro exitoso! Revisa tu correo y confirma tu cuenta para iniciar sesión."
      );
      setNombre("");
      setApellido("");
      setEmail("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err: any) {
      setError(err?.message || "Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-[#0b1321] rounded-2xl border border-white/10 p-6 sm:p-10">
            <div className="h-full w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center gap-6">
              <img
                src="/logomatt.png"
                alt="MattInnova Solution"
                className="w-40 md:w-56 lg:w-64"
              />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Aprende hoy,
                <br /> transforma tu mañana
              </h1>
              <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-xl">
                Ofrecemos cursos online prácticos y accesibles, diseñados para
                impulsar tu desarrollo personal y profesional.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="rounded-2xl bg-white/4 border border-white/10 px-6 py-5">
                  <div className="text-3xl md:text-4xl font-bold">+50</div>
                  <div className="opacity-80">Cursos</div>
                </div>
                <div className="rounded-2xl bg-white/4 border border-white/10 px-6 py-5">
                  <div className="text-3xl md:text-4xl font-bold">+1,000</div>
                  <div className="opacity-80">Estudiantes</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-10 text-[#0c1521]">
            <div className="mb-6">
              <div className="text-2xl sm:text-3xl font-extrabold">
                COMENCEMOS
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                Crear una cuenta
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Luis"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Hernandez"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="luishernandez@gmail.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-sky-500"
                      aria-label="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                      aria-label={
                        showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      {showPass ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  <div className="mt-1 w-full max-w-full text-[11px] leading-4 text-amber-600 flex items-center gap-1 whitespace-nowrap overflow-hidden">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Mínimo 8 caracteres ({passLen}/8)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass2 ? "text" : "password"}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Confirma tu contraseña"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-sky-500"
                      aria-label="Confirmar contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass2((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                      aria-label={
                        showPass2
                          ? "Ocultar confirmación"
                          : "Mostrar confirmación"
                      }
                    >
                      {showPass2 ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-lg bg-sky-600 text-white py-3 font-semibold hover:bg-sky-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Registrando" : "Registrarse"}
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400">O</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <p className="text-center text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="text-sky-600 font-semibold hover:underline"
                >
                  INICIAR SESIÓN AQUÍ
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
