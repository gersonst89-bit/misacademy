import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { apiUrl } from "../config/api";

const slugify = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function Header() {
  const [lineas, setLineas] = useState<
    { id_linea: number; nombre: string; slug?: string; estado: string }[]
  >([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lineasHover, setLineasHover] = useState(false);
  const [menuPerfil, setMenuPerfil] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  // Cargar líneas académicas
  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const res = await fetch(
          apiUrl("/lineas")
        );
        if (!res.ok) throw new Error("Error al obtener líneas académicas");
        const data = await res.json();
        const activas = (data.data || []).filter(
          (l: any) => l.estado === "Publicado"
        );
        setLineas(activas);
      } catch (err) {
        console.error("Error cargando líneas:", err);
      }
    };

    fetchLineas();
  }, []);

  // Verificar token de usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isUserLoggedIn) {
      fetch(apiUrl("/auth/profile"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setUser(data);
            setIsUserLoggedIn(true);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, [isUserLoggedIn]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuPerfil(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuPerfil(false);
    setIsUserLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLineasHover(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setLineasHover(false), 100);
  };

  const goPerfil = () => {
    const userId = user?.id_usuario ?? user?.id ?? user?.user_id;
    navigate(userId ? `/perfil/${userId}` : "/perfil");
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-row-reverse">
          <div
            className="flex-1 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="w-72 bg-[#0E1C2B] text-white h-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6">Menú</h3>

            <nav className="flex flex-col gap-4 text-lg">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                Inicio
              </Link>

              <Link to="/cursos" onClick={() => setSidebarOpen(false)}>
                Cursos
              </Link>

              <Link
                to="/lineas-academicas"
                onClick={() => setSidebarOpen(false)}
              >
                Líneas académicas
              </Link>

              <Link to="/consulta" onClick={() => setSidebarOpen(false)}>
                Consulta en Línea
              </Link>

              {!isUserLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="mt-4 px-4 py-2 bg-sky-400 text-center rounded-lg"
                    onClick={() => setSidebarOpen(false)}
                  >
                    INICIAR SESIÓN
                  </Link>

                  <Link
                    to="/registro"
                    className="px-4 py-2 bg-sky-600 text-center rounded-lg"
                    onClick={() => setSidebarOpen(false)}
                  >
                    REGÍSTRATE
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/carrito" onClick={() => setSidebarOpen(false)}>
                    Carrito
                  </Link>

                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      goPerfil();
                    }}
                    className="text-left px-0"
                  >
                    Mi perfil
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="text-left text-red-400"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <header
        className={`w-full z-50 bg-[#0E1C2B] text-white shadow-md ${
          isHomePage ? "fixed top-0 left-0 right-0" : "relative"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo y hamburguesa */}
          <div className="flex items-center gap-2">
            <button
              className="md:hidden bg-sky-600 text-white rounded-full p-2 shadow-md mr-2"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="text-xl">☰</span>
            </button>

            <Link to="/">
              <img
                src="/logomatt.png"
                alt="Matt Innova Logo"
                className="h-14 md:h-16 cursor-pointer"
              />
            </Link>
          </div>

          <nav className="hidden md:flex space-x-12 text-base font-medium">
            <Link to="/" className="hover:text-sky-400 transition">
              Inicio
            </Link>
            <Link to="/cursos" className="hover:text-sky-400 transition">
              Cursos
            </Link>

            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/lineas-academicas"
                className="text-white hover:text-sky-400 transition"
              >
                Líneas académicas
              </Link>

              {lineasHover && (
                <div className="absolute left-0 mt-2 w-56 bg-[#152B3F] text-white rounded-lg shadow-lg z-[9999]">
                  {lineas.length > 0 ? (
                    lineas.map((linea) => (
                      <Link
                        key={linea.id_linea}
                        to={`/lineas-academicas/${slugify(
                          linea.slug || linea.nombre
                        )}`}
                        className="block px-4 py-2 hover:bg-sky-600 capitalize"
                        onClick={() => setLineasHover(false)}
                      >
                        {linea.nombre}
                      </Link>
                    ))
                  ) : (
                    <span className="block px-4 py-2 text-gray-400"></span>
                  )}
                </div>
              )}
            </div>

            <Link to="/consulta" className="hover:text-sky-400 transition">
              Consulta en Línea
            </Link>
          </nav>

          <div
            className="hidden md:flex space-x-6 items-center relative"
            ref={menuRef}
          >
            {!isUserLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 font-semibold bg-sky-400 rounded-lg hover:bg-sky-500 transition"
                >
                  INICIAR SESIÓN
                </Link>
                <Link
                  to="/registro"
                  className="px-5 py-2 font-semibold bg-sky-600 rounded-lg hover:bg-sky-700 transition"
                >
                  REGÍSTRATE
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/carrito"
                  className="hover:text-sky-400"
                  title="Carrito"
                >
                  <ShoppingCart className="w-6 h-6 text-white" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setMenuPerfil(!menuPerfil)}
                    className="flex items-center justify-center"
                    aria-label="Abrir perfil"
                    title="Perfil"
                  >
                    <User className="w-7 h-7 text-white" />
                  </button>

                  {menuPerfil && (
                    <div className="absolute right-0 mt-2 w-44 bg-[#152B3F] rounded-lg shadow-lg overflow-hidden z-[9999]">
                      <button
                        onClick={() => {
                          setMenuPerfil(false);
                          goPerfil();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-sky-600"
                      >
                        Mi perfil
                      </button>
                      <Link
                        to="/compras"
                        className="block px-4 py-2 hover:bg-sky-600"
                        onClick={() => setMenuPerfil(false)}
                      >
                        Mis compras
                      </Link>
                      <Link
                        to="/reseñas"
                        className="block px-4 py-2 hover:bg-sky-600"
                        onClick={() => setMenuPerfil(false)}
                      >
                        Mis reseñas
                      </Link>
                      <Link
                        to="/certificados"
                        className="block px-4 py-2 hover:bg-sky-600"
                        onClick={() => setMenuPerfil(false)}
                      >
                        Mis certificados
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-600"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
