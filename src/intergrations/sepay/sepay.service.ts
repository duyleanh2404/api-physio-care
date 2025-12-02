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

  async processPaymentWebhook(data: any, userId: string, role: string) {
    const amount = data.transferAmount;
    const description = data.description?.trim() ?? '';
    const transactionId = data.referenceCode;

    const rawMatch = description.match(/APP-?\d{8}-?[A-Za-z0-9]{6}/i);
    if (!rawMatch) return;

    const cleaned = rawMatch[0].replace(/-/g, '');
    const datePart = cleaned.substring(3, 11);
    const suffix = cleaned.substring(11);
    const code = `APP-${datePart}-${suffix}`;

    console.log('Extracted code:', code);

    await this.appointmentRepo.query(`
      SET app.current_user_role = '${role}';
      SET app.current_user_id = '${userId}';
    `);

    const appointment = await this.appointmentRepo.findOne({ where: { code } });

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
