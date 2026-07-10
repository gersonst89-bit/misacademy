import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { LeccionesService } from './lecciones.service';
import {
    CreateLeccionDto,
    UpdateLeccionDto,
    CompletarLeccionDto,
    ComentarioDto,
    HeartbeatDto,
} from './dto/lecciones.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOrDocenteGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('lecciones')
export class LeccionesController {
    constructor(private readonly leccionesService: LeccionesService) { }

    @Get('modulo/:moduloId') findByModulo(@Param('moduloId') moduloId: number) {
        return this.leccionesService.findByModulo(moduloId);
    }
    @Get('curso/:cursoId') findByCurso(@Param('cursoId') cursoId: number) {
        return this.leccionesService.findByCurso(cursoId).then((data) => ({
            status: 'success',
            lecciones: { data },
        }));
    }
    @Get(':id') findById(@Param('id') id: number) {
        return this.leccionesService.findById(id);
    }
    @Get(':id/navegacion') @UseGuards(JwtAuthGuard) navegacion(
        @Param('id') id: number,
    ) {
        return this.leccionesService.navegacion(id);
    }
    @Get(':id/comentarios') getComentarios(@Param('id') id: number) {
        return this.leccionesService.getComentarios(id);
    }

    @Post(':id/completar')
    @UseGuards(JwtAuthGuard)
    completar(
        @Param('id') id: number,
        @CurrentUser() user: Usuario,
        @Body() dto: CompletarLeccionDto,
    ) {
        return this.leccionesService.completar(id, user.id_usuario, dto);
    }

    @Post(':id/comentarios')
    @UseGuards(JwtAuthGuard)
    addComentario(
        @Param('id') id: number,
        @CurrentUser() user: Usuario,
        @Body() dto: ComentarioDto,
    ) {
        return this.leccionesService.addComentario(id, user.id_usuario, dto);
    }

    @Delete('comentarios/:id')
    @UseGuards(JwtAuthGuard)
    deleteComentario(@Param('id') id: number) {
        return this.leccionesService.deleteComentario(id);
    }

    @Post('heartbeat')
    @UseGuards(JwtAuthGuard)
    heartbeat(@CurrentUser() user: Usuario, @Body() dto: HeartbeatDto) {
        return this.leccionesService.heartbeat(user.id_usuario, dto);
    }
}

@Controller('admin/lecciones')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminLeccionesController {
    constructor(private readonly leccionesService: LeccionesService) { }
    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('per_page') perPage?: number,
        @Query('q') query?: string,
        @Query('id_modulo') id_modulo?: number,
        @Query('estado') estado?: string,
    ) {
        return this.leccionesService.findAll(
            page,
            perPage,
            query,
            id_modulo,
            estado,
        );
    }
    @Post()
    async create(@Body() dto: CreateLeccionDto) {
        const leccion = await this.leccionesService.create(dto);
        return { leccion };
    }
    @Get(':id') findById(@Param('id') id: number) {
        return this.leccionesService.findById(id);
    }
    @Put(':id') update(@Param('id') id: number, @Body() dto: UpdateLeccionDto) {
        return this.leccionesService.update(id, dto);
    }
    @Delete(':id') delete(@Param('id') id: number) {
        return this.leccionesService.delete(id);
    }
}

