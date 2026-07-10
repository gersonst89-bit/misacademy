import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

async function checkColumns() {
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
    console.log('Conectado a la base de datos...');
    const columns = await dataSource.query('SHOW COLUMNS FROM certificaciones');
    console.log('COLUMNAS DE LA TABLA CERTIFICACIONES:');
    console.log(JSON.stringify(columns, null, 2));
    await dataSource.destroy();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkColumns();

