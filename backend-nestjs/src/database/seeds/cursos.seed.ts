import { DataSource } from 'typeorm';
import { Curso } from '../../entities/curso.entity';
import { Usuario } from '../../entities/usuario.entity';
import * as bcrypt from 'bcryptjs';
import { seedMockContent } from './mock-content.seed';

export async function seedCursos(dataSource: DataSource): Promise<void> {
  const cursoRepo = dataSource.getRepository(Curso);
  const usuarioRepo = dataSource.getRepository(Usuario);

  // 0. Ensure we have an Admin
  let admin = await usuarioRepo.findOne({
    where: { email: 'admin@misacademy.com' },
  });
  if (!admin) {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword && process.env.APP_ENV === 'production') {
      throw new Error('SEED_ADMIN_PASSWORD env variable is required in production');
    }
    const hashedAdminPassword = await bcrypt.hash(adminPassword || 'admin123', 10);
    admin = usuarioRepo.create({
      id_rol: 1, // Administrador
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@misacademy.com',
      password: hashedAdminPassword,
      estado: 'Activo',
      email_verificado: true,
      fecha_registro: new Date(),
    });
    await usuarioRepo.save(admin);
    console.log(`  ✅ Usuario Administrador creado`);
  } else {
    admin.email_verificado = true;
    await usuarioRepo.save(admin);
  }

  // 1. Ensure we have a Docente
  let docente = await usuarioRepo.findOne({
    where: { email: 'docente@misacademy.com' },
  });
  const docPassword = process.env.SEED_DOCENTE_PASSWORD;
  if (!docPassword && process.env.APP_ENV === 'production') {
    throw new Error('SEED_DOCENTE_PASSWORD env variable is required in production');
  }
  const hashedPassword = await bcrypt.hash(docPassword || 'password123', 10);
  if (!docente) {
    docente = usuarioRepo.create({
      id_rol: 2, // Docente
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'docente@misacademy.com',
      password: hashedPassword,
      estado: 'Activo',
      email_verificado: true,
      fecha_registro: new Date(),
    });
    await usuarioRepo.save(docente);
    console.log(`  ✅ Usuario Docente creado`);
  } else {
    // Asegurar que esté verificado si ya existe
    docente.email_verificado = true;
    await usuarioRepo.save(docente);
  }

  // 2. Create courses
  const cursos = [
    // --- MIS TEACHER ---
    {
      id_docente: docente.id_usuario,
      nombre: 'Fundamentos de IA para el Aula',
      slug: 'fundamentos-de-ia-para-el-aula',
      descripcion:
        'Este curso introduce a los docentes en el ecosistema de la Inteligencia Artificial, rompiendo mitos y enseñando el uso ético de estas tecnologías en el entorno escolar.',
      descripcion_corta: 'Inicia tu camino en la educación del futuro con IA.',
      descripcion_larga:
        'Aprenderás la historia de la IA, tipos de modelos (texto, imagen, audio), ética y privacidad de datos de menores, y cómo configurar tu primer entorno de trabajo con herramientas gratuitas para el aula.',
      nivel: 'Principiante',
      precio: 69.0,
      duracion_horas: 15,
      imagen:
        'https://images.pexels.com/photos/6325984/pexels-photo-6325984.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Generación de Material Didáctico con IA',
      slug: 'generacion-de-material-didactico-con-ia',
      descripcion:
        'Un taller práctico enfocado en la productividad docente para diseñar diapositivas, infografías, resúmenes y guías interactivas utilizando motores de IA.',
      descripcion_corta:
        'Crea recursos educativos de alta calidad en tiempo récord.',
      descripcion_larga:
        'Dominio de herramientas como Canva Magic, Gamma App, y ChatGPT para la creación de sesiones de aprendizaje, rúbricas dinámicas y contenido multimedia personalizado.',
      nivel: 'Intermedio',
      precio: 89.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Evaluación Automatizada y Chatbots Educativos',
      slug: 'evaluacion-automatizada-y-chatbots-educativos',
      descripcion:
        'Aprende a diseñar sistemas que califiquen automáticamente y creen tutores virtuales que acompañen a tus alumnos fuera del horario de clase.',
      descripcion_corta:
        'Automatiza el feedback y personaliza el aprendizaje 24/7.',
      descripcion_larga:
        'Creación de GPTs personalizados para tutoría, uso de herramientas como QuestionWell para exámenes inteligentes, y análisis de datos de aprendizaje.',
      nivel: 'Avanzado',
      precio: 99.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/8363771/pexels-photo-8363771.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Liderazgo Docente y Comunicación Efectiva',
      slug: 'liderazgo-docente-y-comunicacion-efectiva',
      descripcion:
        'Desarrolla habilidades blandas críticas para gestionar grupos humanos, manejar expectativas de los padres y liderar con empatía.',
      descripcion_corta:
        'Fortalece tu liderazgo y mejora la relación con padres y alumnos.',
      descripcion_larga:
        'Técnicas de comunicación asertiva, gestión de reuniones con padres, liderazgo situacional en el salón y herramientas de organización personal para docentes.',
      nivel: 'Principiante',
      precio: 69.0,
      duracion_horas: 15,
      imagen:
        'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Neuroeducación y Clima Escolar',
      slug: 'neuroeducacion-y-clima-escolar',
      descripcion:
        'Descubre las bases neurocientíficas del aprendizaje para crear un ambiente escolar seguro, motivador y libre de estrés.',
      descripcion_corta:
        'Entiende cómo aprende el cerebro para mejorar la convivencia.',
      descripcion_larga:
        'Plasticidad cerebral, gestión de las emociones en el aprendizaje, diseño de espacios de aula cerebro-compatibles y estrategias de motivación intrínseca.',
      nivel: 'Intermedio',
      precio: 79.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Disciplina Positiva y Resolución de Conflictos',
      slug: 'disciplina-positiva-y-resolucion-de-conflictos',
      descripcion:
        'Implementa un modelo de convivencia basado en el respeto mutuo, la firmeza y la amabilidad para solucionar problemas de conducta.',
      descripcion_corta:
        'Gestiona conflictos en el aula sin castigos ni premios.',
      descripcion_larga:
        'Herramientas de disciplina positiva, mediación entre pares, manejo de conductas disruptivas y creación de acuerdos de convivencia democráticos.',
      nivel: 'Avanzado',
      precio: 89.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Planificación Curricular por Competencias',
      slug: 'planificacion-curricular-por-competencias',
      descripcion:
        'Domina la estructura de una planificación efectiva enfocada en lo que el estudiante debe "saber hacer".',
      descripcion_corta:
        'Diseña sesiones de aprendizaje alineadas al Currículo Nacional.',
      descripcion_larga:
        'Análisis de estándares de aprendizaje, redacción de propósitos de aprendizaje, secuencia didáctica y alineación entre competencia, capacidad y desempeño.',
      nivel: 'Principiante',
      precio: 89.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Metodologías Activas: Gamificación y ABP',
      slug: 'metodologias-activas-gamificacion-y-abp',
      descripcion:
        'Aprende a implementar el Aprendizaje Basado en Proyectos (ABP) y dinámicas de juego para aumentar el compromiso del alumno.',
      descripcion_corta:
        'Haz que tus alumnos sean los protagonistas de su aprendizaje.',
      descripcion_larga:
        'Diseño de misiones y niveles, uso de mecánicas de juego en clase, fases del ABP, y evaluación de proyectos interdisciplinarios.',
      nivel: 'Intermedio',
      precio: 99.0,
      duracion_horas: 30,
      imagen:
        'https://images.pexels.com/photos/4443160/pexels-photo-4443160.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Evaluación Formativa y Diseño de Rúbricas',
      slug: 'evaluacion-formativa-y-diseno-de-rubricas',
      descripcion:
        'Profundiza en el enfoque de evaluación formativa, aprendiendo a dar feedback retroalimentador que ayude al alumno a progresar.',
      descripcion_corta: 'Evalúa para aprender, no solo para calificar.',
      descripcion_larga:
        'Diseño de rúbricas analíticas y holísticas, autoevaluación y coevaluación, uso de listas de cotejo y herramientas digitales para la evaluación en tiempo real.',
      nivel: 'Avanzado',
      precio: 89.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/5940841/pexels-photo-5940841.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },

    // --- MIS BUSINESS ---
    {
      id_docente: docente.id_usuario,
      nombre: 'Ideación y Modelo de Negocio Canvas',
      slug: 'ideacion-y-modelo-de-negocio-canvas',
      descripcion:
        'Un curso fundamental para estructurar ideas de negocio bajo la metodología Business Model Canvas, asegurando que cada propuesta tenga un valor real para el mercado.',
      descripcion_corta: 'Transforma tu idea en un modelo de negocio rentable.',
      descripcion_larga:
        'Definición de propuesta de valor, segmentación de clientes, canales de distribución, fuentes de ingresos, estructura de costos y análisis de la competencia en etapas tempranas.',
      nivel: 'Principiante',
      precio: 79.0,
      duracion_horas: 15,
      imagen:
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Validación con MVP y Lean Startup',
      slug: 'validacion-con-mvp-y-lean-startup',
      descripcion:
        'Aprende a construir Productos Mínimos Viables (MVP) para probar tus hipótesis con clientes reales antes de hacer grandes inversiones de tiempo y dinero.',
      descripcion_corta:
        'Lanza tu producto al mercado sin gastar miles de soles.',
      descripcion_larga:
        'Ciclo Construir-Medir-Aprender, diseño de MVPs de baja fidelidad, métricas de validación, experimentación con usuarios reales y toma de decisiones basada en datos.',
      nivel: 'Intermedio',
      precio: 99.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Pitch y Levantamiento de Capital',
      slug: 'pitch-y-levantamiento-de-capital',
      descripcion:
        'Domina el arte de presentar tu negocio ante posibles socios o inversionistas, conociendo los vehículos de inversión que existen hoy en día.',
      descripcion_corta:
        'Convence a inversores y escala tu startup al siguiente nivel.',
      descripcion_larga:
        'Diseño de un Pitch Deck profesional, técnicas de oratoria persuasiva, Venture Capital vs. Ángeles Inversionistas, y términos legales básicos para el financiamiento.',
      nivel: 'Avanzado',
      precio: 89.0,
      duracion_horas: 15,
      imagen:
        'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Estrategia de Contenidos y Redes Sociales',
      slug: 'estrategia-de-contenidos-y-redes-sociales',
      descripcion:
        'Aprende a gestionar comunidades digitales y crear contenido que genere impacto y engagement en las principales plataformas sociales.',
      descripcion_corta:
        'Posiciona tu marca y conecta con tu audiencia digital.',
      descripcion_larga:
        'Planificación de contenidos, storytelling para marcas, algoritmos de RRSS (TikTok/Instagram), gestión de crisis en redes y herramientas de diseño para no diseñadores.',
      nivel: 'Principiante',
      precio: 89.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Performance: Facebook y Google Ads',
      slug: 'performance-facebook-y-google-ads',
      descripcion:
        'Domina las plataformas de pauta publicitaria más grandes del mundo para atraer tráfico cualificado y convertir leads en clientes finales.',
      descripcion_corta: 'Maximiza tus ventas con publicidad pagada efectiva.',
      descripcion_larga:
        'Configuración de Business Manager, segmentación avanzada, diseño de anuncios de alto impacto, optimización de presupuesto y análisis de ROAS (Retorno de Inversión).',
      nivel: 'Intermedio',
      precio: 109.0,
      duracion_horas: 30,
      imagen:
        'https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Growth Hacking: Estrategias de Escalado',
      slug: 'growth-hacking-estrategias-de-escalado',
      descripcion:
        'Implementa metodologías de crecimiento acelerado basadas en la experimentación rápida y el análisis de datos en cada etapa del embudo.',
      descripcion_corta:
        'Hackea el crecimiento de tu negocio con experimentos creativos.',
      descripcion_larga:
        'El embudo pirata (AARRR), experimentos de viralidad, optimización de la tasa de conversión (CRO), retención de usuarios y herramientas de automatización de marketing.',
      nivel: 'Avanzado',
      precio: 119.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Finanzas para No Financieros',
      slug: 'finanzas-para-no-financieros',
      descripcion:
        'Un curso práctico para entender la salud financiera de tu empresa sin necesidad de ser un experto contable.',
      descripcion_corta:
        'Toma el control de los números de tu negocio con confianza.',
      descripcion_larga:
        'Lectura de estados financieros (Balance y P&L), flujo de caja (Cash Flow), punto de equilibrio, gestión de presupuestos y fijación de precios rentable.',
      nivel: 'Principiante',
      precio: 89.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/53621/pexels-photo-53621.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Gestión de Operaciones y Procesos',
      slug: 'gestion-de-operaciones-y-procesos',
      descripcion:
        'Diseña y mejora la forma en que tu empresa entrega valor, eliminando cuellos de botella y desperdicios operativos.',
      descripcion_corta:
        'Optimiza tus procesos para ser más eficiente y escalable.',
      descripcion_larga:
        'Mapeo de procesos, metodologías Lean, gestión de inventarios y logística, control de calidad y herramientas de gestión de proyectos.',
      nivel: 'Intermedio',
      precio: 89.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'KPIs y Cuadro de Mando Integral',
      slug: 'kpis-y-cuadro-de-mando-integral',
      descripcion:
        'Aprende a definir indicadores clave de desempeño (KPIs) y construir tableros de control para monitorear tu negocio en tiempo real.',
      descripcion_corta:
        'Mide lo que realmente importa para alcanzar tus objetivos.',
      descripcion_larga:
        'Definición de objetivos OKR y SMART, diseño de Dashboards con herramientas sencillas, interpretación de métricas de negocio y toma de decisiones estratégicas.',
      nivel: 'Avanzado',
      precio: 89.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },

    // --- MIS IA ---
    {
      id_docente: docente.id_usuario,
      nombre: 'Prompt Engineering para Profesionales',
      slug: 'prompt-engineering-para-profesionales',
      descripcion:
        'Aprende las técnicas avanzadas de comunicación con modelos de lenguaje (LLM) para obtener resultados precisos, creativos y técnicos de primer nivel.',
      descripcion_corta:
        'Domina el arte de hablar con la Inteligencia Artificial.',
      descripcion_larga:
        'Estructura de prompts, técnicas Zero-shot y Few-shot, cadenas de pensamiento (Chain of Thought), y cómo evitar alucinaciones en modelos como ChatGPT, Claude y Gemini.',
      nivel: 'Principiante',
      precio: 89.0,
      duracion_horas: 15,
      imagen:
        'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'IA para Generación de Imágenes y Video',
      slug: 'ia-para-generacion-de-imagenes-y-video',
      descripcion:
        'Explora las herramientas líderes en generación visual para crear campañas de marketing, prototipos de diseño y piezas cinematográficas sin cámaras.',
      descripcion_corta: 'Crea contenido visual hiperrealista con IA.',
      descripcion_larga:
        'Dominio avanzado de Midjourney, Stable Diffusion para control total, Runway Gen-2 para video, y herramientas de edición asistida por IA para retoques.',
      nivel: 'Intermedio',
      precio: 99.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Automatización de Tareas con Agentes de IA',
      slug: 'automatizacion-de-tareas-with-agentes-de-ia',
      descripcion:
        'Descubre cómo configurar "empleados virtuales" que ejecuten tareas complejas en serie sin intervención humana constante.',
      descripcion_corta: 'Pon a trabajar a la IA por ti con agentes autónomos.',
      descripcion_larga:
        'Uso de AutoGPT, configuración de agentes autónomos en la nube, automatización de investigación de mercado y creación de flujos de trabajo inteligentes.',
      nivel: 'Avanzado',
      precio: 119.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Introducción a la Automatización No-Code',
      slug: 'introduccion-a-la-automatizacion-no-code',
      descripcion:
        'Aprende a conectar tus herramientas favoritas (Gmail, Drive, Slack) para que trabajen solas y ahorres horas de trabajo manual cada semana.',
      descripcion_corta: 'Automatiza tus primeras tareas sin escribir código.',
      descripcion_larga:
        'Conceptos básicos de API, Webhooks, triggers y acciones. Diseño de flujos de trabajo lineales y mentalidad de eficiencia de procesos.',
      nivel: 'Principiante',
      precio: 89.0,
      duracion_horas: 15,
      imagen:
        'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Flujos de Trabajo Inteligentes con Zapier y Make',
      slug: 'flujos-de-trabajo-inteligentes-con-zapier-y-make',
      descripcion:
        'Domina las plataformas líderes de automatización para construir flujos que incluyan lógica condicional y procesamiento de datos mediante IA.',
      descripcion_corta: 'Crea sistemas de trabajo complejos y potentes.',
      descripcion_larga:
        'Lógica condicional avanzada, iteraciones sobre listas de datos, manejo de JSON, y conexión de aplicaciones empresariales críticas para el negocio.',
      nivel: 'Intermedio',
      precio: 109.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Integración de APIs de IA en Procesos de Negocio',
      slug: 'integracion-de-apis-de-ia-en-procesos-de-negocio',
      descripcion:
        'Aprende a integrar los modelos de OpenAI y otros proveedores en tus sistemas actuales para procesar información a gran escala de forma automática.',
      descripcion_corta:
        'Escala tu empresa integrando IA directamente en tus flujos.',
      descripcion_larga:
        'Consumo técnico de APIs de OpenAI (Vision, Whisper, GPT), procesamiento masivo de información, creación de pipelines de contenido y auditoría de flujos automatizados.',
      nivel: 'Avanzado',
      precio: 129.0,
      duracion_horas: 30,
      imagen:
        'https://images.pexels.com/photos/5466231/pexels-photo-5466231.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Python para Ciencia de Datos',
      slug: 'python-para-ciencia-de-datos',
      descripcion:
        'Inicia desde cero en Python enfocado específicamente en el análisis, limpieza y manipulación de datos científicos y estadísticos.',
      descripcion_corta:
        'Aprende el lenguaje de programación de la Inteligencia Artificial.',
      descripcion_larga:
        'Sintaxis de Python, librerías esenciales (Pandas, NumPy, Matplotlib), limpieza de datos crudos y análisis exploratorio de datos (EDA) para toma de decisiones.',
      nivel: 'Principiante',
      precio: 129.0,
      duracion_horas: 30,
      imagen:
        'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Algoritmos de Machine Learning Supervisado',
      slug: 'algoritmos-de-machine-learning-supervisado',
      descripcion:
        'Domina los algoritmos clásicos que permiten a las computadoras aprender de datos históricos para clasificar información o predecir valores numéricos.',
      descripcion_corta: 'Enseña a las máquinas a predecir resultados futuros.',
      descripcion_larga:
        'Regresión lineal y logística, árboles de decisión, Random Forest, SVM, métricas de desempeño y técnicas para evitar el overfitting.',
      nivel: 'Intermedio',
      precio: 159.0,
      duracion_horas: 40,
      imagen:
        'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Deep Learning y Redes Neuronales',
      slug: 'deep-learning-y-redes-neuronales',
      descripcion:
        'Aprende a construir redes neuronales complejas que imitan el cerebro humano para procesar imágenes, texto y sonido de forma avanzada.',
      descripcion_corta:
        'Entra al mundo del aprendizaje profundo y la visión artificial.',
      descripcion_larga:
        'Redes Neuronales Artificiales (ANN), Redes Convolucionales (CNN) para visión, procesamiento de lenguaje natural y uso de frameworks como TensorFlow o PyTorch.',
      nivel: 'Avanzado',
      precio: 189.0,
      duracion_horas: 45,
      imagen:
        'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },

    // --- MIS DEV ---
    {
      id_docente: docente.id_usuario,
      nombre: 'Frontend con React y Tailwind',
      slug: 'frontend-con-react-y-tailwind',
      descripcion:
        'Domina la librería líder del mercado para crear interfaces de usuario reactivas, utilizando las mejores prácticas de diseño contemporáneo y optimización de rendimiento.',
      descripcion_corta: 'Construye interfaces modernas, rápidas y estéticas.',
      descripcion_larga:
        'Hooks avanzados, gestión de estado con Context API o Redux Toolkit, animaciones con Framer Motion, estilado premium con Tailwind CSS y consumo de APIs REST.',
      nivel: 'Intermedio',
      precio: 149.0,
      duracion_horas: 40,
      imagen:
        'https://images.pexels.com/photos/1181133/pexels-photo-1181133.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Backend con NestJS y TypeORM',
      slug: 'backend-con-nestjs-y-typeorm',
      descripcion:
        'Aprende a construir el "cerebro" de las aplicaciones utilizando el framework más robusto de Node.js, enfocado en arquitectura empresarial y modularidad.',
      descripcion_corta: 'Desarrolla APIs escalables, seguras y profesionales.',
      descripcion_larga:
        'Inyección de dependencias, controladores, servicios, integración con bases de datos relacionales (PostgreSQL), autenticación con JWT y validación de esquemas con DTOs.',
      nivel: 'Avanzado',
      precio: 169.0,
      duracion_horas: 45,
      imagen:
        'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Despliegue y Arquitectura Cloud',
      slug: 'despliegue-y-arquitectura-cloud',
      descripcion:
        'Aprende los conceptos fundamentales de la nube y cómo configurar pipelines automáticos para que tu código llegue a los usuarios finales de forma segura.',
      descripcion_corta:
        'Lleva tus aplicaciones a producción de forma profesional.',
      descripcion_larga:
        'Configuración de CI/CD con GitHub Actions, despliegue en plataformas como Vercel y Railway, gestión básica de dominios, SSL y Dockerización de aplicaciones.',
      nivel: 'Avanzado',
      precio: 99.0,
      duracion_horas: 20,
      imagen:
        'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Fundamentos de React Native',
      slug: 'fundamentos-de-react-native',
      descripcion:
        'Inicia en el mundo del desarrollo móvil utilizando React Native para compilar aplicaciones reales tanto para iOS como para Android desde un mismo código base.',
      descripcion_corta:
        'Crea tus primeras aplicaciones móviles nativas con JavaScript.',
      descripcion_larga:
        'Configuración del entorno (Expo vs CLI), componentes nativos, sistema de estilos (StyleSheet), manejo de eventos táctiles y diseño de layouts móviles responsivos.',
      nivel: 'Principiante',
      precio: 109.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Navegación y Estado en Apps Móviles',
      slug: 'navegacion-y-estado-en-apps-moviles',
      descripcion:
        'Aprende a conectar múltiples pantallas de forma fluida y a gestionar la información de la aplicación de manera eficiente y persistente.',
      descripcion_corta:
        'Gestiona flujos complejos y datos en tiempo real en tu App.',
      descripcion_larga:
        'React Navigation (Stack, Tabs, Drawer), persistencia de datos local con AsyncStorage, integración con Firebase y manejo de estados globales en dispositivos móviles.',
      nivel: 'Intermedio',
      precio: 119.0,
      duracion_horas: 25,
      imagen:
        'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Publicación en App Store y Play Store',
      slug: 'publicacion-en-app-store-y-play-store',
      descripcion:
        'Conoce todo el proceso técnico y burocrático para subir tus desarrollos a las tiendas de Apple y Google, cumpliendo con sus estándares de calidad.',
      descripcion_corta:
        'Finaliza y publica tus aplicaciones en las tiendas oficiales.',
      descripcion_larga:
        'Generación de certificados y llaves de firma, optimización de assets, configuración de metadatos en App Store Connect y Google Play Console, y proceso de revisión.',
      nivel: 'Avanzado',
      precio: 89.0,
      duracion_horas: 15,
      imagen:
        'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Microservicios con Node.js',
      slug: 'microservicios-con-node-js',
      descripcion:
        'Aprende a desacoplar aplicaciones monolíticas en pequeños servicios independientes que se comunican entre sí para manejar cargas masivas de usuarios.',
      descripcion_corta:
        'Divide y vencerás: construye sistemas distribuidos y potentes.',
      descripcion_larga:
        'Comunicación entre servicios (gRPC, colas de mensajes como RabbitMQ), API Gateways, Service Discovery y patrones de diseño para microservicios.',
      nivel: 'Avanzado',
      precio: 169.0,
      duracion_horas: 35,
      imagen:
        'https://images.pexels.com/photos/5466231/pexels-photo-5466231.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Contenedores: Docker y Kubernetes',
      slug: 'contenedores-docker-y-kubernetes',
      descripcion:
        'Aprende a empaquetar tus aplicaciones en contenedores y a orquestarlas de forma automática para asegurar que tu sistema nunca se caiga.',
      descripcion_corta:
        'Domina el estándar de la industria para despliegue escalable.',
      descripcion_larga:
        'Creación de Dockerfiles optimizados, Docker Compose para entornos locales, despliegue en clusters de Kubernetes, pods, servicios y auto-escalamiento.',
      nivel: 'Avanzado',
      precio: 189.0,
      duracion_horas: 40,
      imagen:
        'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
    {
      id_docente: docente.id_usuario,
      nombre: 'Serverless y Cloud Architecture (AWS)',
      slug: 'serverless-y-cloud-architecture-aws',
      descripcion:
        'Explora el poder de AWS para construir aplicaciones que escalan infinitamente pagando solo por lo que usas, delegando la gestión de infraestructura a la nube.',
      descripcion_corta:
        'Crea arquitecturas de última generación sin gestionar servidores.',
      descripcion_larga:
        'Funciones Lambda, API Gateway, bases de datos NoSQL (DynamoDB), almacenamiento en S3 y diseño de arquitecturas orientadas a eventos en la nube.',
      nivel: 'Avanzado',
      precio: 159.0,
      duracion_horas: 30,
      imagen:
        'https://images.pexels.com/photos/1451187/pexels-photo-1451187.jpeg?auto=compress&cs=tinysrgb&w=800',
      estado: 'Publicado',
      fecha_creacion: new Date(),
    },
  ];

  for (const c of cursos) {
    const curso = await cursoRepo.findOne({ where: { slug: c.slug } });
    if (!curso) {
      await cursoRepo.save(
        cursoRepo.create(c as import('typeorm').DeepPartial<Curso>),
      );
      console.log(`  ➕ Creado: ${c.nombre}`);

      // Solo sembramos contenido falso (módulos/lecciones) si el curso es NUEVO
      // Nota: seedMockContent debería ser adaptado si se desea mayor granularidad
    } else {
      console.log(`  ⏩ Omitido (Ya existe y está protegido): ${c.nombre}`);
    }
  }
  console.log(`  ✅ Proceso de cursos finalizado.`);

  // Llamar a sembrar contenido falso (Módulos y Lecciones)
  await seedMockContent(dataSource);
}
