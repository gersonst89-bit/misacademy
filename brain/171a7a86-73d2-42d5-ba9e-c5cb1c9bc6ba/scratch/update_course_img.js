const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../../../../backend-nestjs/.env') });

async function updateCourse() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mis_academy',
  });

  const newImageUrl = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000';
  
  const [result] = await connection.execute(
    'UPDATE cursos SET imagen = ? WHERE id_curso = 5',
    [newImageUrl]
  );
  
  console.log('Update Result:', result);

  await connection.end();
}

updateCourse().catch(console.error);
