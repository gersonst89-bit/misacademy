const mysql = require('mysql2/promise');

async function finalPolish() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root123',
    database: 'mis_academy'
  });

  try {
    console.log('--- PURGA DE CONTENIDO DE PRUEBA ---');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Nombres probables de tablas (plural y singular)
    const tablesToClear = [
      'evaluaciones', 'preguntas', 'opciones_respuesta', 'opciones_respuestas', 'materiales'
    ];

    for (const table of tablesToClear) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`   - Tabla ${table} limpia.`);
      } catch (e) {
        console.log(`   - Tabla ${table} omitida (no existe o ya está limpia).`);
      }
    }

    // Asegurar que Elena existe
    const emailElena = 'elena.marketing@misacademy.com';
    const [existing] = await connection.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [emailElena]);
    
    let elenaId;
    if (existing.length === 0) {
      // Intentamos obtener el ID del rol de Instructor/Docente
      const [roles] = await connection.execute('SELECT id_rol FROM roles WHERE nombre_rol LIKE "%Instructor%" OR nombre_rol LIKE "%Docente%" LIMIT 1');
      const rolDocente = roles.length > 0 ? roles[0].id_rol : 2;

      const [result] = await connection.execute(
        'INSERT INTO usuarios (nombre, apellido, email, password, id_rol, estado, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Elena', 'Marketing', emailElena, '$2b$10$K7L1Jq...', rolDocente, 'Activo', new Date()]
      );
      elenaId = result.insertId;
      console.log(`   - Elena creada (ID: ${elenaId})`);
    } else {
      elenaId = existing[0].id_usuario;
      console.log(`   - Elena ya existía (ID: ${elenaId})`);
    }

    // Vincular a todos los cursos
    await connection.execute('UPDATE cursos SET id_instructor = ?', [elenaId]);
    console.log('   - Elena asignada a todos los cursos.');

    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n--- ACADEMIA LIMPIA Y LISTA ---');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

finalPolish();
