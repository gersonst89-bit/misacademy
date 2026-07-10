import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from './pagos.service';
import { PagosRepository } from './pagos.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inscripcion } from '../entities/inscripcion.entity';
import { InscripcionRuta } from '../entities/inscripcion-ruta.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';

describe('PagosService', () => {
  let service: PagosService;

  beforeEach(async () => {
    const mockPagosRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsuario: jest.fn(),
      create: jest.fn(),
      updateEstado: jest.fn(),
    };

    const mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        { provide: PagosRepository, useValue: mockPagosRepository },
        { provide: getRepositoryToken(Inscripcion), useValue: mockRepository },
        { provide: getRepositoryToken(InscripcionRuta), useValue: mockRepository },
        { provide: getRepositoryToken(RutaAcademica), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
