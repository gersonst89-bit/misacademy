import React, { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { apiUrl } from "../config/api";
import { Link } from "react-router-dom";
import { Mail, ArrowUpRight, Sparkles } from "lucide-react";

interface LineaAcademica {
  id_linea: number;
  nombre: string;
  estado: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface FooterPag {
  name: string;
  to: string;
  image?: string;
}

const Footer: React.FC = () => {
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const res = await fetch(apiUrl("/lineas-academicas"));
        const data = await res.json();
        const lineasPublicadas = (data?.data || []).filter(
          (linea: LineaAcademica) => linea.estado === "Publicado"
        );
        setLineas(lineasPublicadas);
      } catch (error) {
        console.error("Error al cargar líneas académicas:", error);
      }
    };
    fetchLineas();
  }, []);

  const socialLinks: SocialLink[] = [
    {
      name: "Facebook",
      href: "https://web.facebook.com/mattinnovasolution",
      icon: <FaFacebook className="w-5 h-5" />,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/mattinnovasolution/",
      icon: <FaInstagram className="w-5 h-5" />,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/mattinnovasolution/",
      icon: <FaLinkedin className="w-5 h-5" />,
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@mattinnovasolution",
      icon: <FaYoutube className="w-5 h-5" />,
    },
  ];

  const slugify = (s: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return (
    <footer className="relative bg-transparent border-t border-white/5 pt-24 pb-12 overflow-hidden">
      {/* Atmósfera de fondo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-sky-500/5 to-transparent" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-8 group">
              <h3 className="text-4xl font-black text-white tracking-tighter italic">
                MIS <span className="text-gradient-sky drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">ACADEMY</span>
              </h3>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-10 text-base font-medium max-w-sm">
              Potenciamos el talento digital con formación de vanguardia. 
              Especialízate en las tecnologías que están construyendo el futuro.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-sky-500 hover:border-sky-400 hover:text-white transition-all duration-500 group"
                  aria-label={social.name}
                >
                  <div className="group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] uppercase font-black text-white tracking-[0.3em] mb-10 opacity-50">
              Especialidades
            </h4>
            <ul className="grid gap-5">
              {lineas.length === 0 ? (
                <li key="footer-loading-lineas" className="text-slate-600 text-sm italic">Cargando...</li>
              ) : (
                lineas.map((linea, index) => (
                  <li key={linea.id_linea || `footer-linea-${index}`}>
                    <Link
                      to={`/lineas-academicas/${slugify(linea.nombre)}`}
                      className="text-slate-400 hover:text-sky-400 transition-colors duration-300 text-sm font-bold flex items-center gap-2 group"
                    >
                      {linea.nombre}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] uppercase font-black text-white tracking-[0.3em] mb-10 opacity-50">
              Recursos
            </h4>
            <ul className="grid gap-5">
              <li><Link to="/cursos" className="text-slate-400 hover:text-sky-400 transition-colors text-sm font-bold">Explorar Cursos</Link></li>
              <li><Link to="/consulta" className="text-slate-400 hover:text-sky-400 transition-colors text-sm font-bold">Validar Certificado</Link></li>
              <li><Link to="/terminos" className="text-slate-400 hover:text-sky-400 transition-colors text-sm font-bold">Términos Legales</Link></li>
              <li><Link to="/reclamaciones" className="text-slate-400 hover:text-sky-400 transition-colors text-sm font-bold">Libro Reclamaciones</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="p-8 glass-card rounded-[2.5rem] border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Mail size={80} />
              </div>
              <h4 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-sky-400" />
                Hablemos
              </h4>
              <p className="text-sm text-slate-400 mb-6 font-medium">
                ¿Tienes dudas sobre nuestras rutas académicas? Escríbenos directamente.
              </p>
              <a
                href="mailto:info@misacademy.com"
                className="btn-premium w-full py-4 text-xs tracking-widest uppercase"
              >
                Enviar Correo
              </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <img src="/logomatt.png" alt="Logo" className="h-6 opacity-50" />
            </div>
            <div className="text-slate-500 text-[10px] uppercase font-black tracking-[0.1em]">
              © 2025 MIS ACADEMY — MATT INNOVA SOLUTION.
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-slate-600 font-black tracking-widest uppercase">Building the Digital Era</span>
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
