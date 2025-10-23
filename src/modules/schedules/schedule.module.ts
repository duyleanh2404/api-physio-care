import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from './schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';

import { Doctor } from '../doctors/doctor.entity';
import { Clinic } from '../clinics/clinic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Doctor, Clinic])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
