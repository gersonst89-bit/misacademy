import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  fecha_inicio?: string;
  fecha_fin?: string;
  horas?: number;
}

const Certificado: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [cert, setCert] = useState<Certificacion | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sigFailed, setSigFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Responsividad para el diploma usando escala
  const [scale, setScale] = useState(() => {
    if (typeof window !== "undefined") {
      const viewportWidth = window.innerWidth;
      const maxAvailableWidth = Math.min(viewportWidth - 32, 900) - 16;
      return Math.max(0.2, Math.min(1, maxAvailableWidth / 842));
    }
    return 1;
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const viewportWidth = window.innerWidth;
        const maxAvailableWidth = Math.min(viewportWidth - 32, 900) - 16;
        const newScale = Math.max(0.2, Math.min(1, maxAvailableWidth / 842));
        setScale(newScale);
      }
    };

    handleResize();
    // Segunda pasada para asegurar que el layout se ha asentado
    const timer = setTimeout(handleResize, 100);

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        if (codigo) {
          const certRes = await apiClient.get(`/certificaciones/buscar/${codigo}`).catch((err) => {
            setError("Certificado no encontrado o código inválido.");
            return null;
          });
          if (certRes && certRes.data) {
            setCert(certRes.data);
          }
        }
      } catch (err: any) {
        setError("Error al cargar los datos del certificado.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [codigo]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("certificate-container");
    if (!element) return;

    try {
      setDownloading(true);
      const canvas = await html2canvas(element, {
        scale: 3, // Alta resolución (3x) para texto e imágenes ultra nítidas
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false
      } as any);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [842, 595]
      });

      pdf.addImage(imgData, "PNG", 0, 0, 842, 595);
      pdf.save(`certificado-${cert?.codigo_certificado || codigo}.pdf`);
    } catch (err) {
      console.error("Error al generar el PDF del certificado:", err);
      // Respaldo clásico si algo falla
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Cargando...</div>;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-900 p-6 text-center gap-4">
        <h2 className="text-2xl font-bold text-rose-500">Error al visualizar</h2>
        <p className="text-slate-300 max-w-md">{error}</p>
        <a href="/" className="px-8 py-3 bg-slate-700 text-white font-bold rounded-full hover:bg-slate-800 transition-all mt-2">
          Volver al Inicio
        </a>
      </div>
    );
  }

  const courseName = cert?.curso?.nombre || "_________________";
  const courseFontSize = courseName.length > 50 ? "text-[15px]" : courseName.length > 35 ? "text-[18px]" : "text-[21px]";

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen print:p-0" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: landscape; margin: 0; }
        @media print {
          header, nav, footer, .no-print, button, a, .print-hidden { display: none !important; }
          
          html, body, #root, .App, main { 
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }
          
          .min-h-screen { 
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            height: 100vh !important;
            min-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important; 
            margin: 0 !important;
          }
          
          #certificate-scale-wrapper {
            position: relative !important;
            width: 842px !important;
            height: 595px !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #certificate-container { 
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            transform: none !important;
            width: 842px !important;
            height: 595px !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />
      <div className="w-full max-w-[900px] space-y-8 animate-in fade-in duration-700 print:space-y-0">
        <div className="text-center print:hidden">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">¡Certificado Listo!</h1>
          <p className="text-slate-300">Felicidades por este gran logro en tu carrera profesional.</p>
        </div>

        {/* CONTENEDOR DE ESCALA DE DIPLOMA */}
        <div 
          id="certificate-scale-wrapper"
          ref={containerRef} 
          className="relative mx-auto overflow-hidden max-w-full print:static print:overflow-visible print:h-auto print:w-auto" 
          style={{ 
            width: `${842 * scale}px`, 
            height: `${595 * scale}px` 
          }}
        >
          {/* DIPLOMA DINÁMICO */}
          <div 
            id="certificate-container" 
            className="absolute left-0 top-0 origin-top-left bg-white shadow-2xl overflow-hidden print:relative print:transform-none" 
            style={{ 
              width: "842px", 
              height: "595px",
              transform: `scale(${scale})`,
              zIndex: 10
            }}
          >
            
            {/* 1. Imagen de fondo */}
            <img src="/certificado.jpg" alt="Fondo" className="absolute inset-0 w-full h-full object-fill" style={{ zIndex: 1 }} />

            {/* Capas de Borrado Masivas */}
            <div style={{ position: 'absolute', top: '270px', left: '100px', width: '642px', height: '110px', backgroundColor: 'white', zIndex: 2 }}></div>
            <div style={{ position: 'absolute', top: '380px', left: '100px', width: '642px', height: '140px', backgroundColor: 'white', zIndex: 2 }}></div>

            {/* Capa de Borrado para Firma y Docente */}
            <div style={{ position: 'absolute', bottom: '40px', left: '221px', width: '400px', height: '100px', backgroundColor: 'white', zIndex: 2 }}></div>

            {/* 3. Capa de Texto Real (Sobre las capas de borrado) */}
            <div className="absolute inset-0 text-center" style={{ zIndex: 3 }}>
              
              {/* Nombre del Estudiante */}
              <div style={{ position: 'absolute', top: '280px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
                <h2 className="text-[42px] font-serif text-slate-700 font-bold" style={{ borderBottom: '2px solid #94a3b8', paddingBottom: '8px', display: 'inline-block', minWidth: '450px' }}>
                  {cert?.nombre_estudiante || 'Nombres y Apellidos'}
                </h2>
              </div>

              {/* Contenedor del Curso y Fecha */}
              <div className="absolute left-0 right-0 flex flex-col items-center justify-start text-slate-700" style={{ top: '350px', height: '110px', zIndex: 10 }}>
                {/* Texto Intermedio */}
                <p className="text-[14px] text-slate-500 font-serif" style={{ margin: 0 }}>
                  por haber completado exitosamente el Curso de
                </p>
                
                {/* Nombre del Curso */}
                <p className={`font-serif font-bold mt-0.5 mb-1 text-slate-800 ${courseFontSize}`} style={{ borderBottom: '1.5px solid #64748b', paddingBottom: '2px', display: 'inline-block', maxWidth: '680px' }}>
                  {courseName}
                </p>
                
                {/* Fechas de Realización y Carga Horaria */}
                <p className="text-[13px] text-slate-500 font-serif" style={{ margin: '2px 0 0 0' }}>
                  {cert?.fecha_inicio && cert?.fecha_fin ? (
                    <>
                      realizado del {new Date(cert.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} al {new Date(cert.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </>
                  ) : (
                    <>realizado satisfactoriamente</>
                  )}
                  {cert?.horas ? `  •  Carga Horaria: ${cert.horas} horas académicas` : ''}.
                </p>
              </div>

              {/* Columna Izquierda (Lugar y Fecha) */}
              <div style={{ position: 'absolute', bottom: '75px', left: '70px', width: '150px', textAlign: 'center', zIndex: 10 }}>
                <p className="text-[11px] font-serif text-slate-700 m-0 leading-none">
                  Lima, {cert?.fecha_emision ? new Date(cert.fecha_emision).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div style={{ borderTop: '1px solid #94a3b8', marginTop: '6px', width: '100%' }}></div>
                <p className="text-[9px] font-sans text-slate-400 mt-1 mb-0 uppercase tracking-wider">Fecha de Emisión</p>
              </div>

              {/* Firma y Docente (Centro) */}
              <div className="absolute bottom-[48px] left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ width: '220px', zIndex: 10 }}>
                {!sigFailed ? (
                  <img 
                    src="/firma.png" 
                    alt="Firma" 
                    className="h-[50px] object-contain mb-1" 
                    style={{ zIndex: 10, mixBlendMode: 'multiply' }}
                    onError={() => setSigFailed(true)}
                  />
                ) : (
                  <div id="firma-fallback" style={{ fontFamily: "'Great Vibes', 'Cedarville Cursive', 'Brush Script MT', cursive", fontSize: '34px', color: '#475569', transform: 'rotate(-5deg)', marginBottom: '-5px', zIndex: 10 }}>
                    Signature
                  </div>
                )}

                <div className="flex flex-col items-center" style={{ width: '100%' }}>
                  <p className="text-[14px] font-sans font-medium text-slate-700 mb-0.5">Docente Genérico</p>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '100%' }}></div>
                  <p className="text-[9px] font-sans text-slate-400 mt-1 mb-0 uppercase tracking-wider">Firma Autorizada</p>
                </div>
              </div>

              {/* Columna Derecha (Código de Verificación) */}
              <div style={{ position: 'absolute', bottom: '75px', right: '70px', width: '150px', textAlign: 'center', zIndex: 10 }}>
                <p className="text-[11px] font-mono font-bold text-slate-700 m-0 leading-none">
                  {cert?.codigo_certificado || 'CÓDIGO'}
                </p>
                <div style={{ borderTop: '1px solid #94a3b8', marginTop: '6px', width: '100%' }}></div>
                <p className="text-[9px] font-sans text-slate-400 mt-1 mb-0 uppercase tracking-wider">Código de Validez</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col items-center gap-4 pb-10 px-4 print:hidden">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md sm:max-w-none">
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all text-center cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {downloading ? "Generando PDF..." : "Descargar Certificado"}
            </button>
            <a href="/" className="w-full sm:w-auto px-8 py-3 bg-slate-700 text-white font-bold rounded-full hover:bg-slate-800 transition-all text-center">
              Volver al Inicio
            </a>
          </div>
          <p className="text-[11px] text-slate-400 text-center max-w-md mt-1 leading-normal">
            * El certificado se descargará directamente en formato PDF de alta resolución.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificado;
