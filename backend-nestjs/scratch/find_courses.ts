
import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
  throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function main() {
  const connection = await createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'mis_academy',
    port: 3306
  });

  const [results]: any = await connection.execute(
    `SELECT c.nombre, COUNT(cr.id_ruta) as routes_count 
     FROM cursos c 
     LEFT JOIN cursos_rutas cr ON c.id_curso = cr.id_curso 
     GROUP BY c.id_curso`
  );

  console.log(JSON.stringify(results, null, 2));
  await connection.end();
}

main().catch(console.error);

