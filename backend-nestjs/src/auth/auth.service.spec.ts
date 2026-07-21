import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: any;

  beforeEach(async () => {
    const mockAuthRepository = {
      findByEmail: jest.fn(),
      register: jest.fn(),
      createVerificationToken: jest.fn(),
      createResetToken: jest.fn(),
      findById: jest.fn(),
      saveRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      updateToken: jest.fn(),
      updateLogout: jest.fn(),
      markTokenAsUsed: jest.fn(),
      markEmailVerified: jest.fn(),
      findByVerificationToken: jest.fn(),
      findValidResetToken: jest.fn(),
      updatePassword: jest.fn(),
      createAuthLog: jest.fn(),
      invalidateAllUserRefreshTokens: jest.fn(),
      updateAvatar: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'JWT_EXPIRATION') return '15m';
        if (key === 'REFRESH_JWT_SECRET') return 'refresh-secret';
        if (key === 'APP_URL_BASE') return 'http://localhost:5173';
        if (key === 'API_URL_PUBLIC') return null;
        if (key === 'APP_PORT') return '8000';
        return defaultValue ?? null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});