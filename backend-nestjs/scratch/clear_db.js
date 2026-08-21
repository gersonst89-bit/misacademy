const mysql = require('mysql2/promise');

async function clearData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  const tablesToTruncate = [
    'cursos',
    'lineas_academicas',
    'rutas_academicas',
    'cursos_rutas',
    'modulos',
    'lecciones',
    'comentarios_leccion',
    'evaluaciones',
    'preguntas',
    'opciones_respuesta',
    'intentos_evaluacion',
    'respuestas_usuario',
    'resenas',
    'inscripciones',
    'inscripciones_rutas',
    'progreso_estudiante',
    'materiales',
    'certificaciones',
    'carrito_items',
    'carrito_compras'
  ];

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Foreign key checks disabled.');
    
    for (const table of tablesToTruncate) {
      console.log(`Truncating table: ${table}...`);
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`Table ${table} truncated successfully.`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Foreign key checks enabled.');
    console.log('All courses, routes, lines and related data have been cleared.');
  } catch (err) {
    console.error('Error executing truncate:', err);
  } finally {
    await connection.end();
  }
}

clearData();
