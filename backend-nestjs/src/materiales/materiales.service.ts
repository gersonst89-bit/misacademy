import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../entities/material.entity';

@Injectable()
export class MaterialesService {
    constructor(
        @InjectRepository(Material)
        private readonly materialRepo: Repository<Material>,
    ) { }

    async findByCurso(cursoId: number) {
        return this.materialRepo.find({
            where: { id_curso: cursoId },
            relations: ['modulo'],
            order: { orden: 'ASC' },
        });
    }

    async findByModulo(moduloId: number) {
        return this.materialRepo.find({
            where: { id_modulo: moduloId },
            relations: ['modulo'],
            order: { orden: 'ASC' },
        });
    }
}

