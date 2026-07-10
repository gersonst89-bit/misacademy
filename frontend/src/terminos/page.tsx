import { Link } from "react-router-dom";
import { ChevronRight, ScrollText, Mail } from "lucide-react";

export default function Terminos() {
  return (
    <div className="min-h-screen bg-[#03070c] text-gray-300 px-6 md:px-20 py-16 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <nav className="flex items-center text-sm mb-10 space-x-2 no-print">
          <Link
            to="/"
            className="text-sky-400 hover:text-sky-300 font-semibold transition-colors duration-300"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-sky-300 font-semibold">Términos y Condiciones</span>
        </nav>

        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6 shadow-lg shadow-sky-500/5">
            <ScrollText size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight font-['Outfit']">
            Términos y <span className="text-transparent" style={{ WebkitTextStroke: '1px #38bdf8' }}>Condiciones</span>
          </h1>
          <div className="h-1 w-20 bg-sky-500 rounded-full mx-auto mb-8" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Bienvenido a <span className="text-sky-400 font-bold">MIS ACADEMY</span>. 
            El uso de este sitio web implica la aceptación de los presentes términos. 
            Al navegar o utilizar nuestros servicios, declaras haber leído, comprendido y aceptado en su totalidad las disposiciones aquí establecidas.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-2xl space-y-10">
          
          <section className="relative group p-6 rounded-2xl bg-white/[0.01] border border-white/[0.02] hover:border-sky-500/20 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-black">
                01
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Objetivo</h2>
            </div>
            <p className="leading-relaxed text-gray-400">
              <span className="font-semibold text-gray-300">MIS ACADEMY</span> ofrece acceso a contenido educativo digital, 
              incluyendo cursos, guías, libros electrónicos y recursos especializados diseñados para el aprendizaje profesional. 
              Todo el material es entregado en formato digital y su acceso se realiza exclusivamente a través de la plataforma habilitada.
            </p>
          </section>

          <section className="relative group p-6 rounded-2xl bg-white/[0.01] border border-white/[0.02] hover:border-sky-500/20 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-black">
                02
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Medios de Pago</h2>
            </div>
            <p className="leading-relaxed text-gray-400">
              Los pagos se procesan a través de plataformas seguras autorizadas. 
              Una vez completada la transacción, el usuario recibirá acceso inmediato al contenido adquirido. 
              <span className="font-semibold text-gray-300">MIS ACADEMY</span> no almacena información financiera sensible.
            </p>
          </section>

          <section className="relative group p-6 rounded-2xl bg-white/[0.01] border border-white/[0.02] hover:border-sky-500/20 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-black">
                03
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Responsabilidad del Usuario</h2>
            </div>
            <p className="leading-relaxed text-gray-400">
              El usuario se compromete a utilizar la plataforma de manera ética y legal. 
              Cualquier intento de fraude, acceso no autorizado o uso indebido de los contenidos 
              podrá derivar en la suspensión inmediata de la cuenta sin derecho a reembolso.
            </p>
          </section>

          <section className="relative group p-6 rounded-2xl bg-white/[0.01] border border-white/[0.02] hover:border-sky-500/20 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-black">
                04
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Modificaciones</h2>
            </div>
            <p className="leading-relaxed text-gray-400">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Las actualizaciones serán publicadas en esta página y entrarán en vigor inmediatamente. 
              Es responsabilidad del usuario revisar periódicamente esta sección.
            </p>
          </section>

          <section className="relative group p-6 rounded-2xl bg-white/[0.01] border border-white/[0.02] hover:border-sky-500/20 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-black">
                05
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Protección de Datos</h2>
            </div>
            <p className="leading-relaxed text-gray-400">
              La información personal será tratada conforme a la{" "}
              <span className="font-semibold text-gray-300">Ley N.º 29733 - Ley de Protección de Datos Personales</span> 
              y a nuestra Política de Privacidad. No compartimos datos personales con terceros sin el consentimiento expreso del usuario.
            </p>
          </section>

          <section className="relative group p-6 rounded-2xl bg-white/[0.01] border border-white/[0.02] hover:border-sky-500/20 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Mail size={18} />
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Contacto</h2>
            </div>
            <p className="leading-relaxed text-gray-400">
              Para cualquier consulta relacionada con estos términos, contáctanos en{" "}
              <a
                href="mailto:info@misacademy.com"
                className="text-sky-400 hover:text-sky-300 font-bold transition-colors"
              >
                info@misacademy.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
