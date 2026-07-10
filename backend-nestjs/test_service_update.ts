import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CursosService } from './src/cursos/cursos.service';
import { DataSource } from 'typeorm';
import { Curso } from './src/entities/curso.entity';

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(CursosService);
  const dataSource = app.get(DataSource);
  const repo = dataSource.getRepository(Curso);

  try {
    // 1. Encontrar un curso existente
    const course = await repo.findOne({ where: {} });
    if (!course) {
      console.log('No se encontraron cursos en la base de datos.');
      return;
    }

    console.log('Curso original:', {
      id_curso: course.id_curso,
      nombre: course.nombre,
      duracion_horas: course.duracion_horas,
      tiempo: course.tiempo,
    });

    const targetId = course.id_curso;
    const newHoras = (course.duracion_horas || 0) + 2;
    const newTiempo = (course.tiempo || 0) + 1;

    console.log(`Llamando a CursosService.update con duracion_horas=${newHoras}, tiempo=${newTiempo}`);
    
    // Simular los datos que enviaría el controlador
    const updatedCourse = await service.update(targetId, {
      nombre: course.nombre,
      duracion_horas: newHoras,
      tiempo: newTiempo,
    });

    console.log('Curso retornado por CursosService.update:', {
      id_curso: updatedCourse?.id_curso,
      nombre: updatedCourse?.nombre,
      duracion_horas: updatedCourse?.duracion_horas,
      tiempo: updatedCourse?.tiempo,
    });

    // 2. Verificar directamente en la base de datos para estar 100% seguros
    const dbCourse = await repo.findOne({ where: { id_curso: targetId } });
    console.log('Curso leído directamente de la base de datos después de la actualización:', {
      id_curso: dbCourse?.id_curso,
      nombre: dbCourse?.nombre,
      duracion_horas: dbCourse?.duracion_horas,
      tiempo: dbCourse?.tiempo,
    });

  } catch (error) {
    console.error('Error durante la prueba de CursosService:', error);
  } finally {
    await app.close();
  }
}

test();
