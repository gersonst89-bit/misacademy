import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Asegurar que la carpeta de subidas existe
const uploadPath = './uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

export const multerOptions = {
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      let folder = './uploads/otros';
      if (file.fieldname === 'imagen') folder = './uploads/cursos';
      else if (file.fieldname === 'avatar') folder = './uploads/perfiles';
      else if (file.fieldname === 'archivo') folder = './uploads/materiales';
      
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      cb(null, folder);
    },
    filename: (req: any, file: any, cb: any) => {
      const ext = extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    // Permitir imágenes y documentos comunes para materiales
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|zip)$/)) {
      cb(null, true);
    } else {
      cb(new HttpException('Formato de archivo no soportado. Usa PDF, Imágenes o ZIP.', HttpStatus.BAD_REQUEST), false);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // Aumentado a 20MB para materiales
  },
};
