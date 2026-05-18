import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, ChevronDown, Sparkles, LayoutDashboard, LogOut, Settings, Home, BookOpen, Route as RouteIcon, Search } from "lucide-react";
import { apiUrl } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchLineas } from "../store/academicSlice";

const slugify = (s: string) =>
    (s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

function Header() {
    const dispatch = useDispatch<any>();
    const { lineas, loading: loadingLineas } = useSelector((state: any) => state.academic);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [lineasHover, setLineasHover] = useState(false);
    const [menuPerfil, setMenuPerfil] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const timeoutRef = useRef<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        dispatch(fetchLineas());
    }, [dispatch]);

    useEffect(() => {
        const userStored = localStorage.getItem("user");
        if (userStored && !isUserLoggedIn) {
            fetch(apiUrl(`/auth/profile?t=${Date.now()}`), {
                headers: {
                    Accept: "application/json",
                },
                credentials: "include", // Importante para cookies
            })
                .then((res) => {
                    if (res.status === 401) {
                        // Si el servidor dice que no está autorizado, limpiamos el localStorage
                        localStorage.removeItem("user");
                        return null;
                    }
                    return res.ok ? res.json() : null;
                })
                .then((data) => {
                    if (data) {
                        setUser(data);
                        setIsUserLoggedIn(true);

                        // Cargar carrito para el contador
                        fetch(apiUrl("/carrito"), { credentials: "include" })
                            .then(res => res.json())
                            .then(cartData => {
                                setCartCount(cartData?.data?.items?.length || 0);
                            });
                    } else {
                        localStorage.removeItem("user");
                    }
                })
                .catch(() => {
                    localStorage.removeItem("user");
                });
        }
    }, [isUserLoggedIn]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuPerfil(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setMenuPerfil(false);
        setIsUserLoggedIn(false);
        setUser(null);
        localStorage.removeItem("user");

        // Forzar borrado manual de cookies con TODAS las etiquetas de seguridad (Secure; SameSite=None)
        //const domains = [window.location.hostname, "." + window.location.hostname];
        //domains.forEach(dom => {
        //document.cookie = `is_logged_in=; Path=/; Domain=${dom}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=None`;
        //document.cookie = `XSRF-TOKEN=; Path=/; Domain=${dom}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=None`;
        //});
        // Sin dominio explícito
        //document.cookie = "is_logged_in=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=None";
        //document.cookie = "XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=None";

        // Clear cookie on logout via API call
        try {
            await fetch(apiUrl("/auth/logout"), {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error("Error during logout:", err);
        }

        // Limpiar CSRF token en memoria para que el próximo login genere uno fresco

        // Si ya estamos en inicio, forzamos recarga. Si no, redirigimos a inicio.
        if (window.location.pathname === "/") {
            window.location.reload();
        } else {
            window.location.href = "/";
        }
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLineasHover(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = window.setTimeout(() => setLineasHover(false), 100);
    };

    const goPerfil = () => {
        navigate("/perfil");
    };

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex"
                    >
                        <div className="flex-1 bg-black/80 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="w-full max-w-[320px] bg-[#03070c] text-white h-full p-8 shadow-2xl border-l border-white/10"
                        >
                            <div className="flex justify-between items-center mb-16">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                                        <Sparkles size={16} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase italic">MENÚ</h3>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-6 text-xl font-black uppercase tracking-tight">
                                {["Inicio", "Cursos", "Líneas", "Consulta"].map((item) => (
                                    <Link
                                        key={item}
                                        to={item === "Líneas" ? "/lineas-academicas" : `/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "inicio" ? "" : item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                                        onClick={() => setSidebarOpen(false)}
                                        className="hover:text-sky-400 transition-all flex items-center justify-between group"
                                    >
                                        {item}
                                        <div className="w-0 group-hover:w-8 h-px bg-sky-500 transition-all duration-500" />
                                    </Link>
                                ))}

                                <div className="pt-12 mt-8 border-t border-white/5 flex flex-col gap-5">
                                    {!isUserLoggedIn ? (
                                        <>
                                            <Link
                                                to="/login"
                                                className="btn-premium w-full py-5 text-sm"
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                LOGIN
                                            </Link>
                                            <Link
                                                to="/registro"
                                                className="btn-premium btn-premium-outline w-full py-5 text-sm"
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                REGISTRO
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            {(user?.id_rol === 1 || user?.id_rol === 2) && (
                                                <Link to="/admin" onClick={() => setSidebarOpen(false)} className="text-sky-400 text-sm">ADMIN PANEL</Link>
                                            )}
                                            <Link to="/compras" onClick={() => setSidebarOpen(false)} className="text-sm">MIS CURSOS</Link>
                                            <Link to="/carrito" onClick={() => setSidebarOpen(false)} className="text-sm">MI CARRITO</Link>
                                            <button onClick={() => { setSidebarOpen(false); goPerfil(); }} className="text-left text-sm">PERFIL</button>
                                            <button onClick={() => { handleLogout(); setSidebarOpen(false); }} className="text-left text-sm text-rose-500">SALIR</button>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header
                className={`w-full z-[100] transition-all duration-500 fixed top-0 left-0 right-0 border-b border-white/[0.05] ${scrolled || !isHomePage
                        ? "bg-[#03070c]/60 backdrop-blur-3xl py-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
                        : "bg-transparent py-8"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex items-center justify-between h-20">


                        <div className="flex items-center gap-6">
                            <button
                                className="md:hidden text-white/50 p-2 hover:text-white transition-colors"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            <Link to="/" className="group flex items-center transition-transform duration-500 hover:scale-105">
                                <img
                                    src="/logomatt.png"
                                    alt="MIS ACADEMY"
                                    className="h-14 md:h-16 relative z-10 drop-shadow-[0_0_20px_rgba(14,165,233,0.6)] group-hover:drop-shadow-[0_0_30px_rgba(14,165,233,0.9)] transition-all duration-500"
                                />
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center space-x-2">
                            {[
                                { name: "Inicio", icon: <Home size={14} /> },
                                { name: "Cursos", icon: <BookOpen size={14} /> },
                                { name: "Líneas", icon: <RouteIcon size={14} /> },
                                { name: "Consulta", icon: <Search size={14} /> }
                            ].map((item) => {
                                const isActive = location.pathname === (item.name === "Inicio" ? "/" : item.name === "Líneas" ? "/lineas-academicas" : `/${item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`);

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.name === "Líneas" ? "/lineas-academicas" : `/${item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "inicio" ? "" : item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                                        className={`px-5 py-2 text-[10px] font-bold tracking-[0.15em] uppercase rounded-lg transition-all duration-300 relative group flex items-center gap-2.5 ${isActive ? "text-white" : "text-white/40 hover:text-white/80"
                                            }`}
                                        onMouseEnter={item.name === "Líneas" ? handleMouseEnter : undefined}
                                        onMouseLeave={item.name === "Líneas" ? handleMouseLeave : undefined}
                                    >
                                        <span className={`${isActive ? "text-sky-400" : "text-white/20 group-hover:text-white/40"} transition-colors`}>
                                            {item.icon}
                                        </span>
                                        <span className="relative z-10">{item.name}</span>
                                        {item.name === "Líneas" && <ChevronDown size={12} className={`transition-transform duration-300 group-hover:rotate-180 opacity-20 group-hover:opacity-100`} />}
                                        {isActive && (
                                            <motion.div layoutId="nav-active" className="absolute bottom-0 left-5 right-5 h-0.5 bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-4" ref={menuRef}>
                            {!isUserLoggedIn ? (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="text-[10px] font-bold tracking-[0.1em] text-white/40 hover:text-white transition-all uppercase px-4 py-2 hover:bg-white/5 rounded-lg"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        to="/registro"
                                        className="relative overflow-hidden group px-6 py-2 rounded-lg bg-sky-500 text-white text-[10px] font-bold tracking-[0.1em] uppercase transition-all hover:scale-105 active:scale-95"
                                    >
                                        <span className="relative z-10">Únete</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/carrito"
                                        className="relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all group"
                                    >
                                        <ShoppingCart size={16} className="group-hover:scale-110 transition-transform" />
                                        {cartCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-[8px] font-black flex items-center justify-center rounded-full text-white border border-black"
                                            >
                                                {cartCount}
                                            </motion.span>
                                        )}
                                    </Link>

                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuPerfil(!menuPerfil)}
                                            className={`flex items-center p-0.5 rounded-full transition-all duration-300 ${menuPerfil
                                                    ? 'ring-2 ring-sky-500/50 bg-sky-500/10'
                                                    : 'hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="w-9 h-9 overflow-hidden bg-white/10 rounded-full border border-white/10 flex items-center justify-center text-white font-bold transition-all">
                                                {(() => {
                                                    const imgPath = user?.imagen_perfil || user?.user?.imagen_perfil || user?.usuario?.imagen_perfil;
                                                    const nombre = user?.nombre || user?.user?.nombre || user?.usuario?.nombre || "A";

                                                    if (imgPath) {
                                                        const finalUrl = `${apiUrl("/").replace(/\/$/, "")}/${imgPath.replace(/^\/?(api\/)?/, "")}`;
                                                        return <img src={finalUrl} className="w-full h-full object-cover" alt="Perfil" />;
                                                    }
                                                    return nombre.charAt(0).toUpperCase();
                                                })()}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {menuPerfil && (
                                                <>
                                                    {/* Overlay sutil para el dropdown de perfil */}
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        onClick={() => setMenuPerfil(false)}
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
                                                                <p className="text-sm font-black text-white truncate leading-none mb-1">{user?.nombre}</p>
                                                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-1 mt-4">
                                                            {(user?.id_rol === 1 || user?.id_rol === 2) && (
                                                                <Link
                                                                    to="/admin"
                                                                    className="group/item flex items-center gap-3 px-4 py-3 hover:bg-sky-500/10 text-sky-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                                                    onClick={() => setMenuPerfil(false)}
                                                                >
                                                                    <LayoutDashboard className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                                                                    <span className="tracking-wide">Panel de Control</span>
                                                                </Link>
                                                            )}

                                                            {!(user?.id_rol === 1 || user?.id_rol === 2) && (
                                                                <Link
                                                                    to="/compras"
                                                                    className="group/item flex items-center gap-3 px-4 py-3 hover:bg-sky-500/10 text-slate-300 hover:text-sky-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                                                    onClick={() => setMenuPerfil(false)}
                                                                >
                                                                    <Sparkles className="w-4 h-4 group-hover/item:scale-110 transition-transform text-slate-500 group-hover/item:text-sky-400" />
                                                                    <span className="tracking-wide">Mis Cursos</span>
                                                                </Link>
                                                            )}

                                                            <button
                                                                onClick={() => { setMenuPerfil(false); goPerfil(); }}
                                                                className="group/item flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                                                            >
                                                                <User className="w-4 h-4 group-hover/item:scale-110 transition-transform text-slate-500 group-hover/item:text-sky-400" />
                                                                <span className="tracking-wide">Mi Perfil</span>
                                                            </button>

                                                            <div className="h-px bg-white/5 my-2 mx-4" />

                                                            <button
                                                                onClick={handleLogout}
                                                                className="group/item flex items-center gap-3 px-4 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-black text-xs rounded-xl transition-all cursor-pointer"
                                                            >
                                                                <LogOut className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                                                                <span className="tracking-widest uppercase text-[10px]">Cerrar Sesión</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Dropdown de Líneas para Desktop - Mejorado */}
            <AnimatePresence>
                {lineasHover && (
                    <>
                        {/* Overlay para oscurecer el fondo y centrar la atención */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[85] pointer-events-none"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl z-[90] px-8 hidden md:block"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="bg-[#03070c]/95 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                                <div className="flex items-center gap-3 mb-8 px-4">
                                    <div className="w-8 h-8 bg-sky-500/10 border border-sky-500/30 rounded-lg flex items-center justify-center">
                                        <Sparkles size={14} className="text-sky-400" />
                                    </div>
                                    <h4 className="text-[10px] font-black tracking-[0.3em] text-white uppercase">Especializaciones Académicas</h4>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {lineas.map((linea: any, index: number) => (
                                        <Link
                                            key={linea.id_linea || `header-linea-${index}`}
                                            to={`/lineas-academicas/${slugify(linea.slug || linea.nombre)}`}
                                            className="flex items-center gap-5 p-5 hover:bg-sky-500/10 rounded-[2rem] transition-all group/item border border-transparent hover:border-sky-500/20"
                                            onClick={() => setLineasHover(false)}
                                        >
                                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover/item:bg-sky-500 group-hover/item:border-sky-400 group-hover/item:text-white transition-all duration-300 font-black text-sm">
                                                {linea.nombre.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-white group-hover/item:text-sky-400 transition-colors uppercase tracking-tight">{linea.nombre}</p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-1">Ver rutas de aprendizaje</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default Header;


