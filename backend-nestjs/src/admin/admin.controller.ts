import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.config';
import { AdminService } from './admin.service';
import { CreateUsuarioDto, UpdateUsuarioDto, CreateMaterialDto, UpdateMaterialDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard, AdminOrDocenteGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('admin/usuarios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsuariosController {
  constructor(private readonly svc: AdminService) {}
  @Get() findAll(@Query() q: any) { return this.svc.findAllUsuarios(q); }
  @Post() create(@Body() dto: CreateUsuarioDto) { return this.svc.createUsuario(dto); }
  @Put(':id') update(@Param('id') id: number, @Body() dto: UpdateUsuarioDto) { return this.svc.updateUsuario(id, dto); }
  @Delete(':id') deactivate(@Param('id') id: number) { return this.svc.deactivateUsuario(id); }
  @Delete(':id/force') forceDelete(@Param('id') id: number, @CurrentUser() u: Usuario) { return this.svc.forceDeleteUsuario(id, u.id_usuario); }
}

@Controller('admin/auth-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAuthLogsController {
  constructor(private readonly svc: AdminService) {}
  @Get() findAll(@Query('page') p?: number) { return this.svc.getAuthLogs(p); }
}

@Controller('admin/materiales')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminMaterialesController {
  constructor(private readonly svc: AdminService) {}
  @Get() findAll(@Query('page') p?: number) { return this.svc.findAllMateriales(p); }
  
  @Post()
  @UseInterceptors(FileInterceptor('archivo', multerOptions))
  create(@Body() dto: CreateMaterialDto, @UploadedFile() file?: any) { 
    if (file) {
      dto.url_archivo = `storage/materiales/${file.filename}`;
    }
    return this.svc.createMaterial(dto); 
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('archivo', multerOptions))
  update(@Param('id') id: number, @Body() dto: UpdateMaterialDto, @UploadedFile() file?: any) { 
    if (file) {
      dto.url_archivo = `storage/materiales/${file.filename}`;
    }
    return this.svc.updateMaterial(id, dto); 
  }
  
  @Delete(':id') delete(@Param('id') id: number) { return this.svc.deleteMaterial(id); }
}

@Controller('auditoria')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditoriaController {
  constructor(private readonly svc: AdminService) {}

  @Get()
  async getAuditoria(@Query('page') page?: number) {
    return this.svc.getAuthLogs(page);
  }
}
