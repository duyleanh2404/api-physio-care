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
import { Clinic } from '../clinics/clinic.entity';
import { Doctor } from '../doctors/doctor.entity';

import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GetSchedulesQueryDto } from './dto/get-schedules-query.dto';
import { GetSchedulesRangeDto } from './dto/get-schedules-range.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Doctor)
    private readonly clinicRepo: Repository<Clinic>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
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

    if (doctorId) qb.andWhere('schedule.doctorId = :doctorId', { doctorId });

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

  async findByDateRange(dto: GetSchedulesRangeDto) {
    const { dateFrom, dateTo, doctorId, clinicId } = dto;

    if (doctorId) {
      const doctor = await this.doctorRepo.findOne({
        where: { id: doctorId },
        relations: ['clinic'],
      });
      if (!doctor) throw new NotFoundException('Doctor not found');

      if (clinicId && doctor.clinic.id !== clinicId) {
        throw new BadRequestException('Doctor does not belong to this clinic');
      }
    }

    const qb = this.scheduleRepo
      .createQueryBuilder('schedule')
      .innerJoin('schedule.doctor', 'doctor')
      .where(
        "TRUNC(schedule.workDate) BETWEEN TO_DATE(:dateFrom, 'YYYY-MM-DD') AND TO_DATE(:dateTo, 'YYYY-MM-DD')",
        { dateFrom, dateTo },
      );

    if (doctorId) qb.andWhere('doctor.id = :doctorId', { doctorId });

    if (clinicId) qb.andWhere('doctor.clinicId = :clinicId', { clinicId });

    const schedules = await qb
      .orderBy('schedule.workDate', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .getMany();

    const groupedRaw = schedules.reduce(
      (acc, s) => {
        const date = new Date(s.workDate);
        const local = new Date(date.getTime() + 7 * 60 * 60 * 1000); // UTC+7
        const key = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
      },
      {} as Record<string, typeof schedules>,
    );

    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const schedulesByDate: Record<string, typeof schedules> = {};

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      schedulesByDate[key] = groupedRaw[key] || [];
    }

    return {
      dateFrom,
      dateTo,
      doctorId: doctorId ?? null,
      clinicId: clinicId ?? null,
      totalDays: Object.keys(schedulesByDate).length,
      schedulesByDate,
    };
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
        .where('schedule.doctorId = :doctorId', { doctorId: dto.doctorId })
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
