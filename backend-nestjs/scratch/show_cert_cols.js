const mysql = require('mysql2/promise');

async function getColsCert() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  try {
    const [rows] = await connection.query('SHOW COLUMNS FROM certificaciones');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

getColsCert();
