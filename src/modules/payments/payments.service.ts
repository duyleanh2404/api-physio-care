import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Payment } from './payments.entity';
import { GetPaymentsQueryDto } from './dto/get-payments-query.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async findAll(
    query: GetPaymentsQueryDto,
    user: { role: string; clinicId?: string; doctorId?: string },
  ) {
    const {
      transactionId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.appointment', 'appointment');

    if (user.role === 'clinic' && user.clinicId) {
      qb.andWhere('appointment.clinicId = :clinicId', {
        clinicId: user.clinicId,
      });
    } else if (user.role === 'doctor' && user.doctorId) {
      qb.andWhere('appointment.doctorId = :doctorId', {
        doctorId: user.doctorId,
      });
    }

    if (transactionId) {
      qb.andWhere('LOWER(payment.transactionId) LIKE :transactionId', {
        transactionId: `%${transactionId.toLowerCase()}%`,
      });
    }
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      qb.andWhere('payment.status IN (:...status)', { status: statusArray });
    }
    if (startDate && endDate) {
      qb.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      qb.andWhere('payment.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('payment.createdAt <= :endDate', { endDate });
    }

    qb.orderBy(`payment.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { page, limit, total, totalPages: Math.ceil(total / limit), data };
  }

  async findMyPayments(query: GetPaymentsQueryDto, userId: string) {
    const {
      transactionId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.appointment', 'appointment')
      .where('payment.userId = :userId', { userId });

    if (transactionId) {
      qb.andWhere('LOWER(payment.transactionId) LIKE :transactionId', {
        transactionId: `%${transactionId.toLowerCase()}%`,
      });
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      qb.andWhere('payment.status IN (:...status)', { status: statusArray });
    }

    if (startDate && endDate) {
      qb.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      qb.andWhere('payment.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('payment.createdAt <= :endDate', { endDate });
    }

    qb.orderBy(`payment.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }
}
