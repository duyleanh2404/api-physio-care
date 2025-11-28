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
    console.log('📩 Webhook SePay:', data);

    const amount = data.amount;
    const description = data.description?.trim() ?? '';
    const transactionId = data.tid;

    const match = description.match(/APP-\d{8}-[A-Z0-9]+/);
    const code = match ? match[0] : null;

    if (!code) {
      console.warn('❌ Không tìm thấy mã trong description:', description);
      return;
    }

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
      console.log('ℹ️ Bỏ qua webhook duplicate');
      return;
    }

    appointment.paymentAmount = amount;
    appointment.transactionId = transactionId;
    appointment.status = AppointmentStatus.CONFIRMED;

    await this.appointmentRepo.save(appointment);

    console.log(`✅ Xác nhận thanh toán appointment ${appointment.id}`);

    this.sepayGateway.sendPaymentSuccess(code, {
      code,
      amount,
      transactionId,
    });
  }
}
