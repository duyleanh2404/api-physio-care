import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SepayGateway } from './sepay.gateway';
import { AppointmentStatus } from 'src/enums/appointments-status.enum';
import { Appointment } from 'src/modules/appointments/appointments.entity';

@Injectable()
export class SepayService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    private readonly sepayGateway: SepayGateway,
  ) {}

  async processPaymentWebhook(data: any) {
    const amount = data.amount;
    const description = data.description?.trim() ?? '';
    const transactionId = data.tid;

    const match = description.match(/APP-\d{8}-[A-Z0-9]+/);
    const code = match ? match[0] : null;

    if (!code) return;

    const appointment = await this.appointmentRepo.findOne({
      where: { code },
    });

    if (!appointment) {
      console.warn('❌ Không tìm thấy appointment:', code);
      this.sepayGateway.sendPaymentFailed(code, {
        message: 'Không tìm thấy cuộc hẹn',
      });
      return;
    }

    if (appointment.transactionId === transactionId) {
      return;
    }

    appointment.paymentAmount = amount;
    appointment.transactionId = transactionId;
    appointment.status = AppointmentStatus.CONFIRMED;

    await this.appointmentRepo.save(appointment);

    this.sepayGateway.sendPaymentSuccess(code, {
      code,
      amount,
      transactionId,
    });
  }
}
