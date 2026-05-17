
import { DataSource } from 'typeorm';
import { LineaAcademica } from '../../entities/linea-academica.entity';
import { RutaAcademica } from '../../entities/ruta-academica.entity';
import { Curso } from '../../entities/curso.entity';

export async function seedMasterStructure(dataSource: DataSource): Promise<void> {
    const lineaRepo = dataSource.getRepository(LineaAcademica);
    const rutaRepo = dataSource.getRepository(RutaAcademica);
    const cursoRepo = dataSource.getRepository(Curso);

    console.log('🏗️  Iniciando RE-ESTRUCTURACIÓN MAESTRA (3 Rutas/Línea, 3 Cursos/Ruta)...');

    // 1. Asegurar Líneas Académicas
    const lineasData = [
        { id: 1, nombre: 'MIS TEACHER', slug: 'mis-teacher', desc: 'Recursos y herramientas para mejorar la enseñanza' },
        { id: 2, nombre: 'MIS IA', slug: 'mis-ia', desc: 'Aprende inteligencia artificial y sus aplicaciones' },
        { id: 3, nombre: 'MIS BUSINESS', slug: 'mis-business', desc: 'Estrategias y gestión para negocios exitosos.' },
        { id: 4, nombre: 'MIS DEV', slug: 'mis-dev', desc: 'Formación integral en desarrollo de software y programación moderna' }
    ];

    for (const l of lineasData) {
        let linea = await lineaRepo.findOne({ where: { id_linea_academica: l.id } });
        if (!linea) {
            linea = lineaRepo.create({
                id_linea_academica: l.id,
                nombre: l.nombre,
                slug: l.slug,
                descripcion: l.desc,
                estado: 'Activo',
                fecha_creacion: new Date()
            });
            await lineaRepo.save(linea);
            console.log(`  ✅ Línea creada: ${l.nombre}`);
        } else {
            await lineaRepo.update(l.id, { nombre: l.nombre, slug: l.slug, descripcion: l.desc });
        }
    }

    // 2. Definir Rutas y sus Cursos
    const estructura = [
        // MIS TEACHER (1)
        {
            lineaId: 1,
            rutas: [
                { 
                    nombre: 'Innovación Educativa con IA', 
                    cursos: [
                        'Fundamentos de IA para el Aula', 
                        'Generación de Material Didáctico con IA', 
                        'Evaluación Automatizada y Chatbots Educativos'
                    ] 
                },
                { 
                    nombre: 'Gestión y Liderazgo en el Aula', 
                    cursos: [
                        'Liderazgo Docente y Comunicación Efectiva', 
                        'Neuroeducación y Clima Escolar', 
                        'Disciplina Positiva y Resolución de Conflictos'
                    ] 
                },
                { 
                    nombre: 'Diseño de Experiencias de Aprendizaje', 
                    cursos: [
                        'Planificación Curricular por Competencias', 
                        'Metodologías Activas: Gamificación y ABP', 
                        'Evaluación Formativa y Diseño de Rúbricas'
                    ] 
                }
            ]
        },
        // MIS IA (2)
        {
            lineaId: 2,
            rutas: [
                { 
                    nombre: 'IA Generativa', 
                    cursos: [
                        'Prompt Engineering para Profesionales', 
                        'IA para Generación de Imágenes y Video', 
                        'Automatización de Tareas con Agentes de IA'
                    ] 
                },
                { 
                    nombre: 'Automatización Inteligente con IA', 
                    cursos: [
                        'Introducción a la Automatización No-Code', 
                        'Flujos de Trabajo Inteligentes con Zapier y Make', 
                        'Integración de APIs de IA en Procesos de Negocio'
                    ] 
                },
                { 
                    nombre: 'Especialista en Machine Learning', 
                    cursos: [
                        'Python para Ciencia de Datos', 
                        'Algoritmos de Machine Learning Supervisado', 
                        'Deep Learning y Redes Neuronales'
                    ] 
                }
            ]
        },
        // MIS BUSINESS (3)
        {
            lineaId: 3,
            rutas: [
                { 
                    nombre: 'Emprendimiento y Creación de Startups', 
                    cursos: [
                        'Ideación y Modelo de Negocio Canvas', 
                        'Validación con MVP y Lean Startup', 
                        'Pitch y Levantamiento de Capital'
                    ] 
                },
                { 
                    nombre: 'Marketing Digital y Growth Hacking', 
                    cursos: [
                        'Estrategia de Contenidos y Redes Sociales', 
                        'Performance: Facebook y Google Ads', 
                        'Growth Hacking: Estrategias de Escalado'
                    ] 
                },
                { 
                    nombre: 'Finanzas y Gestión de Operaciones', 
                    cursos: [
                        'Finanzas para No Financieros', 
                        'Gestión de Operaciones y Procesos', 
                        'KPIs y Cuadro de Mando Integral'
                    ] 
                }
            ]
        },
        // MIS DEV (4)
        {
            lineaId: 4,
            rutas: [
                { 
                    nombre: 'Desarrollador Fullstack Moderno', 
                    cursos: [
                        'Frontend con React y Tailwind', 
                        'Backend con NestJS y TypeORM', 
                        'Despliegue y Arquitectura Cloud'
                    ] 
                },
                { 
                    nombre: 'Desarrollo Mobile Multiplataforma', 
                    cursos: [
                        'Fundamentos de React Native', 
                        'Navegación y Estado en Apps Móviles', 
                        'Publicación en App Store y Play Store'
                    ] 
                },
                { 
                    nombre: 'Arquitectura Backend y Cloud Computing', 
                    cursos: [
                        'Microservicios con Node.js', 
                        'Contenedores: Docker y Kubernetes', 
                        'Serverless y Cloud Architecture (AWS)'
                    ] 
                }
            ]
        }
    ];

    // LIMPIEZA PREVIA: Borrar rutas existentes para estas líneas para evitar duplicados
    console.log('  🧹 Limpiando rutas previas...');
    
    // Desactivar restricciones temporalmente para permitir la limpieza
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    for (const item of estructura) {
        const rutasAntiguas = await rutaRepo.find({ where: { id_linea_academica: item.lineaId }, relations: ['cursos'] });
        for (const ra of rutasAntiguas) {
            ra.cursos = []; // Desvincular cursos
            await rutaRepo.save(ra);
            await rutaRepo.delete(ra.id_ruta);
        }
    }
    
    // Reactivar restricciones
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    for (const item of estructura) {
        console.log(`  📂 Procesando rutas para Línea ID ${item.lineaId}...`);
        
        for (const rData of item.rutas) {
            let ruta = await rutaRepo.findOne({ where: { nombre: rData.nombre, id_linea_academica: item.lineaId }, relations: ['cursos'] });
            
            if (!ruta) {
                ruta = rutaRepo.create({
                    nombre: rData.nombre,
                    id_linea_academica: item.lineaId,
                    descripcion: `Ruta especializada en ${rData.nombre}`,
                    estado: 'Publicado',
                    fecha_creacion: new Date()
                });
                await rutaRepo.save(ruta);
            }

            // Vincular cursos con búsqueda ultra-flexible para asegurar el 3x9
            const cursosParaVincular = [];
            for (const cNombre of rData.cursos) {
                // Intentar por nombre exacto primero
                let curso = await cursoRepo.findOne({ where: { nombre: cNombre } });
                
                if (!curso) {
                    // Si no, intentar por slug
                    const slug = cNombre.toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9 -]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-");
                    curso = await cursoRepo.findOne({ where: { slug } });
                }

                if (!curso) {
                    // Si no, búsqueda parcial por palabras clave
                    const palabras = cNombre.split(' ').filter(p => p.length > 3);
                    const query = cursoRepo.createQueryBuilder('c');
                    palabras.forEach((p, i) => {
                        if (i === 0) query.where('c.nombre LIKE :p' + i, { ['p' + i]: `%${p}%` });
                        else query.andWhere('c.nombre LIKE :p' + i, { ['p' + i]: `%${p}%` });
                    });
                    curso = await query.getOne();
                }
                
                if (curso) {
                    cursosParaVincular.push(curso);
                }
            }

            ruta.cursos = cursosParaVincular;
            await rutaRepo.save(ruta);
            console.log(`    🔗 Ruta "${rData.nombre}" sincronizada con ${cursosParaVincular.length} cursos.`);
        }
    }

    console.log('🏁 Re-estructuración completada con éxito.');
}
