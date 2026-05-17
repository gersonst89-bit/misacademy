const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setElenaPassword() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root123',
    database: 'mis_academy'
  });

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Elena2025*', salt);
    
    const emailElena = 'elena.marketing@misacademy.com';
    await connection.execute('UPDATE usuarios SET password = ? WHERE email = ?', [hashedPassword, emailElena]);
    
    console.log('--- CONTRASEÑA DE ELENA ACTUALIZADA ---');
    console.log(`Email: ${emailElena}`);
    console.log('Password: Elena2025*');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

setElenaPassword();
