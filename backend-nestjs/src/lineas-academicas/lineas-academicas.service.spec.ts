import { Test, TestingModule } from '@nestjs/testing';

import { LineasAcademicasService } from './lineas-academicas.service';
import { LineasAcademicasRepository } from './lineas-academicas.repository';

describe('LineasAcademicasService', () => {
  let service: LineasAcademicasService;

  let repo: {
    findAllLineas: jest.Mock;
    findLineaById: jest.Mock;
    findLineaBySlug: jest.Mock;
    createLinea: jest.Mock;
    updateLinea: jest.Mock;
    deleteLinea: jest.Mock;

    findAllRutas: jest.Mock;
    findAllRutasAdmin: jest.Mock;
    findRutaById: jest.Mock;
    findRutasDestacadas: jest.Mock;
    buscarRutas: jest.Mock;
    createRuta: jest.Mock;
    updateRuta: jest.Mock;
    deleteRuta: jest.Mock;
    findRutaBySlug: jest.Mock;

    findLineasMenu: jest.Mock;
    findRutasMenu: jest.Mock;
    findLineaByCursoId: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findAllLineas: jest.fn(),
      findLineaById: jest.fn(),
      findLineaBySlug: jest.fn(),
      createLinea: jest.fn(),
      updateLinea: jest.fn(),
      deleteLinea: jest.fn(),

      findAllRutas: jest.fn(),
      findAllRutasAdmin: jest.fn(),
      findRutaById: jest.fn(),
      findRutasDestacadas: jest.fn(),
      buscarRutas: jest.fn(),
      createRuta: jest.fn(),
      updateRuta: jest.fn(),
      deleteRuta: jest.fn(),
      findRutaBySlug: jest.fn(),

      findLineasMenu: jest.fn(),
      findRutasMenu: jest.fn(),
      findLineaByCursoId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineasAcademicasService,
        {
          provide: LineasAcademicasRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<LineasAcademicasService>(LineasAcademicasService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // LINEAS
  // ============================================================

  it('debe devolver líneas académicas paginadas', async () => {
    const expected = {
      data: [
        {
          id_linea_academica: 1,
          nombre: 'Tecnología',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    };

    repo.findAllLineas.mockResolvedValue(expected);

    const query = {
      estado: 'Publicado',
      page: 1,
      per_page: 15,
    };

    const result = await service.findAllLineas(query);

    expect(result).toEqual(expected);

    expect(repo.findAllLineas).toHaveBeenCalledWith(query, 1, 15);
  });

  it('debe devolver una línea académica existente', async () => {
    const linea = {
      id_linea_academica: 1,
      nombre: 'Tecnología',
      rutas_academicas: [],
    };

    repo.findLineaById.mockResolvedValue(linea);

    const result = await service.findLineaById(1);

    expect(result).toEqual(linea);

    expect(repo.findLineaById).toHaveBeenCalledWith(1);
  });

  it('debe rechazar una línea académica inexistente', async () => {
    repo.findLineaById.mockResolvedValue(null);

    await expect(service.findLineaById(999)).rejects.toThrow(
      'Línea no encontrada',
    );

    expect(repo.findLineaById).toHaveBeenCalledWith(999);
  });

  it('debe devolver una línea académica por slug', async () => {
    const linea = {
      id_linea_academica: 1,
      nombre: 'Tecnología',
      slug: 'tecnologia',
    };

    repo.findLineaBySlug.mockResolvedValue(linea);

    const result = await service.findLineaBySlug('tecnologia');

    expect(result).toEqual(linea);

    expect(repo.findLineaBySlug).toHaveBeenCalledWith('tecnologia');
  });

  it('debe rechazar una línea por slug inexistente', async () => {
    repo.findLineaBySlug.mockResolvedValue(null);

    await expect(service.findLineaBySlug('no-existe')).rejects.toThrow(
      'Línea no encontrada',
    );
  });

  it('debe crear una línea académica', async () => {
    const dto = {
      nombre: 'Tecnología',
      slug: 'tecnologia',
      estado: 'Publicado',
    };

    const created = {
      id_linea_academica: 1,
      ...dto,
    };

    repo.createLinea.mockResolvedValue(created);

    const result = await service.createLinea(dto as any);

    expect(result).toEqual(created);

    expect(repo.createLinea).toHaveBeenCalledWith(dto);
  });

  it('debe actualizar una línea académica', async () => {
    const dto = {
      nombre: 'Tecnología Actualizada',
    };

    const updated = {
      id_linea_academica: 1,
      nombre: 'Tecnología Actualizada',
    };

    repo.updateLinea.mockResolvedValue(updated);

    const result = await service.updateLinea(1, dto as any);

    expect(result).toEqual(updated);

    expect(repo.updateLinea).toHaveBeenCalledWith(1, dto);
  });

  it('debe eliminar una línea académica', async () => {
    repo.deleteLinea.mockResolvedValue(undefined);

    const result = await service.deleteLinea(1);

    expect(result).toEqual({
      message: 'Línea eliminada',
    });

    expect(repo.deleteLinea).toHaveBeenCalledWith(1);
  });

  // ============================================================
  // RUTAS
  // ============================================================

  it('debe devolver rutas académicas paginadas', async () => {
    const expected = {
      data: [
        {
          id_ruta: 10,
          nombre: 'Ruta Frontend',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    };

    repo.findAllRutas.mockResolvedValue(expected);

    const query = {
      nombre: 'Frontend',
      estado: 'Publicado',
      page: 1,
      per_page: 15,
    };

    const result = await service.findAllRutas(query);

    expect(result).toEqual(expected);

    expect(repo.findAllRutas).toHaveBeenCalledWith(query, 1, 15);
  });

  it('debe devolver rutas académicas para administración', async () => {
    const expected = {
      data: [],
      total: 0,
      current_page: 1,
      per_page: 10,
      last_page: 0,
    };

    repo.findAllRutasAdmin.mockResolvedValue(expected);

    const query = {
      page: 1,
      per_page: 10,
      estado: 'Activo',
    };

    const result = await service.findAllRutasAdmin(query);

    expect(result).toEqual(expected);

    expect(repo.findAllRutasAdmin).toHaveBeenCalledWith(query, 1, 10);
  });

  it('debe devolver una ruta académica existente', async () => {
    const ruta = {
      id_ruta: 10,
      nombre: 'Ruta Frontend',
    };

    repo.findRutaById.mockResolvedValue(ruta);

    const result = await service.findRutaById(10);

    expect(result).toEqual(ruta);

    expect(repo.findRutaById).toHaveBeenCalledWith(10);
  });

  it('debe rechazar una ruta académica inexistente', async () => {
    repo.findRutaById.mockResolvedValue(null);

    await expect(service.findRutaById(999)).rejects.toThrow(
      'Ruta no encontrada',
    );

    expect(repo.findRutaById).toHaveBeenCalledWith(999);
  });

  it('debe devolver las rutas destacadas', async () => {
    const rutas = [
      {
        id_ruta: 10,
        nombre: 'Ruta destacada',
        destacado: true,
      },
    ];

    repo.findRutasDestacadas.mockResolvedValue(rutas);

    const result = await service.findRutasDestacadas(5);

    expect(result).toEqual(rutas);

    expect(repo.findRutasDestacadas).toHaveBeenCalledWith(5);
  });

  it('debe buscar rutas', async () => {
    const expected = {
      data: [
        {
          id_ruta: 10,
          nombre: 'Frontend',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    };

    repo.buscarRutas.mockResolvedValue(expected);

    const result = await service.buscarRutas('Frontend', 1);

    expect(result).toEqual(expected);

    expect(repo.buscarRutas).toHaveBeenCalledWith('Frontend', 1);
  });

  it('debe crear una ruta académica', async () => {
    const dto = {
      nombre: 'Ruta Backend',
      id_linea_academica: 1,
      cursos: [681, 682],
    };

    const created = {
      id_ruta: 20,
      ...dto,
    };

    repo.createRuta.mockResolvedValue(created);

    const result = await service.createRuta(dto as any);

    expect(result).toEqual(created);

    expect(repo.createRuta).toHaveBeenCalledWith(dto);
  });

  it('debe actualizar una ruta académica', async () => {
    const dto = {
      nombre: 'Ruta Backend Actualizada',
    };

    const updated = {
      id_ruta: 20,
      nombre: 'Ruta Backend Actualizada',
    };

    repo.updateRuta.mockResolvedValue(updated);

    const result = await service.updateRuta(20, dto as any);

    expect(result).toEqual(updated);

    expect(repo.updateRuta).toHaveBeenCalledWith(20, dto);
  });

  it('debe eliminar una ruta académica', async () => {
    repo.deleteRuta.mockResolvedValue(undefined);

    const result = await service.deleteRuta(20);

    expect(result).toEqual({
      message: 'Ruta eliminada',
    });

    expect(repo.deleteRuta).toHaveBeenCalledWith(20);
  });

  it('debe devolver una ruta por slug', async () => {
    const ruta = {
      id_ruta: 20,
      nombre: 'Ruta Backend',
    };

    repo.findRutaBySlug.mockResolvedValue(ruta);

    const result = await service.findRutaBySlug('ruta-backend');

    expect(result).toEqual(ruta);

    expect(repo.findRutaBySlug).toHaveBeenCalledWith('ruta-backend');
  });

  it('debe rechazar una ruta por slug inexistente', async () => {
    repo.findRutaBySlug.mockResolvedValue(null);

    await expect(service.findRutaBySlug('ruta-no-existe')).rejects.toThrow(
      'Ruta no encontrada',
    );
  });

  // ============================================================
  // MENUS
  // ============================================================

  it('debe devolver el menú de líneas académicas', async () => {
    const menu = [
      {
        id_linea_academica: 1,
        nombre: 'Tecnología',
      },
    ];

    repo.findLineasMenu.mockResolvedValue(menu);

    const result = await service.findLineasMenu();

    expect(result).toEqual(menu);

    expect(repo.findLineasMenu).toHaveBeenCalled();
  });

  it('debe devolver el menú de rutas académicas', async () => {
    const menu = [
      {
        id_ruta: 10,
        nombre: 'Ruta Frontend',
      },
    ];

    repo.findRutasMenu.mockResolvedValue(menu);

    const result = await service.findRutasMenu();

    expect(result).toEqual(menu);

    expect(repo.findRutasMenu).toHaveBeenCalled();
  });

  it('debe devolver la línea académica asociada a un curso', async () => {
    const linea = {
      id_linea_academica: 1,
      nombre: 'Tecnología',
    };

    repo.findLineaByCursoId.mockResolvedValue(linea);

    const result = await service.findLineaByCursoId(681);

    expect(result).toEqual(linea);

    expect(repo.findLineaByCursoId).toHaveBeenCalledWith(681);
  });
});
