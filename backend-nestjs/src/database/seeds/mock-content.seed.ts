import { DataSource } from 'typeorm';
import { Curso } from '../../entities/curso.entity';
import { Modulo } from '../../entities/modulo.entity';
import { Leccion } from '../../entities/leccion.entity';

export async function seedMockContent(dataSource: DataSource): Promise<void> {
    const cursoRepo = dataSource.getRepository(Curso);
    const moduloRepo = dataSource.getRepository(Modulo);
    const leccionRepo = dataSource.getRepository(Leccion);

    const curso = await cursoRepo.findOne({ where: { slug: 'curso-de-access-nivel-basico' } });
    
    if (!curso) {
        console.log('Curso de Access no encontrado para sembrar módulos.');
        return;
    }

    const modulosCount = await moduloRepo.count({ where: { id_curso: curso.id_curso } });
    
    if (modulosCount === 0) {
        // Módulo 1
        const mod1 = await moduloRepo.save(moduloRepo.create({
            id_curso: curso.id_curso,
            titulo: 'Introducción a Access y Bases de Datos',
            descripcion: 'Conceptos fundamentales de bases de datos.',
            orden: 1,
            estado: 'Publicado'
        }));

        await leccionRepo.save([
            leccionRepo.create({
                id_modulo: mod1.id_modulo,
                titulo: '¿Qué es una base de datos relacional?',
                descripcion: 'Introducción teórica',
                tipo: 'video',
                url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duracion_minutos: 10,
                orden: 1,
                es_gratuita: true,
                estado: 'Publicado'
            }),
            leccionRepo.create({
                id_modulo: mod1.id_modulo,
                titulo: 'Interfaz de Microsoft Access',
                descripcion: 'Recorrido por la interfaz',
                tipo: 'video',
                url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duracion_minutos: 15,
                orden: 2,
                es_gratuita: false,
                estado: 'Publicado'
            })
        ]);

        // Módulo 2
        const mod2 = await moduloRepo.save(moduloRepo.create({
            id_curso: curso.id_curso,
            titulo: 'Creación de Tablas y Relaciones',
            descripcion: 'Diseñando la estructura de los datos.',
            orden: 2,
            estado: 'Publicado'
        }));

        await leccionRepo.save([
            leccionRepo.create({
                id_modulo: mod2.id_modulo,
                titulo: 'Creando nuestra primera tabla',
                descripcion: 'Tipos de datos y propiedades',
                tipo: 'video',
                url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duracion_minutos: 20,
                orden: 1,
                es_gratuita: false,
                estado: 'Publicado'
            }),
            leccionRepo.create({
                id_modulo: mod2.id_modulo,
                titulo: 'Estableciendo relaciones',
                descripcion: 'Integridad referencial',
                tipo: 'video',
                url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duracion_minutos: 25,
                orden: 2,
                es_gratuita: false,
                estado: 'Publicado'
            })
        ]);

        console.log(`  ✅ Módulos y Lecciones de prueba creados para Access.`);
    }
}
