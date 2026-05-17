const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Cargar .env desde la raíz
dotenv.config({ path: path.join(__dirname, '.env') });

async function hardDelete() {
    console.log('🚀 Iniciando operación de BORRADO TOTAL...');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_DATABASE || 'mis_academy'
    });

    const emails = ['gerson903legalize+1@gmail.com', 'gerson903legalize@gmail.com'];

    for (const email of emails) {
        const [result] = await connection.execute(
            'DELETE FROM usuarios WHERE email = ?',
            [email]
        );
        console.log(`  🗑️ ${email}: ${result.affectedRows > 0 ? 'BORRADO PERMANENTE' : 'No encontrado'}`);
    }

    await connection.end();
    console.log('✅ ¡Operación exitosa! Los correos están libres.');
}

hardDelete().catch(err => {
    console.error('❌ Error crítico:', err.message);
    process.exit(1);
});
