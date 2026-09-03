import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Settings,
  Home,
  BookOpen,
  Route as RouteIcon,
  Search,
} from 'lucide-react';
import { apiUrl } from '../config/api';
import { apiClient } from '../services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchLineas } from '../store/academicSlice';
import { UserMenu } from './Header/UserMenu';
import { MobileMenu } from './Header/MobileMenu';

const slugify = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

function Header() {
  const dispatch = useAppDispatch();
  const { lineas, loading: loadingLineas } = useAppSelector((state) => state.academic);

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
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(fetchLineas());
  }, [dispatch]);

  useEffect(() => {
    if (isUserLoggedIn) return;

    apiClient
      .get(`/auth/profile?t=${Date.now()}`)
      .then((res) => {
        const data = res.data;

        if (!data) {
          setIsUserLoggedIn(false);
          setUser(null);
          localStorage.removeItem('user');
          return;
        }

        setUser(data);
        setIsUserLoggedIn(true);

        // Mantener información básica en localStorage
        localStorage.setItem('user', JSON.stringify(data));

        apiClient
          .get('/carrito')
          .then((resCarrito) => {
            const cartData = resCarrito.data;
            setCartCount(cartData?.data?.items?.length || 0);
          })
          .catch(() => {
            setCartCount(0);
          });
      })
      .catch(() => {
        setIsUserLoggedIn(false);
        setUser(null);
        localStorage.removeItem('user');
        setCartCount(0);
      });
  }, [isUserLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuPerfil(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuPerfil(false);
    setIsUserLoggedIn(false);
    setUser(null);

    localStorage.removeItem('user');
    sessionStorage.clear();

    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      window.location.replace('/');
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLineasHover(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setLineasHover(false), 100);
  };

  const goPerfil = () => {
    navigate('/perfil');
  };

  return (
    <>
      <MobileMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isUserLoggedIn={isUserLoggedIn}
        user={user}
        goPerfil={goPerfil}
        handleLogout={handleLogout}
      />

      <header
        className={`w-full z-[100] transition-all duration-500 fixed top-0 left-0 right-0 border-b border-white/5 ${
          scrolled || !isHomePage
            ? 'bg-[#03070c]/65 backdrop-blur-md py-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="group flex items-center transition-transform duration-500 hover:scale-105"
              >
                <img
                  src="/images/logomatt.webp"
                  alt="MIS ACADEMY"
                  className="w-[145px] md:w-[165px] h-auto object-contain relative z-10 drop-shadow-[0_0_20px_rgba(14,165,233,0.4)] group-hover:drop-shadow-[0_0_35px_rgba(14,165,233,0.75)] transition-all duration-500"
                />
              </Link>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                {
                  name: 'Inicio',
                  icon: <Home size={16} />,
                  path: '/',
                },
                {
                  name: 'Cursos',
                  icon: <RouteIcon size={16} />,
                  path: '/cursos',
                },
                {
                  name: 'Líneas',
                  icon: <BookOpen size={16} />,
                  path: '/lineas-academicas',
                },
                {
                  name: 'Consulta',
                  icon: <Search size={16} />,
                  path: '/consulta',
                },
              ].map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-1.5 text-sm font-medium tracking-wider uppercase rounded-lg transition-all duration-300 relative group flex items-center gap-2 ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                    onMouseEnter={item.name === 'Líneas' ? handleMouseEnter : undefined}
                    onMouseLeave={item.name === 'Líneas' ? handleMouseLeave : undefined}
                  >
                    <span
                      className={`${
                        isActive ? 'text-sky-400' : 'text-white/50 group-hover:text-white'
                      } transition-colors`}
                    >
                      {item.icon}
                    </span>

                    <span className="relative z-10">{item.name}</span>

                    {item.name === 'Líneas' && (
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-300 group-hover:rotate-180 opacity-40 group-hover:opacity-100"
                      />
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.85)]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Acciones (Desktop) */}
            <div className="flex items-center gap-4" ref={menuRef}>
              {!isUserLoggedIn ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium tracking-wider text-white/60 hover:text-white transition-all px-3 py-1.5 hover:bg-white/5 rounded-lg"
                  >
                    Entrar
                  </Link>

                  <div className="w-px h-5 bg-white/10" />

                  <Link
                    to="/registro"
                    className="relative overflow-hidden group px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-sm font-semibold tracking-wider transition-all hover:scale-105 hover:shadow-lg hover:shadow-sky-500/20 active:scale-95"
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
                    <ShoppingCart
                      size={16}
                      className="group-hover:scale-110 transition-transform"
                    />

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
                      className={`flex items-center p-0.5 rounded-full transition-all duration-300 ${
                        menuPerfil ? 'ring-2 ring-sky-500/50 bg-sky-500/10' : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="w-9 h-9 overflow-hidden bg-white/10 rounded-full border border-white/10 flex items-center justify-center text-white font-bold transition-all">
                        {(() => {
                          const imgPath =
                            user?.imagen_perfil ||
                            user?.user?.imagen_perfil ||
                            user?.usuario?.imagen_perfil;

                          const nombre =
                            user?.nombre || user?.user?.nombre || user?.usuario?.nombre || 'A';

                          if (imgPath) {
                            const finalUrl = /^https?:\/\//i.test(imgPath)
                              ? imgPath
                              : `${apiUrl('/').replace(/\/$/, '')}/${imgPath.replace(
                                  /^\/?(api\/)?/,
                                  '',
                                )}`;

                            return (
                              <img
                                src={finalUrl}
                                className="w-full h-full object-cover"
                                alt="Perfil"
                              />
                            );
                          }

                          return nombre.charAt(0).toUpperCase();
                        })()}
                      </div>
                    </button>

                    <UserMenu
                      isOpen={menuPerfil}
                      onClose={() => setMenuPerfil(false)}
                      user={user}
                      goPerfil={goPerfil}
                      handleLogout={handleLogout}
                    />
                  </div>
                </div>
              )}

              {/* Hamburguesa móvil */}
              <button
                className="md:hidden text-white/60 p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dropdown de Líneas para Desktop */}
      <AnimatePresence>
        {lineasHover && (
          <>
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
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl z-[90] px-8 hidden md:block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="bg-[#03070c]/95 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-3 mb-8 px-4">
                  <div className="w-8 h-8 bg-sky-500/10 border border-sky-500/30 rounded-lg flex items-center justify-center">
                    <Sparkles size={14} className="text-sky-400" />
                  </div>

                  <h4 className="text-[10px] font-black tracking-[0.3em] text-white uppercase">
                    Especializaciones Académicas
                  </h4>
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
                        <p className="text-sm font-black text-white group-hover/item:text-sky-400 transition-colors uppercase tracking-tight">
                          {linea.nombre}
                        </p>

                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          Ver rutas académicas
                        </p>
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
