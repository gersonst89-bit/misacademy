import {
  Controller,
  Get,
  NotFoundException,
  BadRequestException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { join, basename } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

/**
 * Sanitiza el nombre de archivo para prevenir path traversal.
 * Solo permite nombres de archivo simples (sin separadores de directorio).
 */
function sanitizeFilename(filename: string): string {
  // Extraemos solo el basename — elimina cualquier "../" o subdirectorios
  const safe = basename(filename);
  // Solo permitimos caracteres seguros: alfanuméricos, guiones, puntos, guiones bajos
  if (!/^[\w\-. ]+$/.test(safe)) {
    throw new BadRequestException('Nombre de archivo inválido');
  }
  return safe;
}

@Controller('storage')
export class StorageController {
  @Get('perfiles/:filename')
  getPerfilFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = sanitizeFilename(filename);
    const file = join(process.cwd(), 'uploads', 'perfiles', safe);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }

    const fallback = join(process.cwd(), 'uploads', safe);
    if (fs.existsSync(fallback)) {
      return res.sendFile(fallback);
    }

    throw new NotFoundException('Imagen no encontrada');
  }

  @Get('cursos/:filename')
  getCursoFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = sanitizeFilename(filename);
    const file = join(process.cwd(), 'uploads', 'cursos', safe);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
    throw new NotFoundException('Imagen no encontrada');
  }

  // 🔐 Protegido — solo usuarios autenticados pueden ver comprobantes de pago
  @Get('comprobantes/:filename')
  @UseGuards(JwtAuthGuard)
  getComprobanteFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const safe = sanitizeFilename(filename);
    const file = join(process.cwd(), 'uploads', 'comprobantes', safe);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
    throw new NotFoundException('Comprobante no encontrado');
  }

  @Get('materiales/:filename')
  getMaterialFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = sanitizeFilename(filename);
    const file = join(process.cwd(), 'uploads', 'materiales', safe);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
    throw new NotFoundException('Material no encontrado');
  }

  @Get('preguntas/:filename')
  getPreguntaFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = sanitizeFilename(filename);
    const file = join(process.cwd(), 'uploads', 'preguntas', safe);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
    throw new NotFoundException('Imagen no encontrada');
  }
}
