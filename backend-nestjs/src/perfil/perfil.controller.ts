import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';
import { multerOptions } from '../common/utils/multer.config';
import { PerfilService } from './perfil.service';
import { UpdatePerfilDto } from './dto/perfil.dto';

@Controller('perfil')
@UseGuards(JwtAuthGuard)
export class PerfilController {
  constructor(private readonly svc: PerfilService) {}

  @Get()
  getProfile(@CurrentUser() u: Usuario) {
    return this.svc.getProfile(u.id_usuario);
  }

  @Put()
  @UseInterceptors(FileInterceptor('imagen_perfil', multerOptions))
  updateProfile(
    @CurrentUser() u: Usuario,
    @Body() dto: UpdatePerfilDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imgPath = file ? `storage/perfiles/${file.filename}` : undefined;
    return this.svc.updateProfile(u.id_usuario, dto, imgPath);
  }
}
