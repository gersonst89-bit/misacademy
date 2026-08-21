const mysql = require('mysql2/promise');

async function checkUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', ['admin@misacademy.com']);
    console.log(rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

checkUser();
