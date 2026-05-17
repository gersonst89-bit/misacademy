import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@Controller('storage')
export class StorageController {
  @Get('perfiles/:filename')
  getPerfilFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = join(process.cwd(), 'uploads', 'perfiles', filename);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }

    const fallback = join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(fallback)) {
      return res.sendFile(fallback);
    }

    throw new NotFoundException('Imagen no encontrada');
  }

  @Get('cursos/:filename')
  getCursoFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = join(process.cwd(), 'uploads', 'cursos', filename);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
    throw new NotFoundException('Imagen no encontrada');
  }

  @Get('comprobantes/:filename')
  getComprobanteFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const file = join(process.cwd(), 'uploads', 'comprobantes', filename);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
    throw new NotFoundException('Comprobante no encontrado');
  }

  @Get('materiales/:filename')
  getMaterialFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = join(process.cwd(), 'uploads', 'materiales', filename);
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
    throw new NotFoundException('Material no encontrado');
  }
}
