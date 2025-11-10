import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ScheduleStatus } from 'src/enums/schedules.enum';
import { AppointmentStatus } from 'src/enums/appointments-status.enum';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from './appointments.entity';
import { Schedule } from '../schedules/schedule.entity';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';
import { GetDoctorAppointmentsQueryDto } from './dto/get-doctor-appointments-query.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async findAll(query: GetAppointmentsQueryDto) {
    const {
      doctorId,
      userId,
      status,
      startDate,
      endDate,
      startTime,
      endTime,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'ASC',
    } = query;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('doctor.clinic', 'clinic')
      .leftJoin('doctor.specialty', 'specialty')
      .leftJoin('appointment.user', 'user')
      .leftJoin('appointment.schedule', 'schedule')
      .select([
        'appointment.id',
        'appointment.code',
        'appointment.status',
        'appointment.notes',
        'appointment.phone',
        'appointment.address',
        'appointment.createdAt',
        'appointment.updatedAt',

        'doctor.id',
        'doctor.slug',

        'doctorUser.id',
        'doctorUser.fullName',
        'doctorUser.email',
        'doctorUser.avatarUrl',

        'specialty.id',
        'specialty.name',
        'specialty.imageUrl',

        'clinic.id',
        'clinic.name',
        'clinic.slug',
        'clinic.avatar',
        'clinic.address',

        'user.id',
        'user.fullName',
        'user.email',

        'schedule.id',
        'schedule.workDate',
        'schedule.startTime',
        'schedule.endTime',
      ]);

    if (doctorId) {
      qb.andWhere('appointment.doctorId = :doctorId', { doctorId });
    }

    if (userId) {
      qb.andWhere('appointment.userId = :userId', { userId });
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      qb.andWhere('appointment.status IN (:...status)', {
        status: statusArray,
      });
    }

    if (startDate && endDate) {
      qb.andWhere('appointment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      qb.andWhere('appointment.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('appointment.createdAt <= :endDate', { endDate });
    }

    if (startTime && endTime) {
      qb.andWhere(
        "DATE_FORMAT(schedule.startTime, '%H:%i') BETWEEN :startTime AND :endTime",
        { startTime, endTime },
      );
    }

    qb.orderBy(
      `appointment.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data };
  }

  async findOne(id: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['doctor', 'user'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async findDoctorAppointments(
    userId: string,
    query: GetDoctorAppointmentsQueryDto,
  ) {
    if (!userId) throw new BadRequestException('Missing userId in token');

    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'ASC',
    } = query;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .select([
        'appointment.id',
        'appointment.code',
        'appointment.status',
        'appointment.notes',
        'appointment.phone',
        'appointment.address',
        'appointment.createdAt',
        'appointment.updatedAt',
      ])
      .leftJoin('appointment.user', 'user')
      .addSelect([
        'user.id',
        'user.email',
        'user.fullName',
        'user.avatarUrl',
        'user.role',
        'user.status',
        'user.provider',
        'user.slug',
      ])
      .leftJoin('appointment.schedule', 'schedule')
      .addSelect([
        'schedule.id',
        'schedule.workDate',
        'schedule.startTime',
        'schedule.endTime',
        'schedule.status',
        'schedule.notes',
      ])
      .where('appointment.doctorId = :doctorId', { doctorId: doctor.id });

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      qb.andWhere('appointment.status IN (:...status)', {
        status: statusArray,
      });
    }

    if (startDate && endDate) {
      qb.andWhere('appointment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      qb.andWhere('appointment.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('appointment.createdAt <= :endDate', { endDate });
    }

    qb.orderBy(
      `appointment.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    )
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data };
  }

  async findByScheduleId(scheduleId: string) {
    const appointment = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('doctor.clinic', 'clinic')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.schedule', 'schedule')
      .where('schedule.id = :scheduleId', { scheduleId })
      .select([
        'appointment.id',
        'appointment.code',
        'appointment.status',
        'appointment.phone',
        'appointment.notes',
        'appointment.createdAt',

        'doctor.id',

        'doctorUser.id',
        'doctorUser.fullName',
        'doctorUser.email',
        'doctorUser.avatarUrl',

        'clinic.id',
        'clinic.name',
        'clinic.address',
        'clinic.avatar',

        'specialty.id',
        'specialty.name',
        'specialty.imageUrl',

        'user.id',
        'user.fullName',
        'user.email',
        'user.avatarUrl',

        'schedule.id',
        'schedule.workDate',
        'schedule.startTime',
        'schedule.endTime',
      ])
      .getOne();

    if (!appointment) {
      throw new NotFoundException('Appointment not found for this schedule');
    }

    return appointment;
  }

  async create(dto: CreateAppointmentDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const schedule = await this.scheduleRepo.findOne({
      where: { id: dto.scheduleId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    if (schedule.status === ScheduleStatus.booked) {
      throw new BadRequestException('This schedule has already been booked');
    }

    schedule.status = ScheduleStatus.booked;
    await this.scheduleRepo.save(schedule);

    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const randomPart = randomUUID().slice(0, 6).toUpperCase();
    const code = `APP-${y}${m}${d}-${randomPart}`;

    const appointment = this.appointmentRepo.create({
      user,
      code,
      doctor,
      schedule,
      phone: dto.phone,
      notes: dto.notes,
      address: dto.address,
      wardId: dto.wardId,
      districtId: dto.districtId,
      provinceId: dto.provinceId,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentRepo.save(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    if (dto.notes !== undefined) appointment.notes = dto.notes;

    if (dto.status) {
      appointment.status = dto.status;

      if (dto.status === AppointmentStatus.CANCELLED && appointment.schedule) {
        appointment.schedule.status = ScheduleStatus.available;
        await this.scheduleRepo.save(appointment.schedule);
      }
    }

    return this.appointmentRepo.save(appointment);
  }

  async remove(id: string) {
    const appointment = await this.findOne(id);
    await this.appointmentRepo.remove(appointment);
    return { message: 'Appointment deleted successfully' };
  }
}
