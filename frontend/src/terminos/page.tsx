import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Terminos() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center text-sm mb-10 space-x-2">
          <Link
            to="/"
            className="text-sky-400 hover:text-sky-300 font-semibold transition-colors duration-300"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-sky-300 font-semibold">Términos y Condiciones</span>
        </nav>

        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">
          Términos y Condiciones
        </h1>

        <p className="text-lg text-gray-400 mb-12 text-center leading-relaxed">
          Bienvenido a <span className="text-sky-400 font-semibold">MIS ACADEMY</span>. 
          El uso de este sitio web implica la aceptación de los presentes. 
          Al navegar o utilizar nuestros servicios, el usuario declara haber leído, comprendido y aceptado en su totalidad las disposiciones aquí establecidas.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">1. Objetivo</h2>
          <p className="leading-relaxed text-gray-300">
            <span className="font-semibold">MIS ACADEMY</span> ofrece acceso a contenido educativo digital, 
            incluyendo cursos, guías, libros electrónicos y recursos especializados diseñados para el aprendizaje profesional. 
            Todo el material es entregado en formato digital y su acceso se realiza exclusivamente a través de la plataforma habilitada.
          </p>
        </section>


        <section className="mb-12">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">2. Medios de Pago</h2>
          <p className="leading-relaxed text-gray-300">
            Los pagos se procesan a través de plataformas seguras autorizadas. 
            Una vez completada la transacción, el usuario recibirá acceso inmediato al contenido adquirido. 
            MIS ACADEMY no almacena información financiera sensible.
          </p>
        </section>

    

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">3. Responsabilidad del Usuario</h2>
          <p className="leading-relaxed text-gray-300">
            El usuario se compromete a utilizar la plataforma de manera ética y legal. 
            Cualquier intento de fraude, acceso no autorizado o uso indebido de los contenidos 
            podrá derivar en la suspensión inmediata de la cuenta sin derecho a reembolso.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">4. Modificaciones</h2>
          <p className="leading-relaxed text-gray-300">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            Las actualizaciones serán publicadas en esta página y entrarán en vigor inmediatamente. 
            Es responsabilidad del usuario revisar periódicamente esta sección.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">5. Protección de Datos</h2>
          <p className="leading-relaxed text-gray-300">
            La información personal será tratada conforme a la{" "}
            <span className="font-semibold">Ley N.º 29733 - Ley de Protección de Datos Personales</span> 
            y a nuestra Política de Privacidad. No compartimos datos personales con terceros sin el consentimiento expreso del usuario.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">6. Contacto</h2>
          <p className="leading-relaxed text-gray-300">
            Para cualquier consulta relacionada con estos términos, contáctanos en{" "}
            <a
              href="mailto:info@misacademy.com"
              className="text-sky-400 hover:underline"
            >
              info@misacademy.com
            </a>.
          </p>
        </section>

     
      </div>
    </div>
  );
}
