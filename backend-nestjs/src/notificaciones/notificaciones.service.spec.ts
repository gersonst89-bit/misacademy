import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NotificacionesService } from './notificaciones.service';
import { Notificacion } from '../entities/notificacion.entity';

describe('NotificacionesService', () => {
  let service: NotificacionesService;

  let notificacionRepository: {
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    notificacionRepository = {
      find: jest.fn(),
      create: jest.fn((data: any) => data),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        {
          provide: getRepositoryToken(Notificacion),
          useValue: notificacionRepository,
        },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe listar las notificaciones ordenadas por fecha de creación descendente', async () => {
    const notificaciones = [
      {
        id_notificacion: 2,
        id_usuario: 10,
        mensaje: 'Notificación reciente',
        leido: false,
      },
      {
        id_notificacion: 1,
        id_usuario: 10,
        mensaje: 'Notificación anterior',
        leido: true,
      },
    ];

    notificacionRepository.find.mockResolvedValue(notificaciones);

    const result = await service.listar();

    expect(result).toEqual(notificaciones);

    expect(notificacionRepository.find).toHaveBeenCalledWith({
      order: {
        fecha_creacion: 'DESC',
      },
    });
  });

  it('debe devolver un array vacío cuando no existen notificaciones', async () => {
    notificacionRepository.find.mockResolvedValue([]);

    const result = await service.listar();

    expect(result).toEqual([]);

    expect(notificacionRepository.find).toHaveBeenCalledWith({
      order: {
        fecha_creacion: 'DESC',
      },
    });
  });

  it('debe crear una notificación con leido en false y fecha automática', async () => {
    const notificacion = {
      id_notificacion: 10,
      id_usuario: 25,
      mensaje: 'Has completado el curso',
      leido: false,
      fecha_creacion: new Date(),
    };

    notificacionRepository.save.mockResolvedValue(notificacion);

    const result = await service.crear(25, 'Has completado el curso');

    expect(notificacionRepository.create).toHaveBeenCalledWith({
      id_usuario: 25,
      mensaje: 'Has completado el curso',
      leido: false,
      fecha_creacion: expect.any(Date),
    });

    expect(notificacionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 25,
        mensaje: 'Has completado el curso',
        leido: false,
        fecha_creacion: expect.any(Date),
      }),
    );

    expect(result).toEqual(notificacion);
  });

  it('debe devolver exactamente la notificación guardada', async () => {
    const created = {
      id_notificacion: 99,
      id_usuario: 50,
      mensaje: 'Nueva notificación',
      leido: false,
      fecha_creacion: new Date('2026-08-29T12:00:00.000Z'),
    };

    notificacionRepository.create.mockReturnValue(created);

    notificacionRepository.save.mockResolvedValue(created);

    const result = await service.crear(50, 'Nueva notificación');

    expect(result).toBe(created);

    expect(notificacionRepository.create).toHaveBeenCalledTimes(1);

    expect(notificacionRepository.save).toHaveBeenCalledTimes(1);
  });
});
