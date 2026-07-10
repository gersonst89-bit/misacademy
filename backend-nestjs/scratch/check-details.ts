import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as entities from '../src/entities';

import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
    throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function checkDetails() {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'siteadmin_mis_academy',
        entities: Object.values(entities),
        synchronize: false,
    });

    await dataSource.initialize();

    try {
        console.log('=== CURSO 117 ===');
        const curso = await dataSource.query('SELECT id_curso, nombre, precio, estado FROM cursos WHERE id_curso = 117');
        console.log(curso);

        console.log('=== RUTA 113 ===');
        const ruta = await dataSource.query('SELECT id_ruta, nombre, precio, estado FROM rutas_academicas WHERE id_ruta = 113');
        console.log(ruta);
        
        console.log('=== TODOS LOS CURSOS EN EL CARRITO DE SAUL ===');
        const cartItems = await dataSource.query(`
            SELECT ci.*, c.nombre as curso_nombre, r.nombre as ruta_nombre
            FROM carrito_items ci
            LEFT JOIN cursos c ON ci.id_curso = c.id_curso
            LEFT JOIN rutas_academicas r ON ci.id_ruta = r.id_ruta
        `);
        console.log(cartItems);

    } catch (error) {
        console.error('Error querying:', error);
    } finally {
        await dataSource.destroy();
    }
}

checkDetails();

