const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root123',
    database: 'mis_academy'
  });

  try {
    const [rows] = await connection.execute('SELECT id_usuario, nombre, email, id_rol FROM usuarios');
    console.log('USUARIOS ENCONTRADOS:');
    console.table(rows);
    
    const [roles] = await connection.execute('SELECT id_rol, nombre_rol FROM roles');
    console.log('\nROLES:');
    console.table(roles);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

checkUsers();
