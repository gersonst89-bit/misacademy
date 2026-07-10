import { useEffect, useState } from "react";
import { API_URL } from "../../config/api";
import { apiClient } from "../../services/apiClient";
import { IoCameraOutline, IoPersonOutline, IoKeyOutline, IoMailOutline, IoCallOutline, IoTextOutline, IoSaveOutline } from "react-icons/io5";
import InputComponent from "../Components/InputComponent";

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

  const token = ""; // Sesión gestionada vía cookies HttpOnly

  const cargarPerfil = async () => {
    try {
      const res = await apiClient.get("/perfil");
      const data = res.data;
      const user = data.usuario || data;
      if (user) {
        setPerfil(user);
        setPreview(user.imagen_perfil || null);
        setForm({
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          telefono: user.telefono || "",
          biografia: user.biografia || "",
          email: user.email || "",
        });
      }
    } catch { setError("Error al cargar el perfil."); }
  };

  useEffect(() => { cargarPerfil(); }, []);

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
      await apiClient.put("/perfil", formData);
      setMensaje("Perfil actualizado correctamente.");
      cargarPerfil();
    } catch (err: any) { 
      const errMsg = err.response?.data?.message || "No se pudo actualizar el perfil.";
      setError(errMsg); 
    }
    finally { setLoading(false); }
  };

  const enviarCorreoReset = async () => {
    setResetMsg("");
    setSendingReset(true);
    try {
      await apiClient.post("/auth/change-password");
      setResetMsg("Se envió un correo para cambiar tu contraseña.");
    } catch (err: any) { 
      const errMsg = err.response?.data?.message || "No se pudo enviar el correo.";
      setResetMsg(errMsg); 
    }
    finally { setSendingReset(false); }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn max-w-5xl mx-auto py-4 md:py-8 px-4">
      {/* Profile Banner Responsivo */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col items-center relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r from-sky-400 to-blue-600 opacity-10 group-hover:opacity-15 transition-all duration-700" />
         
         <div className="relative mt-4 md:mt-8 group">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 md:border-8 border-white shadow-2xl overflow-hidden bg-gray-50 group-hover:scale-105 transition-transform duration-500">
               <img
                 src={
                   preview && preview.startsWith("blob:") 
                     ? preview 
                     : preview 
                       ? (preview.startsWith("http") ? preview : `${API_URL}/${preview.replace(/^\/?(api\/)?/, "")}`)
                       : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                 }
                 className="w-full h-full object-cover"
                 alt="Preview"
                 onError={(e) => {
                   const img = e.target as HTMLImageElement;
                   if (!img.src.includes("cdn-icons-png")) {
                     img.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                   }
                 }}
               />
            </div>
            <label className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-10 h-10 md:w-12 md:h-12 bg-[#0E1C2B] text-white rounded-xl md:rounded-2xl flex items-center justify-center cursor-pointer hover:bg-sky-600 transition-all shadow-xl active:scale-90 border-2 md:border-4 border-white">
               <IoCameraOutline size={18} className="md:size-5" />
               <input type="file" accept="image/*" onChange={handleImagen} className="hidden" />
            </label>
         </div>

         <div className="mt-4 md:mt-6 text-center">
            <h1 className="text-xl md:text-2xl font-black text-[#0E1C2B]">{form.nombre} {form.apellido}</h1>
            <p className="text-[10px] md:text-xs font-black text-sky-500 uppercase tracking-[0.3em] mt-1">Administrador de Plataforma</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
         {/* Edit Details Responsivo */}
         <div className="lg:col-span-2 space-y-6 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-sky-50 text-sky-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm"><IoPersonOutline size={18} className="md:size-[22px]" /></div>
               <h2 className="text-[11px] md:text-sm font-black text-[#0E1C2B] uppercase tracking-widest">Detalles Personales</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
               <InputComponent label="Nombre" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
               <InputComponent label="Apellido" value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} />
               <InputComponent label="Email de Acceso" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
               <InputComponent label="Teléfono de Contacto" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} />
            </div>

            <div className="mt-6 md:mt-8">
               <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Semblanza Profesional / Biografía</label>
               <textarea
                 value={form.biografia}
                 onChange={(e) => setForm({...form, biografia: e.target.value})}
                 className="w-full px-5 py-4 md:px-6 md:py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] md:rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all text-sm font-medium h-32 md:h-40 leading-relaxed text-[#0E1C2B]"
                 placeholder="Escribe algo sobre ti..."
               />
            </div>

            <div className="pt-4 md:pt-6 flex justify-end">
               <button 
                 onClick={actualizarPerfil} 
                 disabled={loading}
                 className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#0E1C2B] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-sky-600 transition-all shadow-xl shadow-sky-900/10 active:scale-95 disabled:opacity-50"
               >
                 <IoSaveOutline size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}
               </button>
            </div>

            {mensaje && <p className="text-center text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-4">✓ {mensaje}</p>}
            {error && <p className="text-center text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-widest mt-4">⚠ {error}</p>}
         </div>

         {/* Security & Settings Responsivo */}
         <div className="space-y-6 md:space-y-8">
            <div className="bg-[#0E1C2B] p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-500" />
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 text-white rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md shadow-sm"><IoKeyOutline size={18} className="md:size-[22px]" /></div>
                  <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest">Seguridad</h2>
               </div>
               
               <p className="text-[11px] md:text-xs text-white/60 font-medium mb-6 md:mb-8 leading-relaxed">¿Deseas actualizar tu contraseña? Enviaremos un enlace de recuperación a tu bandeja.</p>
               
               <button 
                 onClick={enviarCorreoReset}
                 disabled={sendingReset}
                 className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-sky-400 transition-all active:scale-95 disabled:opacity-50"
               >
                 {sendingReset ? "Procesando..." : "Enviar Enlace de Cambio"}
               </button>

               {resetMsg && <p className="text-center text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-4 text-sky-300 italic">{resetMsg}</p>}
            </div>

            <div className="bg-gray-50 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 flex flex-col items-center text-center">
               <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mb-4">
                  <IoMailOutline size={24} className="md:size-[28px]" />
               </div>
               <h3 className="text-[11px] md:text-sm font-black text-[#0E1C2B] uppercase tracking-widest mb-2">Ayuda & Soporte</h3>
               <p className="text-[11px] md:text-xs text-gray-500 font-medium leading-relaxed">Si tienes problemas, contacta con el soporte técnico de MIS Academy.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
