import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso, LineaAcademica, RutaAcademica } from '../entities';

// Usamos require porque node-nlp no tiene typings oficiales incluidos por defecto
const { NlpManager } = require('node-nlp');

@Injectable()
export class ChatbotService implements OnModuleInit {
  private manager: any;

  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(LineaAcademica)
    private readonly lineaRepo: Repository<LineaAcademica>,
    @InjectRepository(RutaAcademica)
    private readonly rutaRepo: Repository<RutaAcademica>,
  ) {
    // Configurar NlpManager para español. No necesita internet.
    this.manager = new NlpManager({ languages: ['es'], forceNER: true });
  }

  // Esto se ejecuta automáticamente cuando el servidor NestJS arranca
  async onModuleInit() {
    const fs = require('fs');
    const modelPath = 'model.nlp';

    if (fs.existsSync(modelPath)) {
      // Cargar modelo ya entrenado — mucho más rápido que re-entrenar
      console.log('📦 Cargando Chatbot desde model.nlp guardado...');
      await this.manager.load(modelPath);
      console.log('✅ Chatbot cargado desde modelo existente.');
    } else {
      // Primera vez: entrenar y guardar
      await this.trainBot();
    }
  }

  // Este es tu "Dataset" interno. Aquí le enseñas intenciones y respuestas.
  private async trainBot() {
    // 1. Saludos y Despedidas
    this.manager.addDocument('es', 'hola', 'saludo.hola');
    this.manager.addDocument('es', 'buenos dias', 'saludo.hola');
    this.manager.addDocument('es', 'buenas tardes', 'saludo.hola');
    this.manager.addDocument('es', 'que tal', 'saludo.hola');
    this.manager.addDocument('es', 'hey', 'saludo.hola');
    this.manager.addAnswer(
      'es',
      'saludo.hola',
      `🏛️ *ASISTENTE VIRTUAL - MIS ACADEMY* 🎓

Bienvenido/a. Por favor selecciona una opción enviando el número:

1️⃣ Menú Principal
2️⃣ Quiénes Somos
3️⃣ Líneas Académicas (Especialidades)
4️⃣ Catálogo de Cursos
5️⃣ Rutas de Aprendizaje
6️⃣ Precios, Ofertas y Formas de Pago
7️⃣ Certificados y Metodología`,
    );

    this.manager.addDocument('es', 'adios', 'saludo.despedida');
    this.manager.addDocument('es', 'chao', 'saludo.despedida');
    this.manager.addDocument('es', 'nos vemos', 'saludo.despedida');
    this.manager.addDocument('es', 'hasta luego', 'saludo.despedida');
    this.manager.addAnswer(
      'es',
      'saludo.despedida',
      '¡Hasta pronto! Recuerda que aquí estoy si necesitas más ayuda. ¡Éxitos en tu aprendizaje!',
    );

    // 2. Información de Cursos
    this.manager.addDocument('es', 'que cursos tienen', 'info.cursos');
    this.manager.addDocument('es', 'quiero ver los cursos', 'info.cursos');
    this.manager.addDocument(
      'es',
      'tienen cursos de programacion',
      'info.cursos',
    );
    this.manager.addDocument('es', 'que puedo aprender', 'info.cursos');
    this.manager.addDocument('es', 'cuales son los cursos', 'info.cursos');
    this.manager.addDocument('es', 'mencioname los cursos', 'info.cursos');
    this.manager.addDocument('es', 'lista los cursos', 'info.cursos');
    this.manager.addDocument('es', 'dime todos los cursos', 'info.cursos');
    this.manager.addDocument(
      'es',
      'muestrame los cursos disponibles',
      'info.cursos',
    );

    // 3. Información de Precios y Descuentos
    this.manager.addDocument('es', 'cuanto cuesta', 'info.precio');
    this.manager.addDocument('es', 'cual es el precio', 'info.precio');
    this.manager.addDocument('es', 'que valor tiene', 'info.precio');
    this.manager.addDocument('es', 'cuanto valen los cursos', 'info.precio');
    this.manager.addDocument('es', 'tienen descuentos', 'info.precio');
    this.manager.addDocument('es', 'cuanto cuesta la ruta', 'info.precio');
    this.manager.addDocument('es', 'precio de la ruta', 'info.precio');
    this.manager.addDocument('es', 'cuanto vale la ruta mis ia', 'info.precio');
    this.manager.addDocument(
      'es',
      'precio del curso de fundamentos',
      'info.precio',
    );

    // 4. Líneas académicas (solo área temática, sin precios)
    this.manager.addDocument('es', 'que especialidades tienen', 'info.lineas');
    this.manager.addDocument('es', 'tienen lineas academicas', 'info.lineas');
    this.manager.addDocument('es', 'cuales son las lineas', 'info.lineas');
    this.manager.addDocument(
      'es',
      'que areas de estudio tienen',
      'info.lineas',
    );
    this.manager.addDocument(
      'es',
      'cuales son sus especialidades',
      'info.lineas',
    );

    // 5a. Rutas académicas (programas con precio, duración, etc.)
    this.manager.addDocument('es', 'que rutas tienen', 'info.rutas');
    this.manager.addDocument('es', 'cuales son las rutas', 'info.rutas');
    this.manager.addDocument('es', 'dame las rutas disponibles', 'info.rutas');
    this.manager.addDocument('es', 'quiero ver las rutas', 'info.rutas');
    this.manager.addDocument(
      'es',
      'que rutas de aprendizaje tienen',
      'info.rutas',
    );
    this.manager.addDocument(
      'es',
      'que es mis teacher o mis dev',
      'info.rutas',
    );
    this.manager.addDocument('es', 'que ruta es la mas barata', 'info.rutas');
    this.manager.addDocument('es', 'que ruta es la mas cara', 'info.rutas');
    this.manager.addDocument('es', 'cual es la ruta mas cara', 'info.rutas');
    this.manager.addDocument(
      'es',
      'cual es la ruta mas economica',
      'info.rutas',
    );
    this.manager.addDocument('es', 'ruta academica', 'info.rutas');
    this.manager.addDocument('es', 'ruta de mayor precio', 'info.rutas');
    this.manager.addDocument('es', 'la ruta mas costosa', 'info.rutas');
    this.manager.addDocument('es', 'la ruta mas barata', 'info.rutas');
    this.manager.addDocument('es', 'cual ruta cuesta mas', 'info.rutas');
    this.manager.addDocument('es', 'que ruta tiene mayor precio', 'info.rutas');
    this.manager.addDocument('es', 'cuales son las rutas', 'info.rutas');
    this.manager.addDocument('es', 'mencioname las rutas', 'info.rutas');
    this.manager.addDocument('es', 'lista las rutas', 'info.rutas');
    this.manager.addDocument('es', 'muestrame las rutas', 'info.rutas');

    // 5. Certificados
    this.manager.addDocument('es', 'dan certificado', 'info.certificados');
    this.manager.addDocument(
      'es',
      'al terminar dan diploma',
      'info.certificados',
    );
    this.manager.addDocument(
      'es',
      'los cursos estan avalados',
      'info.certificados',
    );
    this.manager.addDocument('es', 'tiene certificacion', 'info.certificados');
    this.manager.addDocument(
      'es',
      'los cursos tienen certificado',
      'info.certificados',
    );
    this.manager.addDocument(
      'es',
      'dan certificado con los cursos',
      'info.certificados',
    );
    this.manager.addDocument(
      'es',
      'cursos con certificado',
      'info.certificados',
    );
    this.manager.addDocument(
      'es',
      'tienen algun certificado',
      'info.certificados',
    );
    this.manager.addAnswer(
      'es',
      'info.certificados',
      '¡Sí! Todos nuestros cursos y rutas incluyen un certificado digital de finalización que puedes agregar a tu LinkedIn y CV para impulsar tu carrera profesional.',
    );

    // 6. Metodología (En vivo o grabado)
    this.manager.addDocument(
      'es',
      'las clases son en vivo',
      'info.metodologia',
    );
    this.manager.addDocument('es', 'son clases grabadas', 'info.metodologia');
    this.manager.addDocument(
      'es',
      'como es la metodologia',
      'info.metodologia',
    );
    this.manager.addDocument('es', 'tengo un horario fijo', 'info.metodologia');
    this.manager.addDocument(
      'es',
      'cuanto duran los cursos',
      'info.metodologia',
    );
    this.manager.addAnswer(
      'es',
      'info.metodologia',
      'Nuestra plataforma es 100% online y a tu propio ritmo. Las lecciones están pregrabadas en alta calidad para que estudies cuando y donde quieras, sin horarios fijos.',
    );

    // 7. Métodos de Pago
    this.manager.addDocument('es', 'como puedo pagar', 'info.pagos');
    this.manager.addDocument('es', 'aceptan tarjeta', 'info.pagos');
    this.manager.addDocument('es', 'que metodos de pago tienen', 'info.pagos');
    this.manager.addDocument('es', 'se puede pagar con paypal', 'info.pagos');
    this.manager.addAnswer(
      'es',
      'info.pagos',
      'Aceptamos pagos mediante Yape, Plín y Transferencia Bancaria (BCP, BBVA, Interbank). Muy pronto habilitaremos también el pago directo con tarjeta de crédito y débito.',
    );

    // 8. Soporte Humano / Problemas
    this.manager.addDocument(
      'es',
      'quiero hablar con un humano',
      'ayuda.soporte',
    );
    this.manager.addDocument('es', 'tengo un problema', 'ayuda.soporte');
    this.manager.addDocument('es', 'necesito ayuda', 'ayuda.soporte');
    this.manager.addDocument('es', 'pasame con un asesor', 'ayuda.soporte');
    this.manager.addDocument('es', 'no me funciona la cuenta', 'ayuda.soporte');
    this.manager.addDocument('es', 'soporte tecnico', 'ayuda.soporte');
    this.manager.addDocument('es', 'necesito soporte', 'ayuda.soporte');
    this.manager.addDocument('es', 'ayudame', 'ayuda.soporte');
    this.manager.addDocument('es', 'tengo una queja', 'ayuda.soporte');
    this.manager.addAnswer(
      'es',
      'ayuda.soporte',
      'Si necesitas ayuda personalizada, puedes escribirnos directamente a nuestro correo oficial de soporte o al WhatsApp de la academia. ¡Un asesor humano te atenderá con gusto!',
    );

    // 8b. Información General de la Plataforma
    this.manager.addDocument(
      'es',
      'informacion sobre la plataforma',
      'info.plataforma',
    );
    this.manager.addDocument('es', 'que es mis academy', 'info.plataforma');
    this.manager.addDocument('es', 'cuentame sobre ustedes', 'info.plataforma');
    this.manager.addDocument('es', 'que hacen', 'info.plataforma');
    this.manager.addDocument(
      'es',
      'de que trata la plataforma',
      'info.plataforma',
    );
    this.manager.addDocument('es', 'a que se dedican', 'info.plataforma');
    this.manager.addDocument('es', 'quienes son', 'info.plataforma');
    this.manager.addDocument('es', 'informacion general', 'info.plataforma');
    this.manager.addAnswer(
      'es',
      'info.plataforma',
      'MIS ACADEMY es una plataforma educativa 100% online, especializada en cursos y rutas de aprendizaje en tecnología, inteligencia artificial, negocios y educación. Ofrecemos contenido creado por expertos, con certificados válidos y acceso ilimitado. Nuestras 4 líneas: MIS TEACHER, MIS IA, MIS BUSINESS y MIS DEV están diseñadas para llevarte de cero a experto. ¿Sobre qué te gustaría saber más?',
    );

    // 9. Personalidad / Identidad
    this.manager.addDocument('es', 'eres un robot', 'bot.identidad');
    this.manager.addDocument('es', 'eres humano', 'bot.identidad');
    this.manager.addDocument('es', 'quien eres', 'bot.identidad');
    this.manager.addDocument('es', 'quien te creo', 'bot.identidad');
    this.manager.addDocument('es', 'tienes nombre', 'bot.identidad');
    this.manager.addAnswer(
      'es',
      'bot.identidad',
      'Soy el asistente virtual inteligente de MIS ACADEMY, creado específicamente para ayudarte a resolver tus dudas sobre nuestra plataforma académica. 🤖🎓',
    );

    // 10. Recomendaciones
    this.manager.addDocument('es', 'que me recomiendas', 'info.recomendar');
    this.manager.addDocument('es', 'cual es mejor para mi', 'info.recomendar');
    this.manager.addDocument('es', 'que curso elijo', 'info.recomendar');
    this.manager.addDocument('es', 'que ruta elijo', 'info.recomendar');
    this.manager.addDocument('es', 'por donde empiezo', 'info.recomendar');
    this.manager.addDocument('es', 'que me conviene', 'info.recomendar');
    this.manager.addDocument('es', 'necesito orientacion', 'info.recomendar');
    this.manager.addDocument(
      'es',
      'por que debo elegir una ruta',
      'info.recomendar',
    );
    this.manager.addDocument(
      'es',
      'porque deberia matricularme',
      'info.recomendar',
    );
    this.manager.addAnswer(
      'es',
      'info.recomendar',
      'Para elegir la ruta ideal, todo depende de tu objetivo profesional. Si te gusta la tecnología y programación, te recomendamos MIS DEV. Si te apasiona la inteligencia artificial, MIS IA. Si estás en educación, MIS TEACHER es perfecta. Y si quieres emprender o escalar un negocio, MIS BUSINESS es tu camino. ¿Cuál de estos ámbitos te atrae más?',
    );

    // 11. Agradecimientos y Emociones
    this.manager.addDocument('es', 'gracias', 'emocion.gracias');
    this.manager.addDocument('es', 'muchas gracias', 'emocion.gracias');
    this.manager.addDocument('es', 'te lo agradezco', 'emocion.gracias');
    this.manager.addDocument('es', 'genial', 'emocion.gracias');
    this.manager.addDocument('es', 'perfecto', 'emocion.gracias');
    this.manager.addDocument('es', 'excelente', 'emocion.gracias');
    this.manager.addDocument('es', 'ok gracias', 'emocion.gracias');
    this.manager.addDocument('es', 'vale gracias', 'emocion.gracias');
    this.manager.addAnswer(
      'es',
      'emocion.gracias',
      '¡Con mucho gusto! Estoy aquí para ayudarte siempre que lo necesites. Si tienes más preguntas sobre cursos, rutas o precios, ¡no dudes en escribirme! 😊',
    );

    // 12. Proceso de Inscripción
    this.manager.addDocument('es', 'como me inscribo', 'info.inscripcion');
    this.manager.addDocument('es', 'como me matriculo', 'info.inscripcion');
    this.manager.addDocument('es', 'como compro un curso', 'info.inscripcion');
    this.manager.addDocument('es', 'como me registro', 'info.inscripcion');
    this.manager.addDocument('es', 'quiero inscribirme', 'info.inscripcion');
    this.manager.addDocument('es', 'quiero matricularme', 'info.inscripcion');
    this.manager.addDocument(
      'es',
      'como accedo a un curso',
      'info.inscripcion',
    );
    this.manager.addDocument('es', 'pasos para comprar', 'info.inscripcion');
    this.manager.addAnswer(
      'es',
      'info.inscripcion',
      'Matricularte es muy fácil:\n1️⃣ Crea tu cuenta o inicia sesión en nuestra plataforma.\n2️⃣ Explora los cursos o rutas disponibles.\n3️⃣ Agrega al carrito el curso que te interese.\n4️⃣ Realiza el pago de forma segura.\n5️⃣ ¡Listo! Ya puedes empezar a aprender. 🚀',
    );

    // 13. Información de Contacto
    this.manager.addDocument('es', 'cual es su email', 'info.contacto');
    this.manager.addDocument('es', 'tienen whatsapp', 'info.contacto');
    this.manager.addDocument('es', 'como los contacto', 'info.contacto');
    this.manager.addDocument('es', 'donde los encuentro', 'info.contacto');
    this.manager.addDocument('es', 'numero de telefono', 'info.contacto');
    this.manager.addDocument('es', 'correo electronico', 'info.contacto');
    this.manager.addDocument('es', 'redes sociales', 'info.contacto');
    this.manager.addDocument('es', 'tienen instagram', 'info.contacto');
    this.manager.addDocument('es', 'tienen facebook', 'info.contacto');
    this.manager.addAnswer(
      'es',
      'info.contacto',
      'Puedes contactarnos por los siguientes canales:\n📧 Email: contacto@misacademy.edu.pe\n📱 WhatsApp: +51 999 999 999\n🌐 Web: www.misacademy.edu.pe\n¡Estamos para servirte!',
    );

    // 14. Objeciones de Venta
    this.manager.addDocument('es', 'es muy caro', 'emocion.objecion');
    this.manager.addDocument('es', 'no me convence', 'emocion.objecion');
    this.manager.addDocument('es', 'no estoy seguro', 'emocion.objecion');
    this.manager.addDocument('es', 'lo voy a pensar', 'emocion.objecion');
    this.manager.addDocument('es', 'es mucho dinero', 'emocion.objecion');
    this.manager.addDocument('es', 'no tengo plata', 'emocion.objecion');
    this.manager.addDocument('es', 'no tengo dinero', 'emocion.objecion');
    this.manager.addDocument('es', 'es demasiado', 'emocion.objecion');
    this.manager.addAnswer(
      'es',
      'emocion.objecion',
      'Entendemos que es una decisión importante. Recuerda que invertir en educación es la mejor inversión que puedes hacer. Nuestros cursos incluyen certificado, soporte y acceso de por vida. Además, tenemos cursos desde S/ 99.00. ¿Te gustaría que te muestre las opciones más accesibles?',
    );

    // 15. Agradecimiento Negativo / Queja
    this.manager.addDocument('es', 'no me ayudaste', 'emocion.queja');
    this.manager.addDocument('es', 'no sirves', 'emocion.queja');
    this.manager.addDocument('es', 'eres inutil', 'emocion.queja');
    this.manager.addDocument('es', 'mala respuesta', 'emocion.queja');
    this.manager.addDocument('es', 'no entiendes nada', 'emocion.queja');
    this.manager.addAnswer(
      'es',
      'emocion.queja',
      'Lamento no haber podido ayudarte como esperabas. Estoy aprendiendo cada día para ser mejor. Si prefieres hablar con una persona real, puedes contactar a nuestro equipo de soporte. ¡Queremos asegurarnos de resolver tu duda! 🙏',
    );

    console.log('Entrenando Chatbot con dataset propio (offline)...');
    await this.manager.train();
    this.manager.save();
    console.log('¡Chatbot entrenado y listo con nueva inteligencia!');
  }

  async getReply(message: string): Promise<string> {
    try {
      const lowerMsg = message.toLowerCase().trim();
      let finalReply = '';

      const MENU_PRINCIPAL = `🏛️ *ASISTENTE VIRTUAL - MIS ACADEMY* 🎓

Bienvenido/a. Por favor selecciona una opción enviando el número:

1️⃣ Menú Principal
2️⃣ Quiénes Somos
3️⃣ Líneas Académicas (Especialidades)
4️⃣ Catálogo de Cursos
5️⃣ Rutas de Aprendizaje
6️⃣ Precios, Ofertas y Formas de Pago
7️⃣ Certificados y Metodología`;

      // ---- INTERCEPTOR: MENÚ NUMÉRICO ----
      if (lowerMsg === '1') {
        finalReply = MENU_PRINCIPAL;
      } else if (lowerMsg === '2') {
        finalReply = `🌟 *Sobre MIS ACADEMY*\n\nSomos una plataforma educativa 100% online especializada en tecnología, IA y negocios. Nuestra misión es democratizar el conocimiento de alta calidad para profesionales de toda Latinoamérica.\n\nContamos con 4 líneas principales: MIS TEACHER, MIS IA, MIS BUSINESS y MIS DEV. ¡Estamos aquí para impulsar tu carrera! 🚀`;
      } else if (lowerMsg === '3') {
        const lineas = await this.lineaRepo.find();
        const lineList = lineas.map((l) => `🔹 *${l.nombre}*`).join('\n');
        finalReply = `Contamos con las siguientes líneas académicas:\n\n${lineList}\n\nCada línea tiene rutas de aprendizaje especializadas.`;
      } else if (lowerMsg === '4') {
        const courses = await this.cursoRepo.find({
          where: { estado: 'Publicado' },
        });
        const courseList = courses
          .slice(0, 8)
          .map((c) => `📚 *${c.nombre}*`)
          .join('\n');
        const sufijo =
          courses.length > 8
            ? `\n\n_...y ${courses.length - 8} cursos más en nuestra web._`
            : '';
        finalReply = `Aquí tienes algunos de nuestros cursos disponibles:\n\n${courseList}${sufijo}\n\n¡Te invitamos a explorarlos!`;
      } else if (lowerMsg === '5') {
        const rutas = await this.rutaRepo.find();
        const rutaList = rutas
          .map((r) => {
            const precio = r.precio ? ` — *S/ ${r.precio}*` : '';
            return `📍 *${r.nombre}*${precio}`;
          })
          .join('\n');
        finalReply = `Nuestras rutas de aprendizaje disponibles son:\n\n${rutaList}\n\n¿Por cuál te gustaría empezar?`;
      } else if (lowerMsg === '6') {
        const courses = await this.cursoRepo.find({
          where: { estado: 'Publicado' },
        });
        const cheapest = [...courses].sort(
          (a, b) => Number(a.precio || 0) - Number(b.precio || 0),
        )[0];
        finalReply = `💰 *Precios y Pagos*\n\n• *Precios:* Tenemos cursos desde S/ ${cheapest?.precio || '99.00'} y rutas especializadas con precios competitivos.\n• *Métodos de Pago:* Aceptamos *Yape, Plín* y *Transferencia Bancaria* (BCP, BBVA, Interbank).\n• *Tarjetas:* Próximamente habilitaremos pagos directos con tarjeta de crédito y débito. 🔒`;
      } else if (lowerMsg === '7') {
        finalReply = `🎓 *Certificación y Metodología*\n\n• *Certificados:* Todos los cursos incluyen certificado digital de finalización válido para tu CV.\n• *Metodología:* Estudias a tu propio ritmo. Las lecciones están grabadas en alta definición y disponibles 24/7 para que aprendas cuando quieras. 📝`;
      } else {
        // ---- INTERCEPTORES DE TEXTO LIBRE ----

        // Cursos Gratis
        const esGratis =
          lowerMsg.includes('gratis') ||
          lowerMsg.includes('gratuito') ||
          lowerMsg.includes('free');
        if (esGratis) {
          const courses = await this.cursoRepo.find({
            where: { estado: 'Publicado' },
          });
          const cheapest = [...courses].sort(
            (a, b) => Number(a.precio || 0) - Number(b.precio || 0),
          )[0];
          finalReply = `Actualmente todos nuestros cursos tienen un costo. El más accesible es *${cheapest?.nombre}* desde **S/ ${cheapest?.precio}**. ¡Vale totalmente la inversión!`;
        } else {
          // Procesar con NLP
          const response = await this.manager.process('es', message);
          if (response.intent !== 'None' && response.score > 0.6) {
            // Mapear intenciones a respuestas dinámicas formateadas
            if (response.intent === 'info.cursos') {
              const courses = await this.cursoRepo.find({
                where: { estado: 'Publicado' },
              });
              const courseList = courses
                .slice(0, 8)
                .map((c) => `📚 *${c.nombre}*`)
                .join('\n');
              finalReply = `¡Claro! Aquí tienes algunos cursos:\n\n${courseList}`;
            } else if (response.intent === 'info.rutas') {
              const rutas = await this.rutaRepo.find();
              const rutaList = rutas.map((r) => `📍 *${r.nombre}*`).join('\n');
              finalReply = `Estas son nuestras rutas:\n\n${rutaList}`;
            } else {
              finalReply = response.answer;
            }
          } else {
            finalReply = `No logré entender tu pregunta, pero puedo ayudarte con cursos, rutas, precios o inscripciones. 😊`;
          }
        }
      }

      // --- LA MAGIA GLOBAL: Añadir el prompt de retorno a TODO ---
      if (finalReply !== MENU_PRINCIPAL) {
        return `${finalReply}\n\nPresiona *1* para volver al menú principal.`;
      }
      return finalReply;
    } catch (error) {
      console.error('Error procesando mensaje NLP:', error);
      return 'Tuve un problema técnico procesando tu mensaje. Por favor, intenta de nuevo.';
    }
  }
}
