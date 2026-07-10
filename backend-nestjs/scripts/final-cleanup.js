const mysql = require('mysql2/promise');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
  throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function cleanProject() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'mis_academy'
  });

  try {
    console.log('--- INICIANDO LIMPIEZA FINAL DE MIS ACADEMY ---');

    // Desactivar restricciones de llaves foráneas para poder limpiar en cualquier orden
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    console.log('1. Limpiando transacciones...');
    const tablesToClear = [
      'carrito_compra',
      'carrito_item',
      'pagos',
      'detalle_pago',
      'certificaciones',
      'intentos_evaluacion',
      'respuestas_usuario',
      'progreso_estudiante',
      'inscripciones',
      'inscripciones_rutas',
      'comentarios_lecciones',
      'notificaciones'
    ];

    for (const table of tablesToClear) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`   - Tabla ${table} limpia.`);
      } catch (e) {
        console.warn(`   - Salto: La tabla ${table} no existe o ya está vacía.`);
      }
    }

    // 2. Usuarios a conservar
    console.log('2. Depurando usuarios...');
    const [users] = await connection.execute(
      'SELECT id_usuario FROM usuarios WHERE email IN (?, ?)', 
      ['admin@misacademy.com', 'elena.marketing@misacademy.come']
    );
    
    const idsToKeep = users.map(u => u.id_usuario);
    
    if (idsToKeep.length > 0) {
      await connection.execute(
        `DELETE FROM usuarios WHERE id_usuario NOT IN (${idsToKeep.join(',')})`
      );
      console.log(`   - Usuarios depurados. Conservados IDs: ${idsToKeep.join(', ')}`);
    }

    // 3. Asignar docente
    const [elenaRow] = await connection.execute('SELECT id_usuario FROM usuarios WHERE email = ?', ['elena.marketing@misacademy.come']);
    if (elenaRow.length > 0) {
      const elenaId = elenaRow[0].id_usuario;
      console.log(`3. Asignando a Elena (ID: ${elenaId}) a todos los cursos...`);
      await connection.execute('UPDATE cursos SET id_instructor = ?', [elenaId]);
    }

    // Reactivar restricciones
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n--- LIMPIEZA COMPLETADA ---');
    console.log('Tu academia está como nueva.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

cleanProject();

