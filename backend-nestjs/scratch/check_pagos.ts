
import { createConnection } from 'typeorm';
import { Pago } from '../src/entities/pago.entity';
import { Usuario } from '../src/entities/usuario.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
    throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function checkPagos() {
    try {
        const connection = await createConnection({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [Pago, Usuario],
            synchronize: false,
        });

        const pagoRepo = connection.getRepository(Pago);
        const pagos = await pagoRepo.find({ where: { estado: 'Completado' }, relations: ['usuario'] });

        console.log('--- PAGOS COMPLETADOS ---');
        let total = 0;
        pagos.forEach(p => {
            console.log(`ID: ${p.id_pago}, Usuario: ${p.usuario?.nombre} ${p.usuario?.apellido}, Monto: ${p.monto_total}, Fecha: ${p.fecha_pago}`);
            total += Number(p.monto_total);
        });
        console.log(`TOTAL SUMADO: ${total}`);

        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPagos();
