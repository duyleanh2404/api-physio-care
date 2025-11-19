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
import { GetSchedulesQueryDto } from './dto/get-schedules-query.dto';
import { GetSchedulesRangeDto } from './dto/get-schedules-range.dto';
import { GetScheduleByDoctorDateDto } from './dto/get-schedules-by-doctor-date.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Clinic)
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
      .leftJoin('schedule.doctor', 'doctor')
      .addSelect([
        'doctor.id',
        'doctor.bio',
        'doctor.avatar',
        'doctor.licenseNumber',
        'doctor.yearsOfExperience',
        'doctor.createdAt',
        'doctor.updatedAt',
      ])
      .leftJoin('doctor.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.email'])
      .leftJoin('doctor.clinic', 'clinic')
      .addSelect([
        'clinic.id',
        'clinic.name',
        'clinic.address',
        'clinic.avatar',
        'clinic.banner',
      ])
      .leftJoin('doctor.specialty', 'specialty')
      .addSelect(['specialty.id', 'specialty.name', 'specialty.imageUrl']);

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

    if (search?.trim()) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.fullName) LIKE :keyword')
            .orWhere('LOWER(clinic.name) LIKE :keyword')
            .orWhere('LOWER(specialty.name) LIKE :keyword')
            .orWhere('LOWER(schedule.notes) LIKE :keyword');
        }),
        { keyword },
      );
    }

    qb.orderBy(`schedule.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data };
  }

  async findByDoctorAndDate(query: GetScheduleByDoctorDateDto) {
    const { doctorId, workDate, page = 1, limit = 10 } = query;

    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const date = new Date(workDate);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const qb = this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.doctorId = :doctorId', { doctorId })
      .andWhere('schedule.workDate >= :start', { start: date })
      .andWhere('schedule.workDate < :end', { end: nextDate })
      .orderBy('schedule.startTime', 'ASC');

    const total = await qb.getCount();

    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      data,
    };
  }

  async findMySchedules(userId: string, query: GetSchedulesQueryDto) {
    if (!userId) {
      throw new BadRequestException('Missing userId in token');
    }

    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile not found for this user account',
      );
    }

    const {
      search,
      dateTo,
      status,
      dateFrom,
      page = 1,
      limit = 10,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.doctorId = :doctorId', { doctorId: doctor.id });

    if (status) {
      const statuses = status.includes(',')
        ? status.split(',')
        : [status];
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

    if (search?.trim()) {
      qb.andWhere('LOWER(schedule.notes) LIKE :keyword', {
        keyword: `%${search.toLowerCase()}%`,
      });
    }

    qb.orderBy(`schedule.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((schedule) => ({
      ...schedule,
      workDate: schedule.workDate,
    }));

    return {
      page,
      limit,
      total,
      totalPages,
      data: mappedData,
    };
  }

  async findSchedulesByClinic(userId: string, query: GetSchedulesQueryDto) {
    const clinic = await this.clinicRepo.findOne({ where: { userId } });
    if (!clinic) throw new NotFoundException('Clinic not found for this user');

    const {
      search,
      dateFrom,
      dateTo,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const doctors = await this.doctorRepo.find({
      where: { clinic: { id: clinic.id } },
      select: ['id'],
    });

    const doctorIds = doctors.map((d) => d.id);

    if (!doctorIds.length) {
      throw new NotFoundException('No doctors found for this clinic');
    }

    const qb = this.scheduleRepo
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.doctor', 'doctor')
      .innerJoin('doctor.user', 'user')
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
      .innerJoin('doctor.specialty', 'specialty')
      .addSelect([
        'specialty.id',
        'specialty.name',
        'specialty.imageUrl'
      ])
      .where('schedule.doctorId IN (:...doctorIds)', { doctorIds });

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

    if (search?.trim()) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere('LOWER(user.fullName) LIKE :keyword', { keyword });
    }

    qb.orderBy(`schedule.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

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
      .where('schedule.workDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });

    if (doctorId) qb.andWhere('doctor.id = :doctorId', { doctorId });
    if (clinicId) qb.andWhere('doctor.clinicId = :clinicId', { clinicId });

    const schedules = await qb
      .orderBy('schedule.workDate', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .getMany();

    const groupedRaw: Record<string, typeof schedules> = {};

    schedules.forEach((s) => {
      const key = s.workDate;
      if (!groupedRaw[key]) groupedRaw[key] = [];
      groupedRaw[key].push(s);
    });

    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const schedulesByDate: Record<string, typeof schedules> = {};

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;

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
    const schedule = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.id = :id', { id })
      .getOne();

    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  parseWorkDate(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') {
      throw new BadRequestException('workDate must be a string YYYY-MM-DD');
    }

    const [year, month, day] = dateStr.split('-').map(Number);

    if (!year || !month || !day) {
      throw new BadRequestException('Invalid workDate format (expected YYYY-MM-DD)');
    }

    return new Date(Date.UTC(year, month - 1, day));
  }

  async create(dto: CreateScheduleDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const workDate = dto.workDate;

    for (const slot of dto.timeSlots) {
      const conflict = await this.scheduleRepo
        .createQueryBuilder('schedule')
        .where('schedule.doctorId = :doctorId', { doctorId: dto.doctorId })
        .andWhere('schedule.workDate = :workDate', { workDate })
        .andWhere(
          '(schedule.startTime < :endTime AND schedule.endTime > :startTime)',
          {
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        )
        .getOne();

      if (conflict) {
        throw new ConflictException(
          `Schedule time ${slot.startTime}-${slot.endTime} overlaps with another shift`,
        );
      }
    }

    const schedules = dto.timeSlots.map((slot) =>
      this.scheduleRepo.create({
        doctor,
        workDate,
        notes: dto.notes,
        endTime: slot.endTime,
        startTime: slot.startTime,
        status: dto.status || ScheduleStatus.available,
      }),
    );

    return this.scheduleRepo.save(schedules);
  }

  async remove(
    id: string,
    userId: string,
    role: 'admin' | 'doctor' | 'clinic',
  ) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['doctor', 'doctor.clinic', 'doctor.user'],
    });

    if (!schedule) throw new NotFoundException('Schedule not found');

    if (role === 'doctor' && schedule.doctor.user.id !== userId) {
      throw new BadRequestException('You can only delete your own schedule');
    }
    if (role === 'clinic' && schedule.doctor.clinic.userId !== userId) {
      throw new BadRequestException(
        'You can only delete schedules of doctors in your clinic',
      );
    }

    await this.scheduleRepo.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }
}
