import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

async function inspectCourse() {
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
    const cursoId = 681; // Actualizado al curso de la captura
    console.log('\n=== INSPECCIONANDO CURSO ' + cursoId + ' ===');

    const modulos = await dataSource.query('SELECT id_modulo, titulo, estado FROM modulos WHERE id_curso = ?', [cursoId]);
    console.log('Modulos encontrados: ' + modulos.length);
    
    for (let i = 0; i < modulos.length; i++) {
      const mod = modulos[i];
      const lecciones = await dataSource.query('SELECT id_leccion, titulo, estado FROM lecciones WHERE id_modulo = ?', [mod.id_modulo]);
      console.log('  > Modulo: "' + mod.titulo + '" (ID: ' + mod.id_modulo + ', Estado: ' + mod.estado + ')');
      console.log('    Lecciones vinculadas: ' + lecciones.length);
      
      for (let j = 0; j < lecciones.length; j++) {
        const l = lecciones[j];
        console.log('      - [' + l.estado + '] ' + l.titulo + ' (ID: ' + l.id_leccion + ')');
      }
    }

    await dataSource.destroy();
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

inspectCourse();

