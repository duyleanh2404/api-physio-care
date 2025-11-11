import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Clinic } from './clinic.entity';
import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from '../appointments/appointments.entity';

import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';

import { UserModule } from '../users/user.module';
import { CloudinaryModule } from 'src/core/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clinic, Doctor, Appointment, User]),
    CloudinaryModule,
    UserModule,
  ],
  controllers: [ClinicController],
  providers: [ClinicService],
  exports: [ClinicService],
})
export class ClinicModule {}
