const mysql = require('mysql2/promise');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
  throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD,
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

