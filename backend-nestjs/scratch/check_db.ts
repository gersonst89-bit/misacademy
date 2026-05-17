
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function check() {
    try {
        const connection = await createConnection({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'mis_academy',
            synchronize: false,
            logging: false,
        });

        console.log('--- BUSCANDO INSCRIPCIÓN ---');
        const results = await connection.query('SELECT * FROM inscripciones WHERE id_usuario = 20 AND id_curso = 714');
        console.log('Resultados:', JSON.stringify(results, null, 2));

        console.log('\n--- BUSCANDO PAGO ---');
        const pagos = await connection.query('SELECT id_pago, id_usuario, estado FROM pagos WHERE id_usuario = 20 ORDER BY id_pago DESC LIMIT 1');
        console.log('Último pago:', JSON.stringify(pagos, null, 2));

        if (pagos.length > 0) {
            const detalles = await connection.query('SELECT * FROM pagos_detalles WHERE id_pago = ?', [pagos[0].id_pago]);
            console.log('Detalles del pago:', JSON.stringify(detalles, null, 2));
        }

        await connection.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

check();
