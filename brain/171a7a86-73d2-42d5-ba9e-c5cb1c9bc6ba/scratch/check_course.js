const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../../../../backend-nestjs/.env') });

async function checkCourse() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mis_academy',
  });

  const [rows] = await connection.execute('SELECT * FROM cursos WHERE id_curso = 5');
  console.log('Course Data:', JSON.stringify(rows, null, 2));

  await connection.end();
}

checkCourse().catch(console.error);
