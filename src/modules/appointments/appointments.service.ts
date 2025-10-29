import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from './appointments.entity';
import { Schedule } from '../schedules/schedule.entity';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';

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
      userId,
      status,
      endDate,
      doctorId,
      page = 1,
      startDate,
      limit = 10,
      sortOrder = 'ASC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.user', 'user');

    if (doctorId) qb.andWhere('appointment.doctorId = :doctorId', { doctorId });
    if (userId) qb.andWhere('appointment.userId = :userId', { userId });
    if (status) qb.andWhere('appointment.status = :status', { status });

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
    );
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      data,
    };
  }

  async findOne(id: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['doctor', 'user'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
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

    const appointment = this.appointmentRepo.create({
      user,
      doctor,
      schedule,
      notes: dto.notes,
      address: dto.address,
      wardCode: dto.wardCode,
      districtCode: dto.districtCode,
      provinceCode: dto.provinceCode,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentRepo.save(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    if (dto.notes !== undefined) appointment.notes = dto.notes;
    if (dto.status) appointment.status = dto.status;

    return this.appointmentRepo.save(appointment);
  }

  async remove(id: string) {
    const appointment = await this.findOne(id);
    await this.appointmentRepo.remove(appointment);
    return { message: 'Appointment deleted successfully' };
  }
}
