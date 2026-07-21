const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  console.log('Connecting to:', process.env.DB_HOST, 'Database:', process.env.DB_DATABASE, 'User:', process.env.DB_USERNAME);
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
    const [rows] = await connection.execute('SELECT id_usuario, nombre, email, verificado, creado_en FROM usuarios ORDER BY creado_en DESC LIMIT 10');
    console.log('Last 10 users:');
    console.table(rows);
    await connection.end();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

main();
