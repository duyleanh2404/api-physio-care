import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';

import { UserToken } from './entity/user-tokens.entity';

import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

import { OtpRepository } from './repository/otp.repository';
import { TokenRepository } from './repository/token.repository';
import { EmailRepository } from './repository/email.repository';

import { ManagerDataSourceProvider } from '../database/provider/manager-data-source.provider';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserToken]),
  ],
  controllers: [AuthController],
  providers: [
    RolesGuard,
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    OtpRepository,
    EmailRepository,
    TokenRepository,
    ManagerDataSourceProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
