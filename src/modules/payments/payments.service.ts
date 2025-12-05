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
      userId,
      search,
      status,
      dateFrom,
      dateTo,
      priceFrom,
      priceTo,
      packageId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.appointment', 'appointment')
      .leftJoinAndSelect('appointment.package', 'package')
      .leftJoinAndSelect('package.clinic', 'clinic')
      .leftJoinAndSelect('package.specialty', 'specialty')
      .leftJoinAndSelect('appointment.schedule', 'schedule')
      .leftJoin('payment.user', 'user')
      .addSelect([
        'user.id',
        'user.email',
        'user.fullName',
        'user.avatarUrl',
        'user.role',
        'user.status',
        'user.provider',
        'user.slug',
      ]);

    if (user.role === 'clinic' && user.clinicId) {
      qb.andWhere('appointment.clinicId = :clinicId', {
        clinicId: user.clinicId,
      });
    } else if (user.role === 'doctor' && user.doctorId) {
      qb.andWhere('appointment.doctorId = :doctorId', {
        doctorId: user.doctorId,
      });
    }

    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(payment.transactionId) LIKE :search OR LOWER(user.fullName) LIKE :search OR LOWER(user.email) LIKE :search)`,
        { search: searchPattern },
      );
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      qb.andWhere('payment.status IN (:...status)', { status: statusArray });
    }

    if (dateFrom && dateTo) {
      qb.andWhere('payment.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    } else if (dateFrom) {
      qb.andWhere('payment.createdAt >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      qb.andWhere('payment.createdAt <= :dateTo', { dateTo });
    }

    if (priceFrom) {
      qb.andWhere('payment.amount >= :priceFrom', { priceFrom });
    }
    if (priceTo) {
      qb.andWhere('payment.amount <= :priceTo', { priceTo });
    }

    if (packageId) {
      qb.andWhere('appointment.packageId = :packageId', { packageId });
    }

    if (userId) {
      qb.andWhere('payment.userId = :userId', { userId });
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

  async findMyPayments(query: GetPaymentsQueryDto, userId: string) {
    const {
      search,
      status,
      dateFrom,
      dateTo,
      priceFrom,
      priceTo,
      packageId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.appointment', 'appointment')
      .leftJoinAndSelect('appointment.package', 'package')
      .where('payment.userId = :userId', { userId });

    if (search) {
      const like = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(payment.transactionId) LIKE :like OR LOWER(package.name) LIKE :like OR LOWER(appointment.name) LIKE :like)`,
        { like },
      );
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      qb.andWhere('payment.status IN (:...status)', { status: statusArray });
    }

    if (dateFrom && dateTo) {
      qb.andWhere('payment.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    } else if (dateFrom) {
      qb.andWhere('payment.createdAt >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      qb.andWhere('payment.createdAt <= :dateTo', { dateTo });
    }

    if (priceFrom) {
      qb.andWhere('payment.amount >= :priceFrom', { priceFrom });
    }
    if (priceTo) {
      qb.andWhere('payment.amount <= :priceTo', { priceTo });
    }

    if (packageId) {
      qb.andWhere('appointment.packageId = :packageId', { packageId });
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
