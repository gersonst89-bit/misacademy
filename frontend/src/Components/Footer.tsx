import React, { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { apiClient } from "../services/apiClient";
import { Link } from "react-router-dom";
import { Mail, ArrowUpRight, Sparkles } from "lucide-react";

interface LineaAcademica {
  id_linea: number;
  nombre: string;
  estado: string;
}

const Footer: React.FC = () => {
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const res = await apiClient.get("/lineas-academicas");
        const data = res.data;
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

  const socialLinks = [
    { name: "Facebook", href: "https://web.facebook.com/mattinnovasolution", icon: FaFacebook },
    { name: "Instagram", href: "https://www.instagram.com/mattinnovasolution/", icon: FaInstagram },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/mattinnovasolution/", icon: FaLinkedin },
    { name: "YouTube", href: "https://www.youtube.com/@mattinnovasolution", icon: FaYoutube },
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
    <footer className="relative bg-transparent border-t border-white/5 pt-16 pb-8 overflow-hidden">
      {/* Atmósfera de fondo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-sky-500/5 to-transparent" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          
          {/* Columna 1: Marca */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6 group">
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                MIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(14,165,233,0.3)]">ACADEMY</span>
              </h3>
            </Link>
            <p className="font-cuerpo text-slate-300 leading-relaxed mb-8 text-sm md:text-base max-w-sm">
              Plataforma educativa de{" "}
              <a
                href="https://www.mattinnovasolution.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-sky-400 transition-colors underline decoration-sky-500/30 underline-offset-4 font-bold"
              >
                MATT INNOVA SOLUTION
              </a>
              , diseñada para personas que desean aprender y especializarse en áreas tecnológicas.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-sky-500 hover:border-sky-400 hover:text-white transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Columna 2: Especialidades */}
          <div className="lg:col-span-2">
            <h4 className="font-titulo text-[10px] font-black tracking-[0.2em] text-white/50 uppercase mb-5">
              Especialidades
            </h4>
            <ul className="space-y-3 font-cuerpo">
              {lineas.length === 0 ? (
                <li className="text-slate-500 text-sm italic">Cargando...</li>
              ) : (
                lineas.map((linea, index) => (
                  <li key={linea.id_linea || `footer-linea-${index}`}>
                    <Link
                      to={`/lineas-academicas/${slugify(linea.nombre)}`}
                      className="text-slate-300 hover:text-sky-400 hover:translate-x-1 transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
                    >
                      {linea.nombre}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 translate-x-0.5" />
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Columna 3: Recursos */}
          <div className="lg:col-span-3">
            <h4 className="font-titulo text-[10px] font-black tracking-[0.2em] text-white/50 uppercase mb-5">
              Recursos
            </h4>
            <ul className="space-y-3 font-cuerpo">
              <li>
                <Link
                  to="/cursos"
                  className="text-slate-300 hover:text-sky-400 hover:translate-x-1 transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
                >
                  Explorar Cursos
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="/consulta"
                  className="text-slate-300 hover:text-sky-400 hover:translate-x-1 transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
                >
                  Validar Certificado
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="/terminos"
                  className="text-slate-300 hover:text-sky-400 hover:translate-x-1 transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
                >
                  Términos Legales
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 translate-x-0.5" />
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/reclamaciones" className="block transition-transform hover:scale-105">
                  <img
                    src="/libro.jpg"
                    alt="Libro de Reclamaciones"
                    className="w-24 rounded-lg opacity-70 hover:opacity-100 transition-all duration-300 shadow-md shadow-black/30"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto (Nuevo diseño minimalista y elegante) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-sky-400 shrink-0" />
              <h4 className="font-titulo text-xl font-black text-white">
                Hablemos
              </h4>
            </div>
            <p className="font-cuerpo text-sm text-slate-300 mb-6 leading-relaxed max-w-sm">
              ¿Tienes dudas sobre nuestras rutas académicas? Escríbenos directamente.
            </p>
            <a
              href="mailto:mattinnovasolution@hotmail.com"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-xs font-bold tracking-wider uppercase transition-all hover:scale-105 hover:shadow-lg hover:shadow-sky-500/20 active:scale-95"
            >
              <Mail size={14} />
              <span>Enviar Correo</span>
            </a>
          </div>
        </div>

        {/* Parte inferior */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <a
              href="https://www.mattinnovasolution.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <img src="/logomatt.png" alt="Logo" className="h-5 opacity-50 hover:opacity-100 transition-opacity" />
            </a>
            <span className="font-cuerpo text-slate-500 text-[10px] font-black tracking-[0.1em]">
              © 2025 MIS ACADEMY —{" "}
              <a
                href="https://www.mattinnovasolution.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition-colors"
              >
                MATT INNOVA SOLUTION.
              </a>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-600 font-black tracking-widest uppercase">
              Building the Digital Era
            </span>
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;