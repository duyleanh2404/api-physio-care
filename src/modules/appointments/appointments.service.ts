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
import { Clinic } from '../clinics/clinic.entity';
import { Appointment } from './appointments.entity';
import { Package } from '../packages/packages.entity';
import { Schedule } from '../schedules/schedule.entity';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';
import { GetDoctorAppointmentsQueryDto } from './dto/get-doctor-appointments-query.dto';

import { RateLimiterService } from 'src/core/auth/modules/rate-limiter/rate-limiter.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly rateLimiter: RateLimiterService,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,

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
      isPackage,
    } = query;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('doctor.clinic', 'doctorClinic')
      .leftJoin('doctor.specialty', 'doctorSpecialty')
      .leftJoin('appointment.user', 'user')
      .leftJoin('appointment.schedule', 'schedule')
      .leftJoin('appointment.package', 'package')
      .leftJoin('package.specialty', 'packageSpecialty')
      .leftJoin('package.clinic', 'packageClinic')
      .select([
        'appointment.id',
        'appointment.code',
        'appointment.status',
        'appointment.notes',
        'appointment.phone',
        'appointment.address',
        'appointment.packageId',
        'appointment.createdAt',
        'appointment.updatedAt',

        'doctor.id',
        'doctor.slug',

        'doctorUser.id',
        'doctorUser.fullName',
        'doctorUser.email',
        'doctorUser.avatarUrl',

        'doctorSpecialty.id',
        'doctorSpecialty.name',
        'doctorSpecialty.imageUrl',

        'doctorClinic.id',
        'doctorClinic.name',
        'doctorClinic.slug',
        'doctorClinic.avatar',
        'doctorClinic.banner',
        'doctorClinic.address',

        'user.id',
        'user.fullName',
        'user.email',
        'user.avatarUrl',

        'schedule.id',
        'schedule.workDate',
        'schedule.startTime',
        'schedule.endTime',

        'package.id',
        'package.name',
        'package.price',
        'package.services',
        'package.description',
        'package.discountPercent',

        'packageSpecialty.id',
        'packageSpecialty.name',
        'packageSpecialty.imageUrl',

        'packageClinic.id',
        'packageClinic.name',
        'packageClinic.slug',
        'packageClinic.avatar',
        'packageClinic.banner',
        'packageClinic.address',
      ]);

    if (doctorId) qb.andWhere('appointment.doctorId = :doctorId', { doctorId });
    if (userId) qb.andWhere('appointment.userId = :userId', { userId });

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
        `TO_CHAR(schedule.startTime, 'HH24:MI') BETWEEN :startTime AND :endTime`,
        { startTime, endTime },
      );
    }

    if (isPackage === true) {
      qb.andWhere('appointment.packageId IS NOT NULL');
    } else if (isPackage === false) {
      qb.andWhere('appointment.packageId IS NULL');
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

  async findByCode(code: string) {
    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('doctor.clinic', 'doctorClinic')
      .leftJoin('doctor.specialty', 'doctorSpecialty')
      .leftJoin('appointment.user', 'user')
      .leftJoin('appointment.schedule', 'schedule')

      .leftJoin('appointment.package', 'package')
      .leftJoin('package.specialty', 'packageSpecialty')
      .leftJoin('package.clinic', 'packageClinic')

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

        'doctorSpecialty.id',
        'doctorSpecialty.name',
        'doctorSpecialty.imageUrl',

        'doctorClinic.id',
        'doctorClinic.name',
        'doctorClinic.slug',
        'doctorClinic.avatar',
        'doctorClinic.banner',
        'doctorClinic.address',

        'user.id',
        'user.fullName',
        'user.email',
        'user.avatarUrl',

        'schedule.id',
        'schedule.workDate',
        'schedule.startTime',
        'schedule.endTime',

        'package.id',
        'package.name',
        'package.price',
        'package.services',
        'package.description',
        'package.discountPercent',

        'packageSpecialty.id',
        'packageSpecialty.name',
        'packageSpecialty.imageUrl',

        'packageClinic.id',
        'packageClinic.name',
        'packageClinic.slug',
        'packageClinic.avatar',
        'packageClinic.banner',
        'packageClinic.address',
      ])
      .where('appointment.code = :code', { code });

    const appointment = await qb.getOne();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findOne(id: string) {
    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('doctor.clinic', 'doctorClinic')
      .leftJoin('doctor.specialty', 'doctorSpecialty')
      .leftJoin('appointment.user', 'user')
      .leftJoin('appointment.schedule', 'schedule')

      .leftJoin('appointment.package', 'package')
      .leftJoin('package.specialty', 'packageSpecialty')
      .leftJoin('package.clinic', 'packageClinic')

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

        'doctorSpecialty.id',
        'doctorSpecialty.name',
        'doctorSpecialty.imageUrl',

        'doctorClinic.id',
        'doctorClinic.name',
        'doctorClinic.slug',
        'doctorClinic.avatar',
        'doctorClinic.banner',
        'doctorClinic.address',

        'user.id',
        'user.fullName',
        'user.email',
        'user.avatarUrl',

        'schedule.id',
        'schedule.workDate',
        'schedule.startTime',
        'schedule.endTime',

        'package.id',
        'package.name',
        'package.price',
        'package.services',
        'package.description',
        'package.discountPercent',

        'packageSpecialty.id',
        'packageSpecialty.name',
        'packageSpecialty.imageUrl',

        'packageClinic.id',
        'packageClinic.name',
        'packageClinic.slug',
        'packageClinic.avatar',
        'packageClinic.banner',
        'packageClinic.address',
      ])
      .where('appointment.id = :id', { id });

    const appointment = await qb.getOne();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

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

  async findClinicDoctorsAppointments(
    userId: string,
    query: GetDoctorAppointmentsQueryDto,
  ) {
    const clinic = await this.clinicRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');

    const doctors = await this.doctorRepo.find({
      where: { clinic: { id: clinic.id } },
      select: ['id'],
    });

    const doctorIds = doctors.map((d) => d.id);

    const {
      status,
      search,
      startDate,
      endDate,
      doctorId,
      isPackage,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'ASC',
    } = query;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('doctor.specialty', 'specialty')
      .leftJoin('doctor.clinic', 'clinic')
      .leftJoin('appointment.user', 'user')
      .leftJoin('appointment.schedule', 'schedule')
      .leftJoin('appointment.package', 'package')
      .leftJoin('appointment.clinic', 'appointmentClinic')
      .leftJoin('package.clinic', 'packageClinic')
      .andWhere('user.role = :role', { role: 'user' })
      .select([
        'appointment.id',
        'appointment.code',
        'appointment.status',
        'appointment.notes',
        'appointment.phone',
        'appointment.address',
        'appointment.createdAt',

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
        'user.avatarUrl',

        'schedule.id',
        'schedule.workDate',
        'schedule.startTime',
        'schedule.endTime',

        'package.id',
        'package.name',
        'package.price',
        'package.services',
        'package.description',
        'package.discountPercent',

        'packageClinic.id',
        'packageClinic.name',
        'packageClinic.slug',
        'packageClinic.avatar',
        'packageClinic.address',
      ]);

    if (isPackage === true) {
      qb.andWhere('appointment.packageId IS NOT NULL');
      qb.andWhere('appointment.clinicId = :clinicId', {
        clinicId: clinic.id,
      });
    }

    if (isPackage === false) {
      qb.andWhere('appointment.packageId IS NULL');
      qb.andWhere('appointment.doctorId IN (:...doctorIds)', { doctorIds });
    }

    if (doctorId) {
      qb.andWhere('appointment.doctorId = :doctorId', { doctorId });
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

    if (search) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `LOWER(appointment.code) LIKE :keyword
       OR LOWER(user.fullName) LIKE :keyword
       OR LOWER(doctorUser.fullName) LIKE :keyword`,
        { keyword },
      );
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
        'appointment.address',
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
        'clinic.banner',

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

  async create(dto: CreateAppointmentDto, request: any) {
    await this.rateLimiter.checkAppointment(dto.userId);

    const isPackageMode = !!dto.packageId;
    const isDoctorMode = !!dto.doctorId && !!dto.scheduleId;

    if (!isPackageMode && !isDoctorMode) {
      throw new BadRequestException(
        'Either doctorId & scheduleId OR packageId must be provided',
      );
    }

    const appointmentRepo =
      request.queryRunner.manager.getRepository(Appointment);
    const userRepo = request.queryRunner.manager.getRepository(User);
    const doctorRepo = request.queryRunner.manager.getRepository(Doctor);
    const scheduleRepo = request.queryRunner.manager.getRepository(Schedule);
    const packageRepo = request.queryRunner.manager.getRepository(Package);

    const user = await userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    let doctor: Doctor | null = null;
    let schedule: Schedule | null = null;
    let pkg: Package | null = null;
    let clinic: Clinic | null = null;

    if (isDoctorMode) {
      doctor = await doctorRepo.findOne({
        where: { id: dto.doctorId },
        relations: ['clinic'],
      });
      if (!doctor) throw new NotFoundException('Doctor not found');

      schedule = await scheduleRepo.findOne({ where: { id: dto.scheduleId } });
      if (!schedule) throw new NotFoundException('Schedule not found');

      if (schedule.status === ScheduleStatus.booked) {
        throw new BadRequestException('This schedule has already been booked');
      }

      schedule.status = ScheduleStatus.booked;
      await scheduleRepo.save(schedule);

      clinic = doctor.clinic;
    }

    if (isPackageMode) {
      pkg = await packageRepo.findOne({
        where: { id: dto.packageId },
        relations: ['clinic'],
      });
      if (!pkg) throw new NotFoundException('Package not found');

      clinic = pkg.clinic;
    }

    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const randomPart = randomUUID().slice(0, 6).toUpperCase();
    const code = `APP-${y}${m}${d}-${randomPart}`;

    const appointment = appointmentRepo.create({
      user,
      code,
      doctor: doctor ?? undefined,
      schedule: schedule ?? undefined,
      package: pkg ?? undefined,
      clinic: clinic ?? undefined,
      phone: dto.phone,
      notes: dto.notes,
      wardId: dto.wardId,
      districtId: dto.districtId,
      provinceId: dto.provinceId,
      address: dto.address,
      status: AppointmentStatus.PENDING,
    });

    return appointmentRepo.save(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto, request: any) {
    const appointment = await this.findOne(id);

    if (dto.notes !== undefined) appointment.notes = dto.notes;

    if (dto.status) {
      appointment.status = dto.status;

      if (dto.status === AppointmentStatus.CANCELLED && appointment.schedule) {
        appointment.schedule.status = ScheduleStatus.available;
        await request.queryRunner.manager
          .getRepository(Schedule)
          .save(appointment.schedule);
      }
    }

    return request.queryRunner.manager
      .getRepository(Appointment)
      .save(appointment);
  }

  async remove(id: string, request: any) {
    const appointment = await this.findOne(id);
    await request.queryRunner.manager.remove(appointment);
    return { message: 'Appointment deleted successfully' };
  }
}
