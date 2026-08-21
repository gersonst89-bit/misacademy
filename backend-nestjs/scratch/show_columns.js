const mysql = require('mysql2/promise');

async function getCols() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  const [rows] = await connection.query('SHOW COLUMNS FROM lineas_academicas');
  console.log(rows);
  await connection.end();
}

getCols();

