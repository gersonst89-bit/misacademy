import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Header,
} from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { AgregarItemDto } from './dto/carrito.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('carrito')
@UseGuards(JwtAuthGuard)
export class CarritoController {
  constructor(private readonly svc: CarritoService) {}

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getItems(@CurrentUser() u: Usuario) {
    const items = await this.svc.getItems(u.id_usuario);
    return { status: 'success', data: { items } };
  }
  @Post('agregar') agregar(
    @CurrentUser() u: Usuario,
    @Body() dto: AgregarItemDto,
  ) {
    return this.svc.agregar(u.id_usuario, dto);
  }
  @Delete('vaciar') vaciar(@CurrentUser() u: Usuario) {
    return this.svc.vaciar(u.id_usuario);
  }
  @Delete(':itemId') quitar(
    @CurrentUser() u: Usuario,
    @Param('itemId') id: number,
  ) {
    return this.svc.quitar(u.id_usuario, id);
  }
}
