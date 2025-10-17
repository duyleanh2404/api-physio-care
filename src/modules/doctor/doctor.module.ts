import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctor } from './doctor.entity';
import { User } from '../user/user.entity';
import { Clinic } from '../clinic/clinic.entity';
import { Specialty } from '../specialty/specialty.entity';

import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';

import { UserModule } from '../user/user.module';
import { CloudinaryModule } from 'src/core/cloudinary/cloudinary.module';

@Module({
  imports: [
    UserModule,
    CloudinaryModule,
    TypeOrmModule.forFeature([Doctor, User, Specialty, Clinic]),
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
