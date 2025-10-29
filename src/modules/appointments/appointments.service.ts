import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from './appointments.entity';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(query: GetAppointmentsQueryDto) {
    const {
      doctorId,
      userId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'appointmentDate',
      sortOrder = 'ASC',
    } = query;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.user', 'user');

    if (doctorId) qb.andWhere('appointment.doctorId = :doctorId', { doctorId });
    if (userId) qb.andWhere('appointment.userId = :userId', { userId });
    if (status) qb.andWhere('appointment.status = :status', { status });
    if (startDate && endDate) {
      qb.andWhere(
        'appointment.appointmentDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      qb.andWhere('appointment.appointmentDate >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('appointment.appointmentDate <= :endDate', { endDate });
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

    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const appointment = this.appointmentRepo.create({
      user,
      doctor,
      notes: dto.notes,
      address: dto.address,
      wardCode: dto.wardCode,
      provinceCode: dto.provinceCode,
      districtCode: dto.districtCode,
      appointmentDate: dto.appointmentDate,
      status: dto.status || AppointmentStatus.PENDING,
    });

    return this.appointmentRepo.save(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    if (dto.appointmentDate)
      appointment.appointmentDate = new Date(dto.appointmentDate);
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
