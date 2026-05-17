import { DataSource } from 'typeorm';
import { Curso } from './backend-nestjs/src/entities/curso.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend-nestjs/.env' });

const curriculumData = [
  {
    nombre: "Fundamentos de IA para el Aula",
    descripcion_corta: "Inicia tu camino en la educación del futuro con IA.",
    descripcion: "Este curso introduce a los docentes en el ecosistema de la Inteligencia Artificial.",
    descripcion_larga: "Aprenderás la historia de la IA, tipos de modelos (texto, imagen, audio), ética y privacidad de datos de menores, y cómo configurar tu primer entorno de trabajo con herramientas gratuitas para el aula.",
    objetivos: "Comprender fundamentos,Identificar herramientas gratuitas,Aplicar ética tecnológica",
    requisitos: "Conocimientos básicos de navegación e internet.",
    nivel: "Principiante",
    duracion_horas: 15,
    precio: 69.00
  },
  {
    nombre: "Generación de Material Didáctico con IA",
    descripcion_corta: "Crea recursos educativos de alta calidad en tiempo récord.",
    descripcion: "Un taller práctico enfocado en la productividad docente para diseñar materiales.",
    descripcion_larga: "Dominio de herramientas como Canva Magic, Gamma App, y ChatGPT para la creación de sesiones de aprendizaje, rúbricas dinámicas y contenido multimedia personalizado.",
    objetivos: "Diseñar presentaciones automáticas,Crear rúbricas en minutos,Generar contenido multimedia",
    requisitos: "Haber llevado Fundamentos de IA o experiencia básica con ChatGPT.",
    nivel: "Intermedio",
    duracion_horas: 20,
    precio: 89.00
  },
  {
    nombre: "Evaluación Automatizada y Chatbots Educativos",
    descripcion_corta: "Automatiza el feedback y personaliza el aprendizaje 24/7.",
    descripcion: "Aprende a diseñar sistemas que califiquen automáticamente.",
    descripcion_larga: "Creación de GPTs personalizados para tutoría, uso de herramientas como QuestionWell para exámenes inteligentes, y análisis de datos de aprendizaje.",
    objetivos: "Crear tutores virtuales 24/7,Automatizar exámenes,Analizar datos de aprendizaje",
    requisitos: "Nivel intermedio en IA educativa.",
    nivel: "Avanzado",
    duracion_horas: 25,
    precio: 99.00
  },
  {
    nombre: "Liderazgo Docente y Comunicación Efectiva",
    descripcion_corta: "Fortalece tu liderazgo y mejora la relación con padres y alumnos.",
    descripcion: "Desarrolla habilidades blandas críticas para gestionar grupos humanos.",
    descripcion_larga: "Técnicas de comunicación asertiva, gestión de reuniones con padres, liderazgo situacional en el salón y herramientas de organización personal para docentes.",
    objetivos: "Mejorar comunicación asertiva,Liderar grupos con empatía,Gestionar reuniones efectivas",
    requisitos: "Ser docente en ejercicio o formación.",
    nivel: "Principiante",
    duracion_horas: 15,
    precio: 69.00
  },
  {
    nombre: "Neuroeducación y Clima Escolar",
    descripcion_corta: "Entiende cómo aprende el cerebro para mejorar la convivencia.",
    descripcion: "Descubre las bases neurocientíficas del aprendizaje.",
    descripcion_larga: "Plasticidad cerebral, gestión de las emociones en el aprendizaje, diseño de espacios de aula cerebro-compatibles y estrategias de motivación intrínseca.",
    objetivos: "Aplicar neurociencia en clase,Mejorar clima escolar,Motivar intrínsecamente",
    requisitos: "Interés en psicología educativa.",
    nivel: "Intermedio",
    duracion_horas: 20,
    precio: 79.00
  },
  {
    nombre: "Disciplina Positiva y Resolución de Conflictos",
    descripcion_corta: "Gestiona conflictos en el aula sin castigos ni premios.",
    descripcion: "Implementa un modelo de convivencia basado en el respeto mutuo.",
    descripcion_larga: "Herramientas de disciplina positiva, mediación entre pares, manejo de conductas disruptivas y creación de acuerdos de convivencia democráticos.",
    objetivos: "Resolver conflictos democráticamente,Aplicar firmeza y amabilidad,Mediar entre estudiantes",
    requisitos: "Ganas de transformar la convivencia escolar.",
    nivel: "Avanzado",
    duracion_horas: 25,
    precio: 89.00
  },
  {
    nombre: "Prompt Engineering para Profesionales",
    descripcion_corta: "Domina el arte de hablar con la Inteligencia Artificial.",
    descripcion: "Técnicas avanzadas de comunicación con modelos de lenguaje (LLM).",
    descripcion_larga: "Estructura de prompts, técnicas Zero-shot y Few-shot, cadenas de pensamiento (Chain of Thought), y cómo evitar alucinaciones en modelos como ChatGPT, Claude y Gemini.",
    objetivos: "Estructurar prompts maestros,Reducir tiempo administrativo,Optimizar resultados de IA",
    requisitos: "Uso básico de ChatGPT.",
    nivel: "Principiante",
    duracion_horas: 15,
    precio: 89.00
  },
  {
    nombre: "Frontend con React y Tailwind",
    descripcion_corta: "Construye interfaces modernas, rápidas y estéticas.",
    descripcion: "Domina la librería líder del mercado para crear interfaces de usuario.",
    descripcion_larga: "Hooks avanzados, gestión de estado con Context API o Redux Toolkit, animaciones con Framer Motion, estilado premium con Tailwind CSS y consumo de APIs REST.",
    objetivos: "Construir SPAs modernas,Dominar utilidades de Tailwind,Gestionar estado global",
    requisitos: "JavaScript ES6+ sólido.",
    nivel: "Intermedio",
    duracion_horas: 40,
    precio: 149.00
  }
];

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function run() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mis_academy',
    entities: [Curso],
    synchronize: false,
  });

  try {
    await ds.initialize();
    console.log('Conexión establecida.');
    const repo = ds.getRepository(Curso);
    const cursos = await repo.find();

    for (const curso of cursos) {
      const data = curriculumData.find(d => d.nombre.toLowerCase().trim() === curso.nombre.toLowerCase().trim());
      
      const updateData: any = {
        slug: createSlug(curso.nombre),
        estado: 'Publicado',
        fecha_actualizacion: new Date()
      };

      if (data) {
        updateData.descripcion_corta = data.descripcion_corta;
        updateData.descripcion = data.descripcion;
        updateData.descripcion_larga = data.descripcion_larga;
        updateData.objetivos = data.objetivos;
        updateData.requisitos = data.requisitos;
        updateData.nivel = data.nivel;
        updateData.duracion_horas = data.duracion_horas;
        updateData.precio = data.precio;
      }

      await repo.update(curso.id_curso, updateData);
      console.log(`Actualizado: ${curso.nombre} (Slug: ${updateData.slug})`);
    }

    console.log('Reparación completada con éxito.');
  } catch (err) {
    console.error('Error durante la reparación:', err);
  } finally {
    await ds.destroy();
  }
}

run();
