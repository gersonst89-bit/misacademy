import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacto } from '../entities/contacto.entity';
import { Reclamacion } from '../entities/reclamacion.entity';
@Injectable()
export class ContactoService {
    constructor(
        @InjectRepository(Contacto) private readonly contactoRepo: Repository<Contacto>,
        @InjectRepository(Reclamacion) private readonly reclamacionRepo: Repository<Reclamacion>,
    ) { }
    async createContacto(data: any) { return this.contactoRepo.save(this.contactoRepo.create({ ...data, fecha_envio: new Date() })); }
    async createReclamacion(data: any) { return this.reclamacionRepo.save(this.reclamacionRepo.create(data)); }
}
