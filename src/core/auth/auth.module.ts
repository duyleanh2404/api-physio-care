import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthGateway } from './auth.gateway';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/users/user.module';

import { UserToken } from './entity/user-tokens.entity';
import { Doctor } from 'src/modules/doctors/doctor.entity';
import { Clinic } from 'src/modules/clinics/clinic.entity';

import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

import { OtpRepository } from './repository/otp.repository';
import { TokenRepository } from './repository/token.repository';
import { EmailRepository } from './repository/email.repository';

import { RateLimiterService } from './modules/rate-limiter/rate-limiter.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserToken, Doctor, Clinic]),
  ],
  controllers: [AuthController],
  providers: [
    RolesGuard,
    AuthService,
    JwtStrategy,
    AuthGateway,
    OtpRepository,
    GoogleStrategy,
    EmailRepository,
    TokenRepository,
    RateLimiterService,
  ],
  exports: [AuthService, TokenRepository],
})
export class AuthModule {}
