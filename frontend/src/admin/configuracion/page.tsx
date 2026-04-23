import { useEffect, useState } from "react";
import { API_URL } from "../../config/api";

export const Configuracion = () => {
  const [perfil, setPerfil] = useState<any>(null);

  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    biografia: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const token = localStorage.getItem("token");

  const cargarPerfil = async () => {
    try {
      const res = await fetch(`${API_URL}/usuario/perfil`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok && data.usuario) {
        setPerfil(data.usuario);
        setPreview(data.usuario.imagen_perfil || null);

        setForm({
          nombre: data.usuario.nombre || "",
          apellido: data.usuario.apellido || "",
          telefono: data.usuario.telefono || "",
          biografia: data.usuario.biografia || "",
          email: data.usuario.email || "",
        });
      }
    } catch {
      setError("Error al cargar el perfil.");
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const actualizarPerfil = async () => {
    setLoading(true);
    setMensaje(null);
    setError(null);

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") formData.append(key, value as any);
    });

    if (imagen) formData.append("imagen_perfil", imagen);

    try {
      const res = await fetch(`${API_URL}/usuario/perfil`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Perfil actualizado correctamente.");
        cargarPerfil();
      } else {
        setError(data.message || "No se pudo actualizar el perfil.");
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const enviarCorreoReset = async () => {
    setResetMsg("");
    setSendingReset(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResetMsg(data.message || "No se pudo enviar el correo.");
        return;
      }

      setResetMsg("Se envió un correo para cambiar tu contraseña.");
    } catch {
      setResetMsg("Error de red al enviar el correo.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Configuración del Perfil
        </h1>

        <div className="flex justify-center mb-6">
          <img
            src={
              preview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-sky-600"
          />
        </div>

        <div className="flex justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImagen}
            className="text-sm file:bg-sky-600 file:text-white file:px-4 
                       file:py-2 file:rounded-lg cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {["nombre", "apellido", "email", "telefono"].map((campo) => (
            <input
              key={campo}
              type="text"
              value={(form as any)[campo]}
              onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
              placeholder={campo.toUpperCase()}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          ))}

          <textarea
            placeholder="BIOGRAFÍA"
            value={form.biografia}
            onChange={(e) => setForm({ ...form, biografia: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg h-28 md:col-span-2"
          />
        </div>

        <button
          onClick={actualizarPerfil}
          disabled={loading}
          className="w-full bg-sky-600 text-white py-2 rounded-lg 
                     hover:bg-sky-700 disabled:opacity-50 mt-6"
        >
          {loading ? "Guardando..." : "Actualizar datos"}
        </button>

        {mensaje && (
          <p className="text-green-600 mt-4 text-center">{mensaje}</p>
        )}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <h2 className="text-xl font-semibold mt-10 mb-4 text-gray-800">
          Restablecer contraseña
        </h2>

        <button
          onClick={enviarCorreoReset}
          className="w-full bg-sky-600 text-white py-2 rounded-lg mt-2 hover:bg-sky-700"
        >
          {sendingReset ? "Enviando..." : "Enviar correo"}
        </button>

        {resetMsg && (
          <p className="text-center mt-4 text-sm text-gray-700">{resetMsg}</p>
        )}
      </div>
    </div>
  );
};
