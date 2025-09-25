import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { dbConfig } from './core/database/db.config';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './modules/user/user.module';

import jwtConfig from './core/auth/config/jwt.config';
import otpConfig from './core/auth/config/otp.config';
import googleConfig from './core/auth/config/google.config';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleConfig, jwtConfig, otpConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => dbConfig(configService),
    }),
  ],
})
export class AppModule {}
