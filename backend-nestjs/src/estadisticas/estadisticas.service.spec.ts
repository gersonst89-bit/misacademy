import { Test, TestingModule } from '@nestjs/testing';

import { EstadisticasService } from './estadisticas.service';
import { EstadisticasRepository } from './estadisticas.repository';

describe('EstadisticasService', () => {
  let service: EstadisticasService;

  let repository: {
    getDashboard: jest.Mock;
    getEstudiantesPorLinea: jest.Mock;
    getRetencionMensual: jest.Mock;
    getMasVendidosMes: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repository = {
      getDashboard: jest.fn(),
      getEstudiantesPorLinea: jest.fn(),
      getRetencionMensual: jest.fn(),
      getMasVendidosMes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadisticasService,
        {
          provide: EstadisticasRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<EstadisticasService>(EstadisticasService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe devolver el dashboard', async () => {
    const dashboard = {
      totalUsuarios: 100,
      totalEstudiantes: 80,
      totalCursos: 20,
      totalCertificados: 50,
      totalInscripciones: 140,
      totalPagos: 110,
      ingresoTotal: '15000',
      inscripcionesRecientes: [],
      pagosRecientes: [],
    };

    repository.getDashboard.mockResolvedValue(dashboard);

    const result = await service.getDashboard();

    expect(result).toEqual(dashboard);

    expect(repository.getDashboard).toHaveBeenCalled();
  });

  it('debe devolver estudiantes por línea académica', async () => {
    const data = {
      status: 'success',
      lineas_academicas: [
        {
          nombre_linea: 'Inteligencia Artificial',
          total_estudiantes: 15,
        },
      ],
    };

    repository.getEstudiantesPorLinea.mockResolvedValue(data);

    const result = await service.getEstudiantesPorLinea();

    expect(result).toEqual(data);

    expect(repository.getEstudiantesPorLinea).toHaveBeenCalled();
  });

  it('debe devolver la retención mensual', async () => {
    const data = {
      status: 'success',
      mes_actual: 'agosto',
      porcentaje_retencion: '75%',
    };

    repository.getRetencionMensual.mockResolvedValue(data);

    const result = await service.getRetencionMensual();

    expect(result).toEqual(data);

    expect(repository.getRetencionMensual).toHaveBeenCalled();
  });

  it('debe devolver los cursos más vendidos', async () => {
    const data = {
      status: 'success',
      cursos_mas_vendidos: [
        {
          nombre_curso: 'Curso de IA',
          total_ventas: 25,
        },
      ],
    };

    repository.getMasVendidosMes.mockResolvedValue(data);

    const result = await service.getMasVendidosMes();

    expect(result).toEqual(data);

    expect(repository.getMasVendidosMes).toHaveBeenCalled();
  });
});
