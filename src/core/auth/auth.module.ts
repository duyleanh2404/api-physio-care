import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from 'src/modules/user/user.module';

import { OtpRepository } from './repository/otp.repository';
import { TokenRepository } from './repository/token.repository';
import { EmailRepository } from './repository/email.repository';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [
    RolesGuard,
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    OtpRepository,
    EmailRepository,
    TokenRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
