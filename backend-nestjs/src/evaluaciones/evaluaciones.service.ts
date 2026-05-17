import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { EvaluacionesRepository } from './evaluaciones.repository';
import { CreateEvaluacionDto, UpdateEvaluacionDto, CreatePreguntaDto, UpdatePreguntaDto, CreateOpcionDto, UpdateOpcionDto, IniciarEvaluacionDto, SaveAnswerDto, SubmitEvaluacionDto } from './dto/evaluaciones.dto';

@Injectable()
export class EvaluacionesService {
  constructor(private readonly evalRepo: EvaluacionesRepository) {}

  async findAll(page?: number, perPage?: number) { return this.evalRepo.findAll(page, perPage); }
  async findById(id: number) { const e = await this.evalRepo.findById(id); if (!e) throw new HttpException('Evaluación no encontrada', HttpStatus.NOT_FOUND); return e; }
  async findByCurso(cursoId: number | string) { return this.evalRepo.findByCurso(cursoId); }
  async create(dto: CreateEvaluacionDto) { return this.evalRepo.createEval(dto); }
  async update(id: number, dto: UpdateEvaluacionDto) { return this.evalRepo.updateEval(id, dto); }
  async delete(id: number) { await this.evalRepo.deleteEval(id); return { message: 'Evaluación eliminada' }; }

  async findPreguntas(evalId: number) { return this.evalRepo.findPreguntas(evalId); }
  async findAllPreguntas(page?: number, perPage?: number) { return this.evalRepo.findAllPreguntas(page, perPage); }
  async createPregunta(dto: CreatePreguntaDto) { return this.evalRepo.createPregunta(dto); }
  async updatePregunta(id: number, dto: UpdatePreguntaDto) { return this.evalRepo.updatePregunta(id, dto); }
  async deletePregunta(id: number) { await this.evalRepo.deletePregunta(id); return { message: 'Pregunta eliminada' }; }

  async findOpciones(preguntaId: number) { return this.evalRepo.findOpciones(preguntaId); }
  async findAllOpciones(page?: number, perPage?: number) { return this.evalRepo.findAllOpciones(page, perPage); }
  async createOpcion(dto: CreateOpcionDto) { return this.evalRepo.createOpcion(dto); }
  async updateOpcion(id: number, dto: UpdateOpcionDto) { return this.evalRepo.updateOpcion(id, dto); }
  async deleteOpcion(id: number) { await this.evalRepo.deleteOpcion(id); return { message: 'Opción eliminada' }; }

  async checkEligibility(cursoId: number | string, userId: number) { return this.evalRepo.checkEligibility(cursoId, userId); }
  async getEvaluationInfo(cursoId: number | string, userId: number) { return this.evalRepo.getEvaluationInfo(cursoId, userId); }
  async iniciar(cursoId: number | string, userId: number, ip: string, ua: string) {
    const result = await this.evalRepo.iniciarEvaluacion(cursoId, userId, ip, ua);
    if (!result) throw new HttpException('No hay evaluación disponible', HttpStatus.NOT_FOUND);
    return result;
  }
  async resumeSession(intentoId: number) {
    const result = await this.evalRepo.resumeSession(intentoId);
    if (!result) throw new HttpException('Sesión no encontrada', HttpStatus.NOT_FOUND);
    return result;
  }
  async saveAnswer(intentoId: number, dto: SaveAnswerDto) { return this.evalRepo.saveAnswer(intentoId, dto); }
  async saveAnswersBatch(intentoId: number, answers: any[]) { return this.evalRepo.saveAnswersBatch(intentoId, answers); }
  async submit(intentoId: number, dto: SubmitEvaluacionDto) {
    const result = await this.evalRepo.submitEvaluacion(intentoId, dto);
    if (!result) throw new HttpException('Intento no encontrado', HttpStatus.NOT_FOUND);
    return result;
  }
  async getIntento(intentoId: number) {
    const result = await this.evalRepo.getIntento(intentoId);
    if (!result) throw new HttpException('Intento no encontrado', HttpStatus.NOT_FOUND);
    return result;
  }
}
