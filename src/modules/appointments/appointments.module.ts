import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from './appointments.entity';

import { AppointmentService } from './appointments.service';
import { AppointmentController } from './appointments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, User])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
  exports: [AppointmentService],
})
export class AppointmentModule {}
