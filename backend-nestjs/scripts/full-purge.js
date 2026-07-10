const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
  throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function fullPurge() {
  console.log('🚀 INICIANDO PURGA TOTAL DE DATOS DE PRUEBA...');
  
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
      // Evaluaciones y sus componentes
      'intentos_evaluacion',
      'respuestas_usuario',
      'opciones_respuesta',
      'preguntas',
      'evaluaciones',
      
      // Contenido y recursos
      'materiales',
      'comentarios_lecciones',
      'progreso_estudiante',
      'notificaciones',
      
      // Comercial y Transaccional
      'carrito_item',
      'carrito_compra',
      'detalle_pago',
      'pagos',
      'certificaciones',
      'inscripciones',
      'inscripciones_rutas'
    ];

    console.log('📦 Limpiando tablas transaccionales y de contenido...');
    for (const table of tablesToClear) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`   ✅ Tabla ${table} vaciada.`);
      } catch (e) {
        console.log(`   ⚠️ Salto: ${table} (${e.message})`);
      }
    }

    // 2. Usuarios: Solo dejar al Admin
    console.log('👥 Depurando usuarios...');
    const adminEmail = 'admin@misacademy.com';
    
    // Buscar ID del admin para estar seguros
    const [adminRows] = await connection.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [adminEmail]);
    
    if (adminRows.length > 0) {
      const adminId = adminRows[0].id_usuario;
      const [delResult] = await connection.execute(
        'DELETE FROM usuarios WHERE id_usuario <> ?',
        [adminId]
      );
      console.log(`   ✅ Usuarios eliminados: ${delResult.affectedRows}. Solo queda el Admin (ID: ${adminId}).`);
    } else {
      console.warn('   ❌ ERROR: No se encontró al usuario admin@misacademy.com');
    }

    // 3. Limpiar tokens y sesiones
    try {
      await connection.execute('DELETE FROM personal_access_tokens');
      console.log('   ✅ Tokens de acceso eliminados.');
    } catch (e) {}

    // 4. Reactivar checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✨ PURGA COMPLETADA CON ÉXITO.');
    console.log('La academia ha vuelto a su estado inicial limpio.');

  } catch (error) {
    console.error('❌ ERROR CRÍTICO DURANTE LA PURGA:', error);
  } finally {
    await connection.end();
  }
}

fullPurge();

