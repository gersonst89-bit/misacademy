import { DataSource } from 'typeorm';

export async function cleanDatabaseGarbage(
  dataSource: DataSource,
): Promise<void> {
  console.log(
    '🧹 Iniciando LIMPIEZA TOTAL de cursos para evitar duplicados...',
  );

  try {
    // Desactivar FK checks para poder limpiar todo
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

    console.log(
      '  🗑️  Vaciando todas las tablas relacionadas con cursos y rutas...',
    );

    const tables = [
      'valoraciones',
      'inscripciones',
      'carrito_items',
      'lecciones',
      'modulos',
      'curso_ruta',
      'cursos_rutas',
      'curso_tags',
      'resenas',
      'cursos',
      'rutas_academicas',
    ];

    for (const table of tables) {
      try {
        await dataSource.query(`DELETE FROM ${table}`);
        console.log(`    ✅ Tabla ${table} limpiada.`);
      } catch (e) {
        console.log(`    ⚠️  Saltando ${table} (posiblemente no existe).`);
      }
    }

    console.log('  ✅ Base de datos de cursos limpiada al 100%.');

    // Reactivar FK checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
  } catch (error) {
    console.error('  ❌ Error durante la limpieza total:', error);
    // Asegurarse de reactivar los checks incluso si hay error
    try {
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (e) {}
  }
}
