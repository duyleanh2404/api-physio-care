import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

import { Payment } from './payments.entity';
import { Appointment } from '../appointments/appointments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Appointment])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
