import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Github, 
  Chrome,
  ChevronRight,
  IdCard,
  AlertTriangle
} from "lucide-react";
import { apiUrl, BASE_URL } from "../config/api";
import { apiClient } from "../services/apiClient";
import { motion, AnimatePresence } from "framer-motion";

export default function RegistroPage() {
    // ... (nombres, apellido, etc)
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [dni, setDni] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    // Validación inteligente de apellidos para certificados
    const [mostrarAlertaApellido, setMostrarAlertaApellido] = useState(false);
    const [bypassApellido, setBypassApellido] = useState(false);
    const apellidoInputRef = React.useRef<HTMLInputElement>(null);

    const [showPass, setShowPass] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 15,
                y: (e.clientY / window.innerHeight - 0.5) * 15,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const passLen = password.length;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passOk = passLen >= 8 && hasSpecialChar;
    
    const canSubmit =
        nombre.trim() !== "" &&
        apellido.trim() !== "" &&
        dni.trim() !== "" &&
        email.trim() !== "" &&
        passLen >= 8 &&
        hasSpecialChar &&
        password === passwordConfirmation &&
        !loading;

    const handleGithubLogin = () => {
        window.location.href = `${BASE_URL}/api/auth/github`;
    };

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

        // Validación inteligente: verificar si hay al menos dos apellidos (separados por espacios)
        const apellidosTrimmed = apellido.trim();
        const tieneDosApellidos = apellidosTrimmed.split(/\s+/).length >= 2;

        if (!tieneDosApellidos && !bypassApellido) {
            setMostrarAlertaApellido(true);
            return;
        }

        await ejecutarRegistro();
    };

    const ejecutarRegistro = async () => {
        try {
            setLoading(true);
            const payload = { nombre, apellido, dni, email, password };

            const res = await apiClient.post("/auth/register", payload).catch((err: any) => {
                const data = err?.response?.data;
                if (data?.errors) {
                    const msg = Object.values<string[]>(data.errors).flat().join(" ");
                    throw new Error(msg);
                }
                throw new Error(data?.message || err?.message || "No se pudo completar el registro.");
            });

            const data = res.data;

            setSuccess("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err?.message || "Error inesperado. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCorregirApellido = () => {
        setMostrarAlertaApellido(false);
        setTimeout(() => {
            apellidoInputRef.current?.focus();
        }, 100);
    };

    const handleConfirmarSoloUnApellido = () => {
        setBypassApellido(true);
        setMostrarAlertaApellido(false);
        // Ejecuta el registro inmediatamente para evitar hacer doble clic al usuario
        setTimeout(() => {
            ejecutarRegistro();
        }, 100);
    };

    return (
        <div className="min-h-screen flex items-center justify-start relative overflow-y-auto py-8 md:py-12 px-6 md:px-12 lg:px-24 font-sans">
            {/* Background Image (Fixed for premium parallax effect) */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/login.png" 
                    alt="Developer workspace"
                    className="w-full h-full object-cover opacity-60 scale-105 pointer-events-none"
                />
                <div className="absolute inset-0 bg-[#03070c]/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
            </div>

            {/* Falling Snow Effect (Fixed) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                {[...Array(80)].map((_, i) => {
                    const left = Math.random() * 100;
                    const delay = Math.random() * 5;
                    const duration = Math.random() * 5 + 5; // 5 to 10 seconds
                    const opacity = Math.random() * 0.6 + 0.4;
                    const size = Math.random() * 5 + 3; // 3px to 8px diameter
                    const swing = Math.random() * 60 - 30; // -30px to +30px horizontal movement
                    
                    return (
                        <motion.div
                            key={`snow-${i}`}
                            initial={{ y: -100, opacity: 0, x: 0 }}
                            animate={{ 
                                y: "100vh", 
                                opacity: [0, opacity, opacity, 0],
                                x: [0, swing, swing * 2]
                            }}
                            transition={{
                                duration: duration,
                                repeat: Infinity,
                                delay: delay,
                                ease: "linear",
                            }}
                            className="absolute bg-white rounded-full"
                            style={{
                                left: `${left}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                                filter: "blur(1px)"
                            }}
                        />
                    );
                })}
            </div>

            {/* Dynamic Background Atmosphere (Orbs - Fixed) */}
            <div className="fixed inset-0 pointer-events-none z-0 mix-blend-screen">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-blue-700/10 blur-[150px] rounded-full animate-pulse animation-delay-1000" />
            </div>

            {/* Main Register Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[640px] z-10 md:ml-12 lg:ml-24 xl:ml-40"
            >
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-5 sm:p-6">
                    
                    {/* Header */}
                    <div className="text-center mb-2">
                        <Link to="/" className="inline-block mb-2 hover:scale-105 transition-transform">
                            <img src="/logomatt.png" alt="Logo" className="h-10 brightness-0 invert opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                        </Link>
                        <h1 className="text-xl font-black font-['Outfit'] text-white uppercase tracking-tight mb-0.5">
                            Crear Cuenta
                        </h1>
                        <p className="text-xs text-white/50 font-medium">
                            Únete a la academia IT más avanzada.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70 ml-2">
                                    Nombres
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400/50 group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all duration-300">
                                        <User size={16} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Nombres completos (ej: Juan Daniel)"
                                        className="w-full pl-12 pr-4 py-2.5 rounded-[1.25rem] bg-black/20 border border-white/10 text-white font-medium text-xs placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all shadow-inner"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70 ml-2">
                                    Apellidos
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400/50 group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all duration-300">
                                        <User size={16} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        ref={apellidoInputRef}
                                        type="text"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        placeholder="Apellidos completos (ej: Pérez Gómez)"
                                        className="w-full pl-12 pr-4 py-2.5 rounded-[1.25rem] bg-black/20 border border-white/10 text-white font-medium text-xs placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all shadow-inner"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nota informativa de Nombres y Apellidos */}
                        <div className="text-[10px] text-white/40 leading-relaxed px-3 flex items-start gap-2">
                            <span className="text-sky-400">💡</span>
                            <span>Ingresa tus nombres y apellidos completos tal como figuran en tu documento de identidad (DNI). Se usarán exactamente así para la firma y emisión de tus certificados oficiales.</span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70 ml-2">
                                Documento Nacional de Identidad (DNI)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400/50 group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all duration-300">
                                    <IdCard size={16} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                                    placeholder="Tu DNI o Documento"
                                    maxLength={12}
                                    className="w-full pl-12 pr-4 py-2.5 rounded-[1.25rem] bg-black/20 border border-white/10 text-white font-medium text-xs placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all shadow-inner"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70 ml-2">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400/50 group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all duration-300">
                                    <Mail size={16} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nombre@correo.com"
                                    className="w-full pl-12 pr-4 py-2.5 rounded-[1.25rem] bg-black/20 border border-white/10 text-white font-medium text-xs placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all shadow-inner"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70 ml-2">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400/50 group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all duration-300">
                                        <Lock size={16} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-10 py-2.5 rounded-[1.25rem] bg-black/20 border border-white/10 text-white font-medium text-xs tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all shadow-inner"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70 ml-2">
                                    Confirmar
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400/50 group-focus-within:text-sky-400 group-focus-within:scale-110 transition-all duration-300">
                                        <ShieldCheck size={16} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type={showPass2 ? "text" : "password"}
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-10 py-2.5 rounded-[1.25rem] bg-black/20 border border-white/10 text-white font-medium text-xs tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all shadow-inner"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass2(!showPass2)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                                    >
                                        {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 pl-2 mt-2">
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${passLen >= 8 ? 'text-sky-400' : 'text-slate-400'}`}>
                                {passLen >= 8 ? '✓ Mínimo 8 caracteres' : `⚠ Mínimo 8 caracteres (${passLen}/8)`}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${hasSpecialChar ? 'text-sky-400' : 'text-slate-400'}`}>
                                {hasSpecialChar ? '✓ Un carácter especial' : '⚠ Un carácter especial (@, #, !, etc.)'}
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold text-center">
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-xs font-bold text-center">
                                {success}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className="w-full mt-3 py-3 rounded-[1.25rem] bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] focus:ring-4 focus:ring-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group hover:-translate-y-1"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Crear Mi Cuenta
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-3">
                        <div className="relative mb-3">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                                <span className="bg-black/20 backdrop-blur-xl px-3 py-1 rounded-full text-white/50 border border-white/5">
                                    O continuar con
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all text-xs font-bold text-white group">
                                <Chrome size={14} className="text-white/60 group-hover:text-white transition-colors" /> Google
                            </button>
                            <button 
                                type="button"
                                onClick={handleGithubLogin}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all text-xs font-bold text-white group"
                            >
                                <Github size={14} className="text-white/60 group-hover:text-white transition-colors" /> GitHub
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-2 text-slate-300 text-xs font-medium">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="text-sky-400 font-bold hover:text-sky-300 transition-colors">
                        Inicia sesión aquí
                    </Link>
                </p>
            </motion.div>

            {/* Modal de Advertencia de Apellidos para Certificados */}
            <AnimatePresence>
                {mostrarAlertaApellido && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="bg-slate-950/95 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
                        >
                            {/* Globo decorativo de gradiente */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                            
                            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                                <AlertTriangle size={32} strokeWidth={2} />
                            </div>
                            
                            <h3 className="text-xl font-black font-['Outfit'] text-white uppercase tracking-tight mb-3">
                                ¿Tienes un solo apellido?
                            </h3>
                            
                            <p className="text-xs text-white/70 font-medium leading-relaxed mb-8">
                                Detectamos que solo ingresaste un apellido. Recuerda que para que tu certificado tenga plena **validez oficial** ante empresas e instituciones, es altamente recomendable registrar tus **dos apellidos** (Paterno y Materno).
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={handleCorregirApellido}
                                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    Corregir / Agregar Apellido
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleConfirmarSoloUnApellido}
                                    className="text-[10px] text-white/40 hover:text-white font-black uppercase tracking-widest underline transition-colors py-2 cursor-pointer"
                                >
                                    Confirmar, solo tengo un apellido
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}