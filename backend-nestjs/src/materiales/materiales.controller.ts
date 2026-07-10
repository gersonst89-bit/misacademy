import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CursoInscripcionGuard } from '../common/guards/curso-inscripcion.guard';

@Controller('materiales')
export class MaterialesController {
  constructor(private readonly materialesService: MaterialesService) {}

  @Get()
  async findAll(
    @Query('id_curso') cursoId?: number,
    @Query('id_modulo') moduloId?: number,
  ) {
    if (moduloId) {
      // Si hay módulo, devolvemos los del módulo + los generales del curso (opcionalmente)
      // O solo los del módulo si así se prefiere.
      // Para mayor flexibilidad, devolveremos ambos si tenemos cursoId.
      return this.materialesService.findByModulo(moduloId);
    }
    if (cursoId) {
      return this.materialesService.findByCurso(cursoId);
    }
    return [];
  }
}
