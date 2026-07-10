import { Injectable } from '@nestjs/common';
import { EstadisticasRepository } from './estadisticas.repository';
@Injectable()
export class EstadisticasService {
  constructor(private readonly repo: EstadisticasRepository) {}

  async getDashboard() {
    return this.repo.getDashboard();
  }

  async getEstudiantesPorLinea() {
    return this.repo.getEstudiantesPorLinea();
  }

  async getRetencionMensual() {
    return this.repo.getRetencionMensual();
  }

  async getMasVendidosMes() {
    return this.repo.getMasVendidosMes();
  }
}
