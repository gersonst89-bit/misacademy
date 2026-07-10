import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PagosService } from './pagos.service';
import {
  CreatePagoDto,
  UpdatePagoDto,
  CreateTipoPagoDto,
} from './dto/pagos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

// Configuración segura para comprobantes de pago
const comprobanteMulterOptions = {
  storage: diskStorage({
    destination: './uploads/comprobantes',
    filename: (req: any, file: any, cb: any) => {
      cb(null, `${uuidv4()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    // Solo imágenes y PDF son formatos válidos para comprobantes
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp|pdf)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          'Formato de archivo no soportado. Solo se permiten imágenes (JPG, PNG, WebP) y PDF.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo para comprobantes
  },
};

type CreatePagoFormDto = {
  id_tipo_pago?: string | number;
  monto_total?: string | number;
  numero_operacion?: string;
  comprobante_url?: string;
  observaciones?: string;
  cursos?: string | Array<{ id_curso: number; precio: number }>;
  rutas?: string | Array<{ id_ruta: number; precio: number }>;
};

@Controller('pagos')
export class PagosController {
  private readonly logger = new Logger(PagosController.name);

  constructor(private readonly svc: PagosService) {}

  @Get('mis-pagos')
  @UseGuards(JwtAuthGuard)
  misPagos(@CurrentUser() u: Usuario) {
    return this.svc.findByUsuario(u.id_usuario);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findById(@Param('id') id: number, @CurrentUser() u: Usuario) {
    return this.svc.findById(id, u);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen_comprobante', comprobanteMulterOptions))
  async create(
    @CurrentUser() u: Usuario,
    @Body() dto: CreatePagoFormDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const payload: CreatePagoDto & {
      cursos?: Array<{ id_curso: number; precio: number }>;
      rutas?: Array<{ id_ruta: number; precio: number }>;
    } = {
      id_tipo_pago: dto.id_tipo_pago ? Number(dto.id_tipo_pago) : undefined,
      monto_total: dto.monto_total ? Number(dto.monto_total) : 0,
      numero_operacion:
        typeof dto.numero_operacion === 'string'
          ? dto.numero_operacion
          : undefined,
      comprobante_url: file
        ? `/api/storage/comprobantes/${file.filename}`
        : undefined,
      observaciones:
        typeof dto.observaciones === 'string' ? dto.observaciones : undefined,
    };

    const isCursoItem = (item: any): boolean =>
      item &&
      (typeof item.id_curso === 'number' ||
        typeof item.id_curso === 'string') &&
      (typeof item.precio === 'number' || typeof item.precio === 'string');

    if (typeof dto.cursos === 'string') {
      try {
        const parsed = JSON.parse(dto.cursos);
        if (Array.isArray(parsed)) {
          payload.cursos = parsed.filter(isCursoItem).map((c) => ({
            id_curso: Number(c.id_curso),
            precio: Number(c.precio),
          }));
        }
      } catch (e: any) {
        this.logger.error('Error parseando cursos:', e.stack);
      }
    } else if (Array.isArray(dto.cursos)) {
      payload.cursos = dto.cursos.map((c) => ({
        id_curso: Number(c.id_curso),
        precio: Number(c.precio),
      }));
    }

    const isRutaItem = (item: any): boolean =>
      item &&
      (typeof item.id_ruta === 'number' || typeof item.id_ruta === 'string') &&
      (typeof item.precio === 'number' || typeof item.precio === 'string');

    if (typeof dto.rutas === 'string') {
      try {
        const parsed = JSON.parse(dto.rutas);
        if (Array.isArray(parsed)) {
          payload.rutas = parsed.filter(isRutaItem).map((r) => ({
            id_ruta: Number(r.id_ruta),
            precio: Number(r.precio),
          }));
        }
      } catch (e: any) {
        this.logger.error('Error parseando rutas:', e.stack);
      }
    } else if (Array.isArray(dto.rutas)) {
      payload.rutas = dto.rutas.map((r) => ({
        id_ruta: Number(r.id_ruta),
        precio: Number(r.precio),
      }));
    }

    const result = await this.svc.create(u.id_usuario, payload);
    return { status: 'success', data: result };
  }
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('estado') estado?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.svc.findAll(page, perPage, estado, fecha_inicio, fecha_fin);
  }
  @Patch(':id') @UseGuards(JwtAuthGuard, AdminGuard) update(
    @Param('id') id: number,
    @Body() dto: UpdatePagoDto,
  ) {
    return this.svc.updateEstado(id, dto);
  }
  @Delete(':id') @UseGuards(JwtAuthGuard, AdminGuard) delete(
    @Param('id') id: number,
  ) {
    return this.svc.delete(id);
  }
}

@Controller('tipos-pagos')
export class TiposPagoController {
  constructor(private readonly svc: PagosService) {}
  @Get() async findAll() {
    const tipos = await this.svc.findAllTipos();
    return { status: 'success', tipos_pagos: tipos };
  }
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateTipoPagoDto) {
    return this.svc.createTipo(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: number, @Body() dto: Partial<CreateTipoPagoDto>) {
    return this.svc.updateTipo(id, dto);
  }
  @Delete(':id') @UseGuards(JwtAuthGuard, AdminGuard) delete(
    @Param('id') id: number,
  ) {
    return this.svc.deleteTipo(id);
  }
}

@Controller('compras')
export class ComprasController {
  constructor(private readonly svc: PagosService) {}

  @Get('historial')
  @UseGuards(JwtAuthGuard)
  getHistorial(@CurrentUser() user: Usuario) {
    return this.svc.findHistorial(user.id_usuario);
  }
}
