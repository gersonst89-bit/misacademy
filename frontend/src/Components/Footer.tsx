import React, { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { apiUrl } from "../config/api";

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

interface ContactInfo {
  type: "email";
  value: string;
  icon: React.ReactNode;
}

const Footer: React.FC = () => {
  const [lineas, setLineas] = useState<LineaAcademica[]>([]);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const res = await fetch(
          apiUrl("/lineas")
        );
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
      icon: <FaFacebook className="w-6 h-6 text-white" />,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/mattinnovasolution/",
      icon: <FaInstagram className="w-6 h-6 text-white" />,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/mattinnovasolution/",
      icon: <FaLinkedin className="w-6 h-6 text-white" />,
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@mattinnovasolution",
      icon: <FaYoutube className="w-6 h-6 text-white" />,
    },
  ];

  const contactInfo: ContactInfo[] = [
    {
      type: "email",
      value: "info@misacademy.com",
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const policyLinks: FooterPag[] = [
    {
      name: "Libro de Reclamaciones",
      to: "/reclamaciones",
      image: "/libro.jpg",
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
    <footer className="bg-[#0E1C2B] text-white">
      <div className="px-8 pt-8 pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="text-center md:text-left lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-3">MIS ACADEMY</h3>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md mx-auto sm:mx-0">
              Plataforma educativa de MATT INNOVA SOLUTION, diseñada para
              personas que desean aprender y especializarse en áreas
              tecnológicas.
            </p>

            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-sky-400 mb-4">
              Líneas Académicas
            </h4>
            <ul className="space-y-3">
              {lineas.length === 0 ? (
                <li className="text-gray-400 text-sm">Cargando...</li>
              ) : (
                lineas.map((linea) => (
                  <li key={linea.id_linea}>
                    <a
                      href={`/lineas-academicas/${slugify(linea.nombre)}`}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {linea.nombre}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-sky-400 mb-4">
              Contacto
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((contact, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-white mt-1">
                    {contact.icon}
                  </div>
                  <div className="text-gray-400">
                    {contact.type === "email" && (
                      <a
                        href={`mailto:${contact.value}`}
                        className="hover:text-white transition-colors duration-300"
                      >
                        {contact.value}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-center items-center">
              {policyLinks.map((link) => (
                <a href={link.to} key={link.name}>
                  <img
                    src={link.image}
                    alt={link.name}
                    className="h-22 mt-5 mr-2 rounded-lg cursor-pointer"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-6">
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-gray-400 text-sm text-center sm:text-left">
              © 2025 MIS ACADEMY - MATT INNOVA SOLUTION. Todos los derechos
              reservados.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
