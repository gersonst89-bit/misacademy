import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../config/api";

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Certificacion {
  id_certificacion: number;
  nombre_estudiante: string;
  id_curso: number;
  codigo_certificado: string;
  fecha_emision: string;
  curso?: {
    nombre: string;
  };
}

const Certificado: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cert, setCert] = useState<Certificacion | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        // Obtener perfil (opcional, para fallback de nombre)
        const profileRes = await fetch(`${API_URL}/auth/profile`, { headers: { Accept: "application/json" } });
        const userData = await profileRes.json();
        setUsuario(userData);

        // Buscar el certificado específico por su código
        if (codigo) {
          const certRes = await fetch(`${API_URL}/certificaciones/buscar/${codigo}`, { headers: { Accept: "application/json" } });
          if (certRes.ok) {
            const certData = await certRes.json();
            setCert(certData);
          } else {
            setError("Certificado no encontrado.");
          }
        }
      } catch (err: any) {
        setError("Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [codigo]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Cargando...</div>;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen print:p-0" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: landscape; margin: 0; }
        @media print {
          nav, footer, .no-print, button, a, h1, p { display: none !important; }
          body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
          .min-h-screen { min-height: 0 !important; padding: 0 !important; }
          #certificate-container { 
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) scale(1.2) !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
        }
      `}} />
      <div className="w-full max-w-[900px] space-y-8 animate-in fade-in duration-700 print:space-y-0">
        <div className="text-center print:hidden">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">¡Certificado Listo!</h1>
          <p className="text-slate-300">Felicidades por este gran logro en tu carrera profesional.</p>
        </div>

        {/* DIPLOMA DINÁMICO */}
        <div id="certificate-container" className="relative mx-auto bg-white shadow-2xl overflow-hidden" style={{ width: "842px", height: "595px" }}>
          
          {/* 1. Imagen de fondo */}
          <img src="/certificado.jpg" alt="Fondo" className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 1 }} />

          {/* Capas de Borrado Masivas */}
          <div style={{ position: 'absolute', top: '270px', left: '100px', width: '642px', height: '110px', backgroundColor: 'white', zIndex: 2 }}></div>
          <div style={{ position: 'absolute', top: '380px', left: '100px', width: '642px', height: '140px', backgroundColor: 'white', zIndex: 2 }}></div>

          {/* Firma */}
          <div style={{ position: 'absolute', bottom: '115px', left: '346px', width: '150px', height: '20px', backgroundColor: 'white', zIndex: 2 }}></div>

          {/* Tapa Fecha y Código */}
          <div style={{ position: 'absolute', bottom: '70px', left: '70px', width: '150px', height: '40px', backgroundColor: 'white', zIndex: 2 }}></div>
          <div style={{ position: 'absolute', bottom: '70px', right: '70px', width: '150px', height: '40px', backgroundColor: 'white', zIndex: 2 }}></div>

          {/* 3. Capa de Texto Real (Sobre las capas de borrado) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12" style={{ zIndex: 3 }}>
            
            {/* Nombre del Estudiante */}
            <div style={{ marginTop: '55px' }}>
              <h2 className="text-5xl font-serif text-slate-800 italic" style={{ borderBottom: '2px solid #cbd5e1', paddingBottom: '5px', display: 'inline-block', minWidth: '400px' }}>
                {cert?.nombre_estudiante || `${usuario?.nombre} ${usuario?.apellido}`}
              </h2>
            </div>

            {/* Texto Intermedio */}
            <p className="mt-12 text-lg text-slate-600 font-sans tracking-wide">
              Por haber completado exitosamente el curso de
            </p>

            {/* Nombre del Curso */}
            <div className="mt-2">
              <h3 className="text-3xl font-bold text-blue-900 font-sans uppercase tracking-tighter max-w-xl mx-auto">
                {cert?.curso?.nombre || "Backend con NestJS y TypeORM"}
              </h3>
            </div>

            {/* Datos de Validación */}
            <div className="absolute bottom-[75px] left-20 text-left font-sans text-[10px] text-slate-500 uppercase tracking-widest">
              <p className="font-bold text-slate-400">FECHA DE EMISIÓN</p>
              <p className="text-slate-700">{cert?.fecha_emision ? new Date(cert.fecha_emision).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString()}</p>
            </div>

            <div className="absolute bottom-[75px] right-20 text-right font-sans text-[10px] text-slate-500 uppercase tracking-widest">
              <p className="font-bold text-slate-400">CÓDIGO DE VERIFICACIÓN</p>
              <p className="font-mono text-slate-700">{cert?.codigo_certificado || "CERT-XXXXXX"}</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-center gap-4 pb-10">
          <button onClick={() => window.print()} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all">
            Descargar Certificado
          </button>
          <a href="/" className="px-8 py-3 bg-slate-700 text-white font-bold rounded-full hover:bg-slate-800 transition-all">
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Certificado;
