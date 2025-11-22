import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Appointment } from './appointments.entity';
import { Schedule } from '../schedules/schedule.entity';

import { AppointmentService } from './appointments.service';
import { AppointmentController } from './appointments.controller';
import { RateLimiterService } from 'src/core/auth/modules/rate-limiter/rate-limiter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Doctor, User, Schedule, Clinic]),
  ],
  providers: [AppointmentService,RateLimiterService],
  controllers: [AppointmentController],
  exports: [AppointmentService],
})
export class AppointmentModule {}
