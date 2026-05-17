import { DataSource } from 'typeorm';
import { Curso } from '../../entities/curso.entity';
import { RutaAcademica } from '../../entities/ruta-academica.entity';

export async function seedFixLines(dataSource: DataSource): Promise<void> {
    const cursoRepo = dataSource.getRepository(Curso);
    const rutaRepo = dataSource.getRepository(RutaAcademica);

    console.log('🔧 Iniciando VINCULACIÓN MAESTRA de Cursos, Rutas y Líneas...');

    // 1. Mapeo de Rutas a Líneas Académicas (Filtros)
    const mapeoRutasLineas = [
        { ids: [10, 11], lineaId: 1 }, // MIS TEACHER
        { ids: [6, 7, 8, 9], lineaId: 2 }, // MIS IA
        { ids: [12, 13, 14], lineaId: 3 }, // MIS BUSINESS
        { ids: [15, 16, 17], lineaId: 4 }  // MIS DEV
    ];

    for (const item of mapeoRutasLineas) {
        await rutaRepo.update(item.ids, { id_linea_academica: item.lineaId });
    }

    // 2. Mapeo de Cursos a sus respectivas Rutas
    const vinculacionCursosRutas = [
        {
            rutaId: 15, // Desarrollador Fullstack (MIS DEV)
            cursosNames: [
                'Backend con NestJS y TypeORM', 
                'Frontend con React y Tailwind', 
                'Fundamentos de Desarrollo Web',
                'Angular: Arquitectura y Desarrollo para Empresas',
                'Taller de Git y GitHub',
                'Diseño de Interfaces (UI/UX) con Figma',
                'Desarrollo de Videojuegos con Unity 3D'
            ]
        },
        {
            rutaId: 16, // Desarrollo Mobile (MIS DEV)
            cursosNames: ['Fundamentos de React Native', 'Navegación y Estado en Apps Móviles', 'Publicación en App Store y Play Store']
        },
        {
            rutaId: 17, // Cloud (MIS DEV)
            cursosNames: ['Contenedores: Docker y Kubernetes', 'Microservicios con Node.js', 'Serverless y Cloud Architecture(AWS)']
        },
        {
            rutaId: 13, // Marketing (MIS BUSINESS)
            cursosNames: ['SEO y Posicionamiento para Desarrolladores', 'Marketing Digital y Marca Personal para Tech']
        },
        {
            rutaId: 14, // Finanzas (MIS BUSINESS)
            cursosNames: ['Finanzas para Freelancers Tecnológicos', 'Inglés Técnico para Profesionales IT']
        },
        {
            rutaId: 12, // Emprendimiento (MIS BUSINESS)
            cursosNames: ['SCRUM y Metodologías Ágiles para Equipos']
        }
    ];

    for (const vinc of vinculacionCursosRutas) {
        const ruta = await rutaRepo.findOne({ where: { id_ruta: vinc.rutaId }, relations: ['cursos'] });
        if (ruta) {
            const cursosExistentes = ruta.cursos || [];
            const nuevosCursos = [];
            
            for (const nombre of vinc.cursosNames) {
                const curso = await cursoRepo.createQueryBuilder('c')
                    .where('c.nombre LIKE :nombre', { nombre: `%${nombre}%` })
                    .getOne();
                
                if (curso && !cursosExistentes.some(ce => ce.id_curso === curso.id_curso)) {
                    nuevosCursos.push(curso);
                }
            }
            
            ruta.cursos = [...cursosExistentes, ...nuevosCursos];
            await rutaRepo.save(ruta);
            console.log(`  🔗 Ruta "${ruta.nombre}" vinculada. Total cursos: ${ruta.cursos.length}`);
        }
    }

    console.log('🏁 Vinculación y filtros reparados con éxito.');
}
