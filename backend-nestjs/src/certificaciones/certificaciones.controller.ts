import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { CertificacionesService } from './certificaciones.service';
import { CreateCertificacionDto } from './dto/certificaciones.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('certificaciones')
export class CertificacionesController {
    constructor(private readonly svc: CertificacionesService) { }
    @Get('mis-certificados') @UseGuards(JwtAuthGuard) mine(@CurrentUser() u: Usuario) { return this.svc.findByUsuario(u.id_usuario); }
    @Get('buscar') buscar(@Query('buscar') q: string) { return this.svc.buscar(q); }
    @Get('buscar/:codigo') buscarPorCodigo(@Param('codigo') c: string) { return this.svc.buscarPorCodigo(c); }
    
    @Post('solicitar')
    @UseGuards(JwtAuthGuard)
    async solicitar(@Body() data: any, @CurrentUser() u: Usuario) {
        const id_curso = data.id_curso || data.cursoId;
        if (!id_curso) throw new HttpException('ID de curso no proporcionado', HttpStatus.BAD_REQUEST);

        // Verificar si el usuario aprobó el curso
        const aprobado = await this.svc.verificarAprobacion(u.id_usuario, id_curso);
        if (!aprobado) {
            throw new HttpException('No has aprobado la evaluación de este curso todavía', HttpStatus.BAD_REQUEST);
        }

        // Si aprobó, intentamos obtener el certificado (que debería haberse creado auto)
        // o lo creamos si falta.
        return this.svc.obtenerOCrear(u.id_usuario, id_curso);
    }

    @Get(':id') @UseGuards(JwtAuthGuard) findById(@Param('id') id: number) { return this.svc.findById(id); }
}

@Controller('admin/certificaciones')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCertificacionesController {
    constructor(private readonly svc: CertificacionesService) { }
    @Get() findAll(@Query('page') p?: number) { return this.svc.findAll(p); }
    @Post() create(@Body() dto: CreateCertificacionDto) { return this.svc.create(dto); }
    @Get(':id') findById(@Param('id') id: number) { return this.svc.findById(id); }
    @Put(':id') update(@Param('id') id: number, @Body() dto: any) { return this.svc.update(id, dto); }
    @Delete(':id') delete(@Param('id') id: number) { return this.svc.delete(id); }
}
