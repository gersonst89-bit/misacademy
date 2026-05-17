
import { DataSource } from 'typeorm';
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as entities from './src/entities';

// Import seeders
import { seedCursos } from './src/database/seeds/cursos.seed';
import { seedMain } from './src/database/seeds/main.seed';
import { seedTeachers } from './src/database/seeds/teachers.seed';
import { seedStandalone } from './src/database/seeds/standalone.seed';
import { seedMasterStructure } from './src/database/seeds/master-structure.seed';
import { cleanDatabaseGarbage } from './src/database/seeds/clean-garbage.seed';

dotenv.config();

async function runMasterSeed() {
    console.log('🚀 Iniciando Master Seed...');

    const dataSource = await createConnection({
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_DATABASE || 'mis_academy',
        entities: Object.values(entities),
        synchronize: false,
    });

    try {
        console.log('--- Limpiando Basura de la Base de Datos ---');
        await cleanDatabaseGarbage(dataSource);

        console.log('--- Sembrando Cursos Base ---');
        await seedCursos(dataSource);

        console.log('--- Sembrando Estructura de Módulos y Lecciones ---');
        await seedMain(dataSource);

        console.log('--- Sembrando Docentes y Asignaciones ---');
        await seedTeachers(dataSource);

        console.log('--- Sembrando Cursos Libres (Standalone) ---');
        await seedStandalone(dataSource);

        console.log('--- Configurando Estructura de Líneas y Rutas (9 Cursos por Línea) ---');
        await seedMasterStructure(dataSource);

        console.log('✅ ¡Sincronización Maestra completada con éxito!');
    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
    } finally {
        await dataSource.destroy();
    }
}

runMasterSeed();
