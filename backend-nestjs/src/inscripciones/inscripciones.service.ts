import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InscripcionesRepository } from './inscripciones.repository';
import {
    CreateInscripcionDto,
    UpdateInscripcionDto,
} from './dto/inscripciones.dto';
@Injectable()
export class InscripcionesService {
    constructor(private readonly repo: InscripcionesRepository) { }
    async findAll(page?: number, perPage?: number) {
        return this.repo.findAll(page, perPage);
    }
    async findById(id: number) {
        const i = await this.repo.findById(id);
        if (!i)
            throw new HttpException(
                'Inscripción no encontrada',
                HttpStatus.NOT_FOUND,
            );
        return i;
    }
    async findByUsuario(userId: number) {
        return this.repo.findByUsuario(userId);
    }
    async create(dto: CreateInscripcionDto) {
        return this.repo.create(dto);
    }
    async update(id: number, dto: UpdateInscripcionDto) {
        return this.repo.update(id, dto);
    }
    async delete(id: number) {
        await this.repo.delete(id);
        return { message: 'Inscripción eliminada' };
    }
}

