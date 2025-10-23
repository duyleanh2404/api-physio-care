import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { dbConfig } from './core/database/db.config';
import jwtConfig from './core/auth/config/jwt.config';
import otpConfig from './core/auth/config/otp.config';
import googleConfig from './core/auth/config/google.config';
import cloudinaryConfig from './core/cloudinary/cloudinary.config';

import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { RecordModule } from './modules/records/record.module';
import { DoctorModule } from './modules/doctors/doctor.module';
import { ClinicModule } from './modules/clinics/clinic.module';
import { ScheduleModule } from './modules/schedules/schedule.module';
import { CloudinaryModule } from './core/cloudinary/cloudinary.module';
import { SpecialtyModule } from './modules/specialties/specialty.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    DoctorModule,
    RecordModule,
    ClinicModule,
    ScheduleModule,
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
