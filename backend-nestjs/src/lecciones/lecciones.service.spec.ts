import { Test, TestingModule } from '@nestjs/testing';

import { LeccionesService } from './lecciones.service';
import { LeccionesRepository } from './lecciones.repository';

describe('LeccionesService', () => {
  let service: LeccionesService;

  let repo: {
    findById: jest.Mock;
    findByModulo: jest.Mock;
    findByCurso: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    completar: jest.Mock;
    navegacion: jest.Mock;
    getComentarios: jest.Mock;
    addComentario: jest.Mock;
    deleteComentario: jest.Mock;
    heartbeat: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findById: jest.fn(),
      findByModulo: jest.fn(),
      findByCurso: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      completar: jest.fn(),
      navegacion: jest.fn(),
      getComentarios: jest.fn(),
      addComentario: jest.fn(),
      deleteComentario: jest.fn(),
      heartbeat: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeccionesService,
        {
          provide: LeccionesRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<LeccionesService>(LeccionesService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver una lección existente', async () => {
    const leccion = {
      id_leccion: 10,
      titulo: 'Introducción',
      id_modulo: 5,
    };

    repo.findById.mockResolvedValue(leccion);

    const result = await service.findById(10);

    expect(result).toEqual(leccion);

    expect(repo.findById).toHaveBeenCalledWith(10);
  });

  it('debe rechazar una lección inexistente', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(
      'Lección no encontrada',
    );

    expect(repo.findById).toHaveBeenCalledWith(999);
  });

  // ============================================================
  // FIND BY MODULO
  // ============================================================

  it('debe devolver las lecciones de un módulo', async () => {
    const lecciones = [
      {
        id_leccion: 1,
        id_modulo: 5,
        orden: 1,
      },
      {
        id_leccion: 2,
        id_modulo: 5,
        orden: 2,
      },
    ];

    repo.findByModulo.mockResolvedValue(lecciones);

    const result = await service.findByModulo(5);

    expect(result).toEqual(lecciones);

    expect(repo.findByModulo).toHaveBeenCalledWith(5);
  });

  // ============================================================
  // FIND BY CURSO
  // ============================================================

  it('debe devolver las lecciones de un curso', async () => {
    const lecciones = [
      {
        id_leccion: 1,
        id_modulo: 5,
      },
      {
        id_leccion: 2,
        id_modulo: 6,
      },
    ];

    repo.findByCurso.mockResolvedValue(lecciones);

    const result = await service.findByCurso(681);

    expect(result).toEqual(lecciones);

    expect(repo.findByCurso).toHaveBeenCalledWith(681);
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver lecciones filtradas y paginadas', async () => {
    const expected = {
      data: [
        {
          id_leccion: 10,
          titulo: 'Introducción',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    };

    repo.findAll.mockResolvedValue(expected);

    const result = await service.findAll(1, 20, 'Introducción', 5, 'Publicado');

    expect(result).toEqual(expected);

    expect(repo.findAll).toHaveBeenCalledWith(1, 20, {
      query: 'Introducción',
      id_modulo: 5,
      estado: 'Publicado',
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una lección', async () => {
    const dto = {
      id_modulo: 5,
      titulo: 'Nueva lección',
      contenido: 'Contenido',
      orden: 3,
    };

    const created = {
      id_leccion: 20,
      ...dto,
    };

    repo.create.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);

    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar una lección', async () => {
    const dto = {
      titulo: 'Lección actualizada',
    };

    const updated = {
      id_leccion: 20,
      titulo: 'Lección actualizada',
    };

    repo.update.mockResolvedValue(updated);

    const result = await service.update(20, dto as any);

    expect(result).toEqual(updated);

    expect(repo.update).toHaveBeenCalledWith(20, dto);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar una lección', async () => {
    repo.delete.mockResolvedValue(undefined);

    const result = await service.delete(20);

    expect(result).toEqual({
      message: 'Lección eliminada',
    });

    expect(repo.delete).toHaveBeenCalledWith(20);
  });

  // ============================================================
  // COMPLETAR
  // ============================================================

  it('debe completar una lección correctamente', async () => {
    const progreso = {
      id_progreso: 100,
      id_leccion: 20,
      estado: 'Completado',
      porcentaje_completado: 100,
    };

    repo.completar.mockResolvedValue(progreso);

    const dto = {
      porcentaje_completado: 100,
    };

    const result = await service.completar(20, 10, dto as any);

    expect(result).toEqual({
      message: 'Lección completada',
      progreso,
    });

    expect(repo.completar).toHaveBeenCalledWith(20, 10, dto);
  });

  it('debe rechazar completar una lección cuando no se puede registrar el progreso', async () => {
    repo.completar.mockResolvedValue(null);

    await expect(service.completar(20, 10, {} as any)).rejects.toThrow(
      'No se pudo completar la lección',
    );

    expect(repo.completar).toHaveBeenCalled();
  });

  // ============================================================
  // NAVIGATION
  // ============================================================

  it('debe devolver la navegación de una lección', async () => {
    const navigation = {
      anterior: {
        id_leccion: 9,
      },
      actual: {
        id_leccion: 10,
      },
      siguiente: {
        id_leccion: 11,
      },
    };

    repo.navegacion.mockResolvedValue(navigation);

    const result = await service.navegacion(10);

    expect(result).toEqual(navigation);

    expect(repo.navegacion).toHaveBeenCalledWith(10);
  });

  it('debe rechazar la navegación cuando la lección no existe', async () => {
    repo.navegacion.mockResolvedValue(null);

    await expect(service.navegacion(999)).rejects.toThrow(
      'Lección no encontrada',
    );

    expect(repo.navegacion).toHaveBeenCalledWith(999);
  });

  // ============================================================
  // COMMENTS
  // ============================================================

  it('debe devolver los comentarios de una lección', async () => {
    const comentarios = [
      {
        id_comentario: 1,
        id_leccion: 20,
        contenido: 'Excelente',
      },
    ];

    repo.getComentarios.mockResolvedValue(comentarios);

    const result = await service.getComentarios(20);

    expect(result).toEqual(comentarios);

    expect(repo.getComentarios).toHaveBeenCalledWith(20);
  });

  it('debe agregar un comentario', async () => {
    const dto = {
      contenido: 'Muy buena clase',
    };

    const comentario = {
      id_comentario: 5,
      id_leccion: 20,
      id_usuario: 10,
      contenido: dto.contenido,
    };

    repo.addComentario.mockResolvedValue(comentario);

    const result = await service.addComentario(20, 10, dto as any);

    expect(result).toEqual(comentario);

    expect(repo.addComentario).toHaveBeenCalledWith(20, 10, dto.contenido);
  });

  it('debe eliminar un comentario', async () => {
    repo.deleteComentario.mockResolvedValue(undefined);

    const result = await service.deleteComentario(5);

    expect(result).toEqual({
      message: 'Comentario eliminado',
    });

    expect(repo.deleteComentario).toHaveBeenCalledWith(5);
  });

  // ============================================================
  // HEARTBEAT
  // ============================================================

  it('debe registrar el heartbeat de una lección', async () => {
    const dto = {
      id_leccion: 20,
      ultimo_segundo_visto: 120,
      segmentos_vistos: '0-60,61-120',
      duracion_video: 300,
      porcentaje_completado: 40,
    };

    const progreso = {
      id_progreso: 100,
      id_leccion: 20,
      estado: 'En Progreso',
      porcentaje_completado: 40,
    };

    repo.heartbeat.mockResolvedValue(progreso);

    const result = await service.heartbeat(10, dto as any);

    expect(result).toEqual(progreso);

    expect(repo.heartbeat).toHaveBeenCalledWith(10, dto);
  });

  it('debe devolver null cuando el heartbeat no puede registrar progreso', async () => {
    const dto = {
      id_leccion: 999,
    };

    repo.heartbeat.mockResolvedValue(null);

    const result = await service.heartbeat(10, dto as any);

    expect(result).toBeNull();

    expect(repo.heartbeat).toHaveBeenCalledWith(10, dto);
  });
});
