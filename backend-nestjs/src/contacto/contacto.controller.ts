import { Controller, Post, Body } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto, CreateReclamacionDto } from './dto/contacto.dto';
@Controller()
export class ContactoController {
  constructor(private readonly svc: ContactoService) {}
  @Post('contacto') createContacto(@Body() dto: CreateContactoDto) { return this.svc.createContacto(dto); }
  @Post('reclamaciones') createReclamacion(@Body() dto: CreateReclamacionDto) { return this.svc.createReclamacion(dto); }
}
