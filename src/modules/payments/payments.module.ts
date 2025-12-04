import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from './payments.entity';
import { Appointment } from '../appointments/appointments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Appointment])],
  providers: [],
  controllers: [],
  exports: [],
})
export class PaymentsModule {}
