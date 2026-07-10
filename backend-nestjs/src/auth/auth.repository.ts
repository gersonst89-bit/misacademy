import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { TokenUsuario } from '../entities/token-usuario.entity';
import { AuthenticationLog } from '../entities/authentication-log.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(TokenUsuario)
    private readonly tokenRepo: Repository<TokenUsuario>,
    @InjectRepository(AuthenticationLog)
    private readonly authLogRepo: Repository<AuthenticationLog>,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { email },
      relations: ['rol'],
      select: [
        'id_usuario',
        'nombre',
        'apellido',
        'email',
        'password',
        'id_rol',
        'email_verificado',
        'estado',
        'imagen_perfil',
        'biografia',
        'telefono',
        'dni',
        'fecha_registro',
      ],
    });
  }

  async findById(id: number): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { id_usuario: id },
      relations: ['rol'],
    });
  }

  async register(data: RegisterDto): Promise<Usuario> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const usuario = this.usuarioRepo.create({
      ...data,
      password: hashedPassword,
      id_rol: 3,
      email_verificado: false,
      estado: 'Activo',
      fecha_registro: new Date(),
    });
    return this.usuarioRepo.save(usuario as any);
  }

  async createVerificationToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    await this.tokenRepo.save({
      id_usuario: userId,
      token,
      tipo: 'Verificacion',
      fecha_creacion: new Date(),
      fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      usado: false,
    });
    return token;
  }

  async findByVerificationToken(token: string): Promise<TokenUsuario | null> {
    return this.tokenRepo.findOne({ where: { token, usado: false } });
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await this.tokenRepo.update({ token }, { usado: true });
  }

  async createResetToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    await this.tokenRepo.save({
      id_usuario: userId,
      token,
      tipo: 'Reseteo',
      fecha_creacion: new Date(),
      fecha_expiracion: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h
      usado: false,
    });
    return token;
  }

  async findValidResetToken(token: string): Promise<TokenUsuario | null> {
    return this.tokenRepo.findOne({
      where: { token, tipo: 'Reseteo', usado: false },
    });
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepo.update({ id_usuario: userId }, { password: hashed });
  }

  async markEmailVerified(userId: number): Promise<void> {
    await this.usuarioRepo.update(
      { id_usuario: userId },
      { email_verificado: true },
    );
  }

  async createAuthLog(
    data: Partial<AuthenticationLog>,
  ): Promise<AuthenticationLog> {
    const log = this.authLogRepo.create(data);
    return this.authLogRepo.save(log);
  }

  async updateLogout(userId: number): Promise<void> {
    const lastLogin = await this.authLogRepo.findOne({
      where: {
        authenticatable_id: userId,
        authenticatable_type: 'Usuario',
        logout_at: IsNull(),
      },
      order: { login_at: 'DESC' },
    });
    if (lastLogin) {
      lastLogin.logout_at = new Date();
      await this.authLogRepo.save(lastLogin);
    }
  }
  async updateAvatar(userId: number, imageUrl: string): Promise<void> {
    await this.usuarioRepo.update(
      { id_usuario: userId },
      { imagen_perfil: imageUrl },
    );
  }

  async saveRefreshToken(userId: number, token: string) {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    return this.tokenRepo.save({
      id_usuario: userId,
      token,
      tipo: 'Refresh',
      fecha_creacion: new Date(),
      fecha_expiracion: expiration,
      usado: false,
    });
  }

  async findRefreshToken(token: string): Promise<TokenUsuario | null> {
    return this.tokenRepo.findOne({
      where: {
        token,
        tipo: 'Refresh',
        usado: false,
      },
    });
  }
  async updateToken(token: TokenUsuario): Promise<void> {
    await this.tokenRepo.save(token);
  }
  async invalidateAllUserRefreshTokens(userId: number): Promise<void> {
    await this.tokenRepo.update(
      { id_usuario: userId, tipo: 'Refresh' },
      { usado: true },
    );
  }
}
