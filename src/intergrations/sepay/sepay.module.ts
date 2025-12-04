import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SepayService } from './sepay.service';
import { SepayGateway } from './sepay.gateway';
import { SepayController } from './sepay.controller';

import { Payment } from 'src/modules/payments/payments.entity';
import { Appointment } from 'src/modules/appointments/appointments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Payment])],
  providers: [SepayService, SepayGateway],
  controllers: [SepayController],
})
export class SepayModule {}
