import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { Curso, LineaAcademica, RutaAcademica } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, LineaAcademica, RutaAcademica])],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
