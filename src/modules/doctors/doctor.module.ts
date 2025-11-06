import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctor } from './doctor.entity';
import { User } from '../users/user.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Specialty } from '../specialties/specialty.entity';
import { Appointment } from '../appointments/appointments.entity';

import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';

import { UserModule } from '../users/user.module';
import { CloudinaryModule } from 'src/core/cloudinary/cloudinary.module';

@Module({
  imports: [
    UserModule,
    CloudinaryModule,
    TypeOrmModule.forFeature([Doctor, User, Specialty, Clinic, Appointment]),
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
