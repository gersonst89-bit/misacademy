import { DataSource } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { Curso } from '../../entities/curso.entity';
import * as bcrypt from 'bcryptjs';

export async function seedTeachers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(Usuario);
  const cursoRepo = dataSource.getRepository(Curso);

  console.log('👥 Iniciando creación de EQUIPO DOCENTE...');

  const seedPassword = process.env.SEED_TEACHERS_PASSWORD;
  if (!seedPassword && process.env.APP_ENV === 'production') {
    throw new Error('SEED_TEACHERS_PASSWORD env variable is required in production');
  }
  const hashedPassword = await bcrypt.hash(seedPassword || 'Teacher123!', 10);

  const docentesData = [
    {
      nombre: 'Ana',
      apellido: 'García',
      email: 'ana.frontend@misacademy.com',
      biografia:
        'Ingeniera de Software Senior con más de 10 años de experiencia en frameworks modernos como React, Angular y Vue. Apasionada por el código limpio y el rendimiento web.',
      imagen_perfil:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
    },
    {
      nombre: 'Carlos',
      apellido: 'Méndez',
      email: 'carlos.ia@misacademy.com',
      biografia:
        'Especialista en Inteligencia Artificial y Machine Learning. Ha liderado proyectos de procesamiento de lenguaje natural y visión artificial en startups de Silicon Valley.',
      imagen_perfil:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&auto=format&fit=crop',
    },
    {
      nombre: 'Sofía',
      apellido: 'Torres',
      email: 'sofia.design@misacademy.com',
      biografia:
        'Diseñadora de Producto UI/UX con enfoque en accesibilidad y psicología del usuario. Experta en Figma y sistemas de diseño a gran escala.',
      imagen_perfil:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&auto=format&fit=crop',
    },
    {
      nombre: 'David',
      apellido: 'Rivera',
      email: 'david.security@misacademy.com',
      biografia:
        'Hacker Ético certificado. Dedicado a la consultoría de seguridad ofensiva y la formación de nuevos talentos en la protección de infraestructuras críticas.',
      imagen_perfil:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    },
    {
      nombre: 'Elena',
      apellido: 'Rivas',
      email: 'elena.marketing@misacademy.com',
      biografia:
        'Estratega de Crecimiento y Marketing Digital. Experta en SEO, Marca Personal y escalado de negocios digitales orientados a la tecnología.',
      imagen_perfil:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&auto=format&fit=crop',
    },
  ];

  const docentesCreados = [];

  for (const data of docentesData) {
    let user = await userRepo.findOne({ where: { email: data.email } });
    if (!user) {
      user = userRepo.create({
        ...data,
        id_rol: 2, // Asumiendo que 2 es Docente
        password: hashedPassword,
        email_verificado: true,
        estado: 'Activo',
        fecha_registro: new Date(),
      });
      await userRepo.save(user);
      console.log(`  ➕ Docente creado: ${user.nombre} ${user.apellido}`);
    }
    docentesCreados.push(user);
  }

  console.log('🎯 Repartiendo cursos entre los docentes...');

  const cursos = await cursoRepo.find();
  for (const curso of cursos) {
    let id_docente = docentesCreados[0].id_usuario; // Default Ana

    const nombre = curso.nombre.toLowerCase();

    if (
      nombre.includes('ia') ||
      nombre.includes('inteligencia') ||
      nombre.includes('automatización') ||
      nombre.includes('chatbots')
    ) {
      id_docente = docentesCreados[1].id_usuario; // Carlos (IA)
    } else if (
      nombre.includes('diseño') ||
      nombre.includes('figma') ||
      nombre.includes('ux') ||
      nombre.includes('ui') ||
      nombre.includes('interfaces')
    ) {
      id_docente = docentesCreados[2].id_usuario; // Sofía (UX)
    } else if (
      nombre.includes('hacking') ||
      nombre.includes('seguridad') ||
      nombre.includes('security') ||
      nombre.includes('ético')
    ) {
      id_docente = docentesCreados[3].id_usuario; // David (Security)
    } else if (
      nombre.includes('marketing') ||
      nombre.includes('negocio') ||
      nombre.includes('seo') ||
      nombre.includes('marca personal') ||
      nombre.includes('finanzas') ||
      nombre.includes('scrum')
    ) {
      id_docente = docentesCreados[4].id_usuario; // Elena (Business)
    } else if (
      nombre.includes('react') ||
      nombre.includes('angular') ||
      nombre.includes('frontend') ||
      nombre.includes('web') ||
      nombre.includes('git') ||
      nombre.includes('typescript')
    ) {
      id_docente = docentesCreados[0].id_usuario; // Ana (Frontend)
    }

    await cursoRepo.update(curso.id_curso, { id_docente });
  }

  console.log(
    `✅ ¡Proceso completado! 5 docentes creados y ${cursos.length} cursos re-asignados.`,
  );
}
