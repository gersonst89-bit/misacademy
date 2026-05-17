
import { createConnection } from 'mysql2/promise';

async function main() {
  const connection = await createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root123',
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
