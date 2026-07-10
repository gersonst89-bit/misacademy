const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
  throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function purgeTestData() {
  console.log('🚀 INICIANDO LIMPIEZA PROFUNDA DE DATOS DE PRUEBA...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'mis_academy'
  });

  try {
    // 1. Desactivar checks de llaves foráneas
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    const tablesToClear = [
      // Estudiante / Transaccional
      'carrito_item',
      'carrito_compra',
      'detalle_pago',
      'pagos',
      'certificaciones',
      'inscripciones',
      'inscripciones_rutas',
      'progreso_estudiante',
      'notificaciones',
      'comentarios_lecciones',
      'valoraciones',
      'resenas',
      
      // Evaluaciones (Datos de prueba solicitados)
      'intentos_evaluacion',
      'respuestas_usuario',
      'opciones_respuesta',
      'preguntas',
      'evaluaciones',
      
      // Contenido (Datos de prueba solicitados)
      'materiales'
    ];

    console.log('\n📦 Vaciando tablas de la base de datos...');
    for (const table of tablesToClear) {
      try {
        const [result] = await connection.execute(`DELETE FROM ${table}`);
        console.log(`   ✅ Tabla ${table}: ${result.affectedRows} registros eliminados.`);
      } catch (e) {
        console.log(`   ⚠️ Salto: ${table} (No existe o error: ${e.message})`);
      }
    }

    // 2. Usuarios: Mantener Admin y Equipo Docente
    console.log('\n👥 Depurando usuarios...');
    const usersToKeep = [
      'admin@misacademy.com',
      'ana.frontend@misacademy.com',
      'carlos.ia@misacademy.com',
      'sofia.design@misacademy.com',
      'david.security@misacademy.com',
      'elena.marketing@misacademy.com'
    ];
    
    // Buscar usuarios a eliminar
    const [rows] = await connection.execute(
      'SELECT id_usuario, email FROM usuarios WHERE email NOT IN (?, ?, ?, ?, ?, ?)',
      usersToKeep
    );

    if (rows.length > 0) {
      const idsToDelete = rows.map(u => u.id_usuario);
      const [delResult] = await connection.execute(
        `DELETE FROM usuarios WHERE id_usuario IN (${idsToDelete.join(',')})`
      );
      console.log(`   ✅ Usuarios eliminados: ${delResult.affectedRows}.`);
      rows.forEach(u => console.log(`      - Eliminado: ${u.email}`));
    } else {
      console.log('   ℹ️ No se encontraron usuarios adicionales para eliminar.');
    }

    // 3. Limpiar archivos físicos (Uploads)
    console.log('\n📁 Limpiando archivos en uploads...');
    const foldersToClear = [
      'uploads/materiales',
      'uploads/comprobantes'
    ];

    for (const folder of foldersToClear) {
      const fullPath = path.join(__dirname, folder);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        let count = 0;
        for (const file of files) {
          if (file !== '.gitignore') {
            try {
              fs.unlinkSync(path.join(fullPath, file));
              count++;
            } catch (err) {}
          }
        }
        console.log(`   ✅ Carpeta ${folder}: ${count} archivos eliminados.`);
      } else {
        console.log(`   ⚠️ Carpeta ${folder} no encontrada.`);
      }
    }

    // 4. Reactivar checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✨ LIMPIEZA COMPLETADA CON ÉXITO.');
    console.log('La academia ha sido restaurada a un estado limpio.');
    console.log('Usuarios conservados (Admin + 5 Docentes).');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA LIMPIEZA:', error);
  } finally {
    await connection.end();
  }
}

purgeTestData();

