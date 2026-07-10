import { Injectable } from '@nestjs/common';
import { CreateResenaDto, UpdateResenaDto } from './dto/resenas.dto';
import { ResenasRepository } from './resenas.repository';

@Injectable()
export class ResenasService {
    constructor(private readonly repo: ResenasRepository) { }

    async findByCurso(cursoId: number) {
        return this.repo.findByCurso(cursoId);
    }

    async findByUsuario(userId: number) {
        return this.repo.findByUsuario(userId);
    }

    async create(userId: number, dto: CreateResenaDto) {
        return this.repo.create(userId, dto);
    }

    async update(id: number, dto: UpdateResenaDto) {
        return this.repo.update(id, dto);
    }

    async delete(id: number) {
        await this.repo.delete(id);
        return { message: 'Reseña eliminada' };
    }
}

