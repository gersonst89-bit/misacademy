const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  const [rows, fields] = await connection.execute('SHOW TABLES');
  console.log(rows);
  await connection.end();
}

checkTables().catch(console.error);
