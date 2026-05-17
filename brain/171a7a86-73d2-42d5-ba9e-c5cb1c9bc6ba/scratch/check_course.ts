import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../backend-nestjs/.env') });

async function checkCourse() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mis_academy',
    entities: [],
    synchronize: false,
  });

  const result = await connection.query('SELECT * FROM cursos WHERE id_curso = 5');
  console.log('Course Data:', JSON.stringify(result, null, 2));

  await connection.close();
}

checkCourse().catch(console.error);
