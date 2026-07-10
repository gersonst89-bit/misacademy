import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as entities from '../src/entities';
import { Usuario } from '../src/entities/usuario.entity';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
    throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function verifyAllUsers() {
    console.log('🔌 Conectando a la base de datos...');
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
        console.log('⚡ Marcando todos los usuarios como verificados...');
        const usuarioRepo = dataSource.getRepository(Usuario);
        
        const result = await usuarioRepo.update({ email_verificado: false }, { email_verificado: true });
        console.log(`✅ ¡Proceso completado! Usuarios afectados: ${result.affected}`);
    } catch (error) {
        console.error('❌ Error al verificar usuarios:', error);
    } finally {
        await dataSource.destroy();
    }
}

verifyAllUsers();

