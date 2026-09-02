import { Test, TestingModule } from '@nestjs/testing';

import { CarritoService } from './carrito.service';
import { CarritoRepository } from './carrito.repository';

describe('CarritoService', () => {
  let service: CarritoService;

  let repo: {
    getItems: jest.Mock;
    agregarItem: jest.Mock;
    quitarItem: jest.Mock;
    vaciar: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      getItems: jest.fn(),
      agregarItem: jest.fn(),
      quitarItem: jest.fn(),
      vaciar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarritoService,
        {
          provide: CarritoRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<CarritoService>(CarritoService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // GET ITEMS
  // ============================================================

  it('debe devolver los items del carrito', async () => {
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

    repo.getItems.mockResolvedValue(items);

    const result = await service.getItems(10);

    expect(result).toEqual(items);

    expect(repo.getItems).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // AGREGAR
  // ============================================================

  it('debe agregar un curso al carrito', async () => {
    const dto = {
      id_curso: 681,
    };

    const item = {
      id_item: 1,
      id_carrito: 10,
      id_curso: 681,
      precio: 99,
    };

    repo.agregarItem.mockResolvedValue(item);

    const result = await service.agregar(10, dto as any);

    expect(result).toEqual(item);

    expect(repo.agregarItem).toHaveBeenCalledWith(10, 681, undefined);
  });

  it('debe agregar una ruta al carrito', async () => {
    const dto = {
      id_ruta: 749,
    };

    const item = {
      id_item: 2,
      id_carrito: 10,
      id_ruta: 749,
      precio: 199,
    };

    repo.agregarItem.mockResolvedValue(item);

    const result = await service.agregar(10, dto as any);

    expect(result).toEqual(item);

    expect(repo.agregarItem).toHaveBeenCalledWith(10, undefined, 749);
  });

  it('debe delegar correctamente cuando el DTO trae ambos identificadores', async () => {
    const dto = {
      id_curso: 681,
      id_ruta: 749,
    };

    repo.agregarItem.mockResolvedValue({
      id_item: 3,
    });

    const result = await service.agregar(10, dto as any);

    expect(result).toEqual({
      id_item: 3,
    });

    expect(repo.agregarItem).toHaveBeenCalledWith(10, 681, 749);
  });

  // ============================================================
  // QUITAR
  // ============================================================

  it('debe quitar un item del carrito', async () => {
    repo.quitarItem.mockResolvedValue(undefined);

    const result = await service.quitar(10, 50);

    expect(result).toEqual({
      message: 'Item removido',
    });

    expect(repo.quitarItem).toHaveBeenCalledWith(10, 50);
  });

  // ============================================================
  // VACIAR
  // ============================================================

  it('debe vaciar el carrito', async () => {
    repo.vaciar.mockResolvedValue(undefined);

    const result = await service.vaciar(10);

    expect(result).toEqual({
      message: 'Carrito vaciado',
    });

    expect(repo.vaciar).toHaveBeenCalledWith(10);
  });
});
