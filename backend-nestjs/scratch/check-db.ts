import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as entities from '../src/entities';

import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
    throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function checkDb() {
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
        console.log('=== TABLA PAGOS ===');
        const pagos = await dataSource.query('SELECT * FROM pagos');
        console.table(pagos);

        console.log('=== TABLA DETALLE_PAGOS ===');
        const detalles = await dataSource.query('SELECT * FROM detalle_pagos');
        console.table(detalles);

        console.log('=== TABLA INSCRIPCION_RUTAS ===');
        const inscripcionesRutas = await dataSource.query('SELECT * FROM inscripcion_rutas');
        console.table(inscripcionesRutas);

        console.log('=== TABLA INSCRIPCIONES ===');
        const inscripciones = await dataSource.query('SELECT * FROM inscripciones');
        console.table(inscripciones);
    } catch (error) {
        console.error('Error querying DB:', error);
    } finally {
        await dataSource.destroy();
    }
}

checkDb();

