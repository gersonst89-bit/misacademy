const mysql = require('mysql2/promise');

async function insertLinea() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  const nombre = 'OPERADOR DE MAQUINARIA PESADA';
  const slug = 'operador-de-maquinaria-pesada';
  const descripcion = 'Línea académica para formación de operadores de maquinaria pesada.';

  try {
    const [result] = await connection.query(
      `INSERT INTO lineas_academicas (nombre, slug, descripcion, estado, fecha_creacion, fecha_actualizacion) 
       VALUES (?, ?, ?, 'Activo', NOW(), NOW())`,
      [nombre, slug, descripcion]
    );
    console.log('Linea insertada con éxito, ID:', result.insertId);
  } catch (err) {
    console.error('Error insertando línea:', err);
  } finally {
    await connection.end();
  }
}

insertLinea();
