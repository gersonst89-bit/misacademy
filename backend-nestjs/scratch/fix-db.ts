import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

async function fixDatabase() {
  dotenv.config({ path: join(__dirname, '../.env') });

  if (!process.env.DB_PASSWORD) {
    throw new Error('La variable de entorno DB_PASSWORD es obligatoria. Por favor configure el archivo .env.');
  }

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'mis_academy',
  });

  try {
    await dataSource.initialize();
    console.log('Conectado a la base de datos para reparación...');

    // 1. Añadir la columna id_curso si no existe
    console.log('Verificando columna id_curso en la tabla materiales...');
    const columns = await dataSource.query('SHOW COLUMNS FROM materiales LIKE "id_curso"');
    
    if (columns.length === 0) {
      console.log('Añadiendo columna id_curso...');
      await dataSource.query('ALTER TABLE materiales ADD COLUMN id_curso INT AFTER id_material');
      
      // Intentar poblar id_curso basándose en id_modulo si hay datos previos
      console.log('Poblando datos iniciales de id_curso...');
      await dataSource.query(`
        UPDATE materiales m 
        JOIN modulos mod ON m.id_modulo = mod.id_modulo 
        SET m.id_curso = mod.id_curso 
        WHERE m.id_curso IS NULL
      `);
    }

    // 2. Hacer que id_modulo sea nullable
    console.log('Haciendo que id_modulo sea opcional...');
    await dataSource.query('ALTER TABLE materiales MODIFY COLUMN id_modulo INT NULL');

    console.log('✅ Base de datos reparada exitosamente.');
    await dataSource.destroy();
  } catch (err) {
    console.error('❌ Error reparando la base de datos:', err.message);
    process.exit(1);
  }
}

fixDatabase();

