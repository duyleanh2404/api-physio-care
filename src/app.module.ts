import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { dbConfig } from './core/database/db.config';
import jwtConfig from './core/auth/config/jwt.config';
import otpConfig from './core/auth/config/otp.config';
import googleConfig from './core/auth/config/google.config';
import cloudinaryConfig from './core/cloudinary/cloudinary.config';

import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RecordModule } from './modules/record/record.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { ClinicModule } from './modules/clinic/clinic.module';
import { CloudinaryModule } from './core/cloudinary/cloudinary.module';
import { SpecialtyModule } from './modules/specialty/specialty.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    DoctorModule,
    RecordModule,
    ClinicModule,
    SpecialtyModule,
    CloudinaryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleConfig, jwtConfig, otpConfig, cloudinaryConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => dbConfig(configService),
    }),
  ],
})
export class AppModule {}
