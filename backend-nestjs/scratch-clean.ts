import { DataSource } from 'typeorm';
import { Usuario } from './src/entities/usuario.entity';
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanUsers() {
    const dataSource = await createConnection({
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_DATABASE || 'mis_academy',
        entities: [Usuario],
        synchronize: false,
    });

    const userRepo = dataSource.getRepository(Usuario);
    const emails = ['gerson903legalize+1@gmail.com', 'gerson903legalize@gmail.com'];

    console.log('🧹 Iniciando limpieza de usuarios...');

    for (const email of emails) {
        const result = await userRepo.delete({ email });
        console.log(`  🗑️ ${email}: ${result.affected ? 'Eliminado' : 'No encontrado'}`);
    }

    await dataSource.destroy();
    console.log('✅ Limpieza completada.');
}

cleanUsers().catch(err => console.error('❌ Error:', err));


