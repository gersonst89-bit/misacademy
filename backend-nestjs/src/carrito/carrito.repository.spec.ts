import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CarritoRepository } from './carrito.repository';

import { CarritoCompra } from '../entities/carrito-compra.entity';
import { CarritoItem } from '../entities/carrito-item.entity';
import { Curso } from '../entities/curso.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';

describe('CarritoRepository', () => {
  let repository: CarritoRepository;

  let carritoRepo: any;
  let itemRepo: any;
  let cursoRepo: any;
  let rutaRepo: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    carritoRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
    };

    itemRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      delete: jest.fn(),
    };

    cursoRepo = {
      findOne: jest.fn(),
    };

    rutaRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarritoRepository,
        {
          provide: getRepositoryToken(CarritoCompra),
          useValue: carritoRepo,
        },
        {
          provide: getRepositoryToken(CarritoItem),
          useValue: itemRepo,
        },
        {
          provide: getRepositoryToken(Curso),
          useValue: cursoRepo,
        },
        {
          provide: getRepositoryToken(RutaAcademica),
          useValue: rutaRepo,
        },
      ],
    }).compile();

    repository = module.get<CarritoRepository>(CarritoRepository);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // GET OR CREATE
  // ============================================================

  it('debe devolver el carrito activo existente del usuario', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    carritoRepo.findOne.mockResolvedValue(carrito);

    const result = await repository.getOrCreate(25);

    expect(result).toEqual(carrito);

    expect(carritoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 25,
        estado: 'activo',
      },
    });

    expect(carritoRepo.save).not.toHaveBeenCalled();

    expect(carritoRepo.create).not.toHaveBeenCalled();
  });

  it('debe crear un carrito activo cuando el usuario no tiene uno', async () => {
    const carritoCreado = {
      id_carrito: 11,
      id_usuario: 25,
      estado: 'activo',
    };

    carritoRepo.findOne.mockResolvedValue(null);

    carritoRepo.create.mockImplementation((data: any) => data);

    carritoRepo.save.mockResolvedValue(carritoCreado);

    const before = Date.now();

    const result = await repository.getOrCreate(25);

    const after = Date.now();

    expect(carritoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 25,
        estado: 'activo',
        created_at: expect.any(Date),
      }),
    );

    const payload = carritoRepo.create.mock.calls[0][0];

    expect(payload.created_at.getTime()).toBeGreaterThanOrEqual(before);

    expect(payload.created_at.getTime()).toBeLessThanOrEqual(after);

    expect(carritoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 25,
        estado: 'activo',
        created_at: expect.any(Date),
      }),
    );

    expect(result).toEqual(carritoCreado);
  });

  // ============================================================
  // GET ITEMS
  // ============================================================

  it('debe devolver los items del carrito con curso y ruta', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    const items = [
      {
        id_item: 1,
        id_carrito: 10,
        id_curso: 681,
        precio: 99,
      },
      {
        id_item: 2,
        id_carrito: 10,
        id_ruta: 749,
        precio: 199,
      },
    ];

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.find.mockResolvedValue(items);

    const result = await repository.getItems(25);

    expect(result).toEqual(items);

    expect(repository.getOrCreate).toHaveBeenCalledWith(25);

    expect(itemRepo.find).toHaveBeenCalledWith({
      where: {
        id_carrito: 10,
      },
      relations: ['curso', 'ruta'],
    });
  });

  // ============================================================
  // AGREGAR CURSO
  // ============================================================

  it('debe devolver el item existente cuando el curso ya está en el carrito', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    const itemExistente = {
      id_item: 50,
      id_carrito: 10,
      id_curso: 681,
      precio: 99,
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.findOne.mockResolvedValue(itemExistente);

    const result = await repository.agregarItem(25, 681);

    expect(result).toEqual(itemExistente);

    expect(itemRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_carrito: 10,
        id_curso: 681,
      },
    });

    expect(cursoRepo.findOne).not.toHaveBeenCalled();

    expect(itemRepo.save).not.toHaveBeenCalled();
  });

  it('debe agregar un curso nuevo usando su precio', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    const curso = {
      id_curso: 681,
      precio: 149.9,
    };

    const itemCreado = {
      id_item: 51,
      id_carrito: 10,
      id_curso: 681,
      precio: 149.9,
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.findOne.mockResolvedValue(null);

    cursoRepo.findOne.mockResolvedValue(curso);

    itemRepo.create.mockImplementation((data: any) => data);

    itemRepo.save.mockResolvedValue(itemCreado);

    const result = await repository.agregarItem(25, 681);

    expect(cursoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_curso: 681,
      },
    });

    expect(itemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_carrito: 10,
        id_curso: 681,
        precio: 149.9,
        created_at: expect.any(Date),
      }),
    );

    expect(itemRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_carrito: 10,
        id_curso: 681,
        precio: 149.9,
        created_at: expect.any(Date),
      }),
    );

    expect(result).toEqual(itemCreado);
  });

  it('debe usar precio 0 cuando el curso no existe', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    const itemCreado = {
      id_item: 52,
      id_carrito: 10,
      id_curso: 999,
      precio: 0,
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.findOne.mockResolvedValue(null);

    cursoRepo.findOne.mockResolvedValue(null);

    itemRepo.create.mockImplementation((data: any) => data);

    itemRepo.save.mockResolvedValue(itemCreado);

    const result = await repository.agregarItem(25, 999);

    expect(itemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_carrito: 10,
        id_curso: 999,
        precio: 0,
        created_at: expect.any(Date),
      }),
    );

    expect(result).toEqual(itemCreado);
  });

  // ============================================================
  // AGREGAR RUTA
  // ============================================================

  it('debe devolver el item existente cuando la ruta ya está en el carrito', async () => {
    const carrito = {
      id_carrito: 20,
      id_usuario: 30,
      estado: 'activo',
    };

    const itemExistente = {
      id_item: 60,
      id_carrito: 20,
      id_ruta: 749,
      precio: 199,
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.findOne.mockResolvedValue(itemExistente);

    const result = await repository.agregarItem(30, undefined, 749);

    expect(result).toEqual(itemExistente);

    expect(itemRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_carrito: 20,
        id_ruta: 749,
      },
    });

    expect(rutaRepo.findOne).not.toHaveBeenCalled();

    expect(itemRepo.save).not.toHaveBeenCalled();
  });

  it('debe agregar una ruta nueva usando su precio', async () => {
    const carrito = {
      id_carrito: 20,
      id_usuario: 30,
      estado: 'activo',
    };

    const ruta = {
      id_ruta: 749,
      precio: 299,
    };

    const itemCreado = {
      id_item: 61,
      id_carrito: 20,
      id_ruta: 749,
      precio: 299,
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.findOne.mockResolvedValue(null);

    rutaRepo.findOne.mockResolvedValue(ruta);

    itemRepo.create.mockImplementation((data: any) => data);

    itemRepo.save.mockResolvedValue(itemCreado);

    const result = await repository.agregarItem(30, undefined, 749);

    expect(rutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_ruta: 749,
      },
    });

    expect(itemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_carrito: 20,
        id_ruta: 749,
        precio: 299,
        created_at: expect.any(Date),
      }),
    );

    expect(itemRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_carrito: 20,
        id_ruta: 749,
        precio: 299,
        created_at: expect.any(Date),
      }),
    );

    expect(result).toEqual(itemCreado);
  });

  it('debe usar precio 0 cuando la ruta no existe', async () => {
    const carrito = {
      id_carrito: 20,
      id_usuario: 30,
      estado: 'activo',
    };

    const itemCreado = {
      id_item: 62,
      id_carrito: 20,
      id_ruta: 999,
      precio: 0,
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.findOne.mockResolvedValue(null);

    rutaRepo.findOne.mockResolvedValue(null);

    itemRepo.create.mockImplementation((data: any) => data);

    itemRepo.save.mockResolvedValue(itemCreado);

    const result = await repository.agregarItem(30, undefined, 999);

    expect(itemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_carrito: 20,
        id_ruta: 999,
        precio: 0,
        created_at: expect.any(Date),
      }),
    );

    expect(result).toEqual(itemCreado);
  });

  // ============================================================
  // CASO SIN CURSO NI RUTA
  // ============================================================

  it('debe devolver undefined cuando no se proporciona curso ni ruta', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    const result = await repository.agregarItem(25);

    expect(result).toBeUndefined();

    expect(itemRepo.findOne).not.toHaveBeenCalled();

    expect(cursoRepo.findOne).not.toHaveBeenCalled();

    expect(rutaRepo.findOne).not.toHaveBeenCalled();

    expect(itemRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // QUITAR ITEM
  // ============================================================

  it('debe quitar un item perteneciente al carrito del usuario', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.quitarItem(25, 50);

    expect(itemRepo.delete).toHaveBeenCalledWith({
      id_carrito: 10,
      id_item: 50,
    });
  });

  // ============================================================
  // VACIAR
  // ============================================================

  it('debe vaciar todos los items del carrito del usuario', async () => {
    const carrito = {
      id_carrito: 10,
      id_usuario: 25,
      estado: 'activo',
    };

    jest.spyOn(repository, 'getOrCreate').mockResolvedValue(carrito as any);

    itemRepo.delete.mockResolvedValue({
      affected: 3,
    });

    await repository.vaciar(25);

    expect(itemRepo.delete).toHaveBeenCalledWith({
      id_carrito: 10,
    });
  });
});
