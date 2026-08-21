const mysql = require('mysql2/promise');

async function getColsRutas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  const [rows] = await connection.query('SHOW COLUMNS FROM rutas_academicas');
  console.log(rows);
  await connection.end();
}

getColsRutas();
