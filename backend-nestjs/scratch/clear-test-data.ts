import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as entities from '../src/entities';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

if (!process.env.DB_PASSWORD) {
  throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
}

async function cleanDatabase() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'siteadmin_mis_academy',
    entities: Object.values(entities),
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('🔌 Conectado a la base de datos para iniciar la limpieza...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Obtener los IDs de los usuarios Administradores, Instructores y Docentes que queremos conservar
    const staffUsers = await queryRunner.manager.query(`
      SELECT u.id_usuario FROM usuarios u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      WHERE r.nombre_rol IN ('Administrador', 'Instructor', 'Docente')
    `);
    const staffIds = staffUsers.map((u: any) => u.id_usuario);
    console.log(`👨‍🏫 Usuarios del personal encontrados (a conservar): ${staffIds.join(', ')}`);

    // 2. Eliminar respuestas de usuario (respuestas_usuario)
    console.log('🗑️ Limpiando respuestas de usuario...');
    await queryRunner.manager.query('DELETE FROM respuestas_usuario');

    // 3. Eliminar intentos de evaluación (intentos_evaluacion)
    console.log('🗑️ Limpiando intentos de evaluación...');
    await queryRunner.manager.query('DELETE FROM intentos_evaluacion');

    // 4. Eliminar opciones de respuesta (opciones_respuesta)
    console.log('🗑️ Limpiando opciones de respuesta de los exámenes...');
    await queryRunner.manager.query('DELETE FROM opciones_respuesta');

    // 5. Eliminar preguntas de examen (preguntas)
    console.log('🗑️ Limpiando preguntas de los exámenes...');
    await queryRunner.manager.query('DELETE FROM preguntas');

    // 6. Eliminar exámenes/evaluaciones (evaluaciones)
    console.log('🗑️ Limpiando exámenes (evaluaciones)...');
    await queryRunner.manager.query('DELETE FROM evaluaciones');

    // 7. Eliminar certificados (certificaciones)
    console.log('🗑️ Limpiando certificados...');
    await queryRunner.manager.query('DELETE FROM certificaciones');

    // 8. Eliminar progreso de estudiantes (progreso_estudiante)
    console.log('🗑️ Limpiando registros de progreso de estudiantes...');
    await queryRunner.manager.query('DELETE FROM progreso_estudiante');

    // 9. Eliminar inscripciones a rutas académicas (inscripciones_rutas)
    console.log('🗑️ Limpiando inscripciones a rutas...');
    await queryRunner.manager.query('DELETE FROM inscripciones_rutas');

    // 10. Eliminar inscripciones a cursos (inscripciones)
    console.log('🗑️ Limpiando inscripciones a cursos...');
    await queryRunner.manager.query('DELETE FROM inscripciones');

    // 11. Eliminar ítems de carritos de compras (carrito_items)
    console.log('🗑️ Limpiando ítems de carritos...');
    await queryRunner.manager.query('DELETE FROM carrito_items');

    // 12. Eliminar carritos de compras (carrito_compras)
    console.log('🗑️ Limpiando carritos de compra...');
    await queryRunner.manager.query('DELETE FROM carrito_compras');

    // 13. Eliminar detalles de pagos (detalle_pagos)
    console.log('🗑️ Limpiando detalles de pagos...');
    await queryRunner.manager.query('DELETE FROM detalle_pagos');

    // 14. Eliminar pagos (pagos)
    console.log('🗑️ Limpiando registros de pagos...');
    await queryRunner.manager.query('DELETE FROM pagos');

    // 15. Eliminar comentarios en lecciones (comentarios_leccion) de usuarios no docentes/admin
    console.log('🗑️ Limpiando comentarios de lecciones...');
    if (staffIds.length > 0) {
      await queryRunner.manager.query('DELETE FROM comentarios_leccion WHERE id_usuario NOT IN (?)', [staffIds]);
    } else {
      await queryRunner.manager.query('DELETE FROM comentarios_leccion');
    }

    // 16. Eliminar reseñas de cursos (resenas)
    console.log('🗑️ Limpiando reseñas de cursos...');
    await queryRunner.manager.query('DELETE FROM resenas');

    // 17. Eliminar sesiones, notificaciones, logs de auditoría, tokens y reclamaciones
    console.log('🗑️ Limpiando sesiones, notificaciones, logs, tokens y reclamaciones...');
    
    // Reclamaciones y authentication_log no tienen id_usuario directo, así que las limpiamos por completo
    await queryRunner.manager.query('DELETE FROM reclamaciones');
    await queryRunner.manager.query('DELETE FROM authentication_log');

    if (staffIds.length > 0) {
      await queryRunner.manager.query('DELETE FROM sesiones_usuario WHERE id_usuario NOT IN (?)', [staffIds]);
      await queryRunner.manager.query('DELETE FROM tokens_usuario WHERE id_usuario NOT IN (?)', [staffIds]);
      await queryRunner.manager.query('DELETE FROM audit_logs WHERE id_usuario NOT IN (?)', [staffIds]);
      await queryRunner.manager.query('DELETE FROM notificaciones WHERE id_usuario NOT IN (?)', [staffIds]);
    } else {
      await queryRunner.manager.query('DELETE FROM sesiones_usuario');
      await queryRunner.manager.query('DELETE FROM tokens_usuario');
      await queryRunner.manager.query('DELETE FROM audit_logs');
      await queryRunner.manager.query('DELETE FROM notificaciones');
    }

    // 18. Eliminar los usuarios de prueba (todos excepto administradores, instructores y docentes)
    console.log('🗑️ Limpiando usuarios de prueba...');
    if (staffIds.length > 0) {
      await queryRunner.manager.query('DELETE FROM usuarios WHERE id_usuario NOT IN (?)', [staffIds]);
    } else {
      await queryRunner.manager.query('DELETE FROM usuarios');
    }

    await queryRunner.commitTransaction();
    console.log('✨ Base de datos limpia con éxito. Se preservaron los cursos, módulos, lecciones y usuarios del staff.');
  } catch (error) {
    console.error('❌ Error durante la limpieza, deshaciendo cambios:', error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

cleanDatabase();
