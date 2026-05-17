import { Controller, Get, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/roles.guard';
@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly svc: EstadisticasService) {}
  
  @Get('dashboard') getDashboard() { return this.svc.getDashboard(); }
  
  @Get('estudiantes/por-linea') getPorLinea() { return this.svc.getEstudiantesPorLinea(); }
  
  @Get('usuarios/retencion-mensual') getRetencion() { return this.svc.getRetencionMensual(); }
  
  @Get('cursos/mas-vendidos-mes') getMasVendidos() { return this.svc.getMasVendidosMes(); }
}
