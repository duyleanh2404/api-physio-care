import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SepayGateway } from './sepay.gateway';

import { PaymentStatus } from 'src/enums/payments-status.enum';
import { AppointmentStatus } from 'src/enums/appointments-status.enum';

import { Payment } from 'src/modules/payments/payments.entity';
import { Appointment } from 'src/modules/appointments/appointments.entity';

@Injectable()
export class SepayService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    private readonly sepayGateway: SepayGateway,

    private readonly dataSource: DataSource,
  ) {}

  async processPaymentWebhook(data: any) {
    await this.dataSource.query(`
      SET app.current_user_role = 'admin';
    `);

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

    const appointment = await this.appointmentRepo.findOne({
      where: { code },
      relations: ['user'],
    });

    if (!appointment) {
      console.warn('❌ Không tìm thấy appointment:', code);

      this.sepayGateway.sendPaymentFailed(code, {
        message: 'Không tìm thấy cuộc hẹn',
      });

      return;
    }

    const existedPayment = await this.paymentRepo.findOne({
      where: { transactionId },
    });

    if (existedPayment) {
      console.log('⚠️ Transaction đã tồn tại, bỏ qua.');
      return;
    }

    const payment = this.paymentRepo.create({
      appointmentId: appointment.id,
      userId: appointment.user?.id,
      amount,
      transactionId,
      status: PaymentStatus.CONFIRMED,
      rawDescription: description,
    });

    await this.paymentRepo.save(payment);

    appointment.paymentId = payment.id;
    appointment.status = AppointmentStatus.CONFIRMED;

    await this.appointmentRepo.save(appointment);

    this.sepayGateway.sendPaymentSuccess(code, {
      code,
      amount,
      transactionId,
    });
  }
}
