import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, Brackets } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ScheduleStatus } from 'src/enums/schedules.enum';

import { Schedule } from './schedule.entity';
import { Doctor } from '../doctors/doctor.entity';

import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GetSchedulesQueryDto } from './dto/get-schedules-query.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async findAll(query: GetSchedulesQueryDto) {
    const {
      search,
      dateTo,
      status,
      doctorId,
      dateFrom,
      page = 1,
      limit = 10,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.doctor', 'doctor')
      .leftJoin('doctor.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.email'])
      .leftJoin('doctor.clinic', 'clinic')
      .addSelect([
        'clinic.id',
        'clinic.name',
        'clinic.address',
        'clinic.phone',
        'clinic.avatar',
        'clinic.banner',
      ]);

    if (search) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.fullName) LIKE :keyword')
            .orWhere('LOWER(schedule.status) LIKE :keyword')
            .orWhere('LOWER(schedule.notes) LIKE :keyword')
            .orWhere('LOWER(clinic.name) LIKE :keyword');
        }),
        { keyword },
      );
    }

    if (doctorId) qb.andWhere('schedule.doctor_id = :doctorId', { doctorId });

    if (status) {
      const statuses = status.includes(',') ? status.split(',') : [status];
      qb.andWhere('schedule.status IN (:...statuses)', { statuses });
    }

    if (dateFrom && dateTo) {
      qb.andWhere('schedule.workDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    } else if (dateFrom) {
      qb.andWhere('schedule.workDate >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      qb.andWhere('schedule.workDate <= :dateTo', { dateTo });
    }

    qb.orderBy(`schedule.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data };
  }

  async findOne(id: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['doctor', 'doctor.user'],
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async create(dto: CreateScheduleDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
      relations: ['user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    for (const slot of dto.timeSlots) {
      const conflict = await this.scheduleRepo
        .createQueryBuilder('schedule')
        .where('schedule.doctor_id = :doctorId', { doctorId: dto.doctorId })
        .andWhere('schedule.workDate = :workDate', { workDate: dto.workDate })
        .andWhere(
          '(schedule.startTime < :endTime AND schedule.endTime > :startTime)',
          {
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        )
        .getOne();

      if (conflict)
        throw new ConflictException(
          `Schedule time ${slot.startTime}-${slot.endTime} overlaps with another shift`,
        );
    }

    const schedules = dto.timeSlots.map((slot) =>
      this.scheduleRepo.create({
        doctor,
        notes: dto.notes,
        workDate: dto.workDate,
        endTime: slot.endTime,
        startTime: slot.startTime,
        status: dto.status || ScheduleStatus.available,
      }),
    );

    return this.scheduleRepo.save(schedules);
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const { doctorId, workDate, startTime, endTime, status, notes } = dto;

    if (!doctorId || !workDate || !startTime || !endTime) {
      throw new BadRequestException('Missing required fields');
    }

    const workDateObj = new Date(workDate);

    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const schedule = await this.scheduleRepo.findOne({
      where: {
        id,
        doctor: { id: doctorId },
        workDate: workDateObj,
      },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');

    schedule.startTime = startTime;
    schedule.endTime = endTime;
    schedule.status = status || schedule.status;
    schedule.notes = notes ?? schedule.notes;

    return this.scheduleRepo.save(schedule);
  }

  async remove(id: string) {
    const schedule = await this.findOne(id);
    await this.scheduleRepo.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }
}
