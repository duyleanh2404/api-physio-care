import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { SepayModule } from './intergrations/sepay/sepay.module';
import { PackagesModule } from './modules/packages/packages.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ScheduleModule } from './modules/schedules/schedule.module';
import { CloudinaryModule } from './core/cloudinary/cloudinary.module';
import { EquipmentModule } from './modules/equipments/equipment.module';
import { SpecialtyModule } from './modules/specialties/specialty.module';
import { AppointmentModule } from './modules/appointments/appointments.module';
import { RateLimiterModule } from './core/auth/modules/rate-limiter/rate-limiter.module';

import { SetPostgresSessionInterceptor } from './interceptors/set-session.interceptor';

@Module({
  imports: [
    UserModule,
    AuthModule,
    SepayModule,
    DoctorModule,
    RecordModule,
    ClinicModule,
    PaymentsModule,
    ScheduleModule,
    PackagesModule,
    EquipmentModule,
    SpecialtyModule,
    CloudinaryModule,
    AppointmentModule,
    RateLimiterModule,
    JwtModule.register({}),
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
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SetPostgresSessionInterceptor,
    },
  ],
})
export class AppModule {}
