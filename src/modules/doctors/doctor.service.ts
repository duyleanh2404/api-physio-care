import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { slugifyName } from 'src/utils/slugify';

import { Doctor } from './doctor.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Specialty } from '../specialties/specialty.entity';
import { Appointment } from '../appointments/appointments.entity';

import { UserService } from '../users/user.service';
import { UserRole, UserStatus } from 'src/enums/user.enums';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';
import { GetMyPatientsQueryDto } from './dto/get-my-patients-query.dto';
import { GetDoctorsByClinicQueryDto } from './dto/get-doctors-by-clinic.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,

    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: GetDoctorsQueryDto) {
    const {
      search,
      dateTo,
      yearsTo,
      clinicId,
      dateFrom,
      page = 1,
      yearsFrom,
      limit = 10,
      specialtyId,
      provinceId,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.doctorRepo
      .createQueryBuilder('doctor')
      .leftJoin('doctor.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName', 'user.avatarUrl'])
      .leftJoin('doctor.specialty', 'specialty')
      .addSelect(['specialty.id', 'specialty.name', 'specialty.imageUrl'])
      .leftJoin('doctor.clinic', 'clinic')
      .addSelect([
        'clinic.id',
        'clinic.name',
        'clinic.address',
        'clinic.avatar',
        'clinic.banner',
        'clinic.phone',
      ]);

    if (search) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.fullName) LIKE :keyword')
            .orWhere('LOWER(doctor.licenseNumber) LIKE :keyword')
            .orWhere('LOWER(specialty.name) LIKE :keyword');
        }),
        { keyword },
      );
    }

    if (specialtyId) {
      qb.andWhere('doctor.specialtyId = :specialtyId', { specialtyId });
    }

    if (clinicId) {
      qb.andWhere('doctor.clinicId = :clinicId', { clinicId });
    }

    if (provinceId) {
      qb.andWhere('clinic.provinceId = :provinceId', { provinceId });
    }

    if (yearsFrom !== undefined) {
      qb.andWhere('doctor.yearsOfExperience >= :yearsFrom', { yearsFrom });
    }

    if (yearsTo !== undefined) {
      qb.andWhere('doctor.yearsOfExperience <= :yearsTo', { yearsTo });
    }

    if (dateFrom && dateTo) {
      qb.andWhere('doctor.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
      });
    } else if (dateFrom) {
      qb.andWhere('doctor.createdAt >= :dateFrom', {
        dateFrom: new Date(dateFrom).toISOString(),
      });
    } else if (dateTo) {
      qb.andWhere('doctor.createdAt <= :dateTo', {
        dateTo: new Date(dateTo).toISOString(),
      });
    }

    qb.orderBy(`doctor.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
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

  async findMyPatients(userId: string, query: GetMyPatientsQueryDto) {
    const {
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found for this user');
    }

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .where('appointment.doctorId = :doctorId', { doctorId: doctor.id });

    if (search) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.fullName) LIKE :keyword').orWhere(
            'LOWER(user.email) LIKE :keyword',
          );
        }),
        { keyword },
      );
    }

    if (dateFrom && dateTo) {
      qb.andWhere('appointment.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
      });
    } else if (dateFrom) {
      qb.andWhere('appointment.createdAt >= :dateFrom', {
        dateFrom: new Date(dateFrom).toISOString(),
      });
    } else if (dateTo) {
      qb.andWhere('appointment.createdAt <= :dateTo', {
        dateTo: new Date(dateTo).toISOString(),
      });
    }

    qb.orderBy(
      `appointment.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    const appointments = await qb.getMany();

    const uniqueUsers = Object.values(
      appointments.reduce(
        (acc, { user }) => {
          if (!acc[user.id]) {
            const { password, verificationOtp, otpExpiresAt, ...safeUser } =
              user;
            acc[user.id] = safeUser;
          }
          return acc;
        },
        {} as Record<string, any>,
      ),
    );

    const total = uniqueUsers.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = uniqueUsers.slice(start, end);

    return {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      data,
    };
  }

  async findDoctorsByClinicUser(
    userId: string,
    query: GetDoctorsByClinicQueryDto,
  ) {
    const {
      search,
      specialtyId,
      yearsFrom,
      yearsTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.doctorRepo
      .createQueryBuilder('doctor')
      .innerJoin('doctor.clinic', 'clinic')
      .innerJoin('doctor.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName', 'user.avatarUrl'])
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .where('clinic.userId = :userId', { userId });

    if (search) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.fullName) LIKE :keyword OR LOWER(doctor.licenseNumber) LIKE :keyword)',
        { keyword },
      );
    }

    if (specialtyId) {
      qb.andWhere('doctor.specialtyId = :specialtyId', { specialtyId });
    }

    if (yearsFrom !== undefined) {
      qb.andWhere('doctor.yearsOfExperience >= :yearsFrom', { yearsFrom });
    }
    if (yearsTo !== undefined) {
      qb.andWhere('doctor.yearsOfExperience <= :yearsTo', { yearsTo });
    }

    qb.orderBy(`doctor.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data };
  }

  async findBySlug(slug: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { slug },
      relations: ['user', 'specialty', 'clinic'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with slug "${slug}" not found`);
    }

    return doctor;
  }

  async findByClinicAndSlug(clinicSlug: string, slug: string) {
    const doctor = await this.doctorRepo.findOne({
      where: {
        slug,
        clinic: { slug: clinicSlug },
      },
      relations: ['user', 'specialty', 'clinic'],
    });

    if (!doctor) {
      throw new NotFoundException(
        `Doctor with slug "${slug}" in clinic "${clinicSlug}" not found`,
      );
    }

    return doctor;
  }

  async findOne(id: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user', 'specialty'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async findMe(userId: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      select: ['id'],
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found for this user');
    }

    const { password, verificationOtp, otpExpiresAt, ...safeUser } =
      doctor.user;

    return {
      doctorId: doctor.id,
      user: safeUser,
    };
  }

  async create(dto: CreateDoctorDto, avatar?: Express.Multer.File) {
    const email = `${dto.fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase()}@hospital.com`;

    const nowYear = new Date().getFullYear();
    const password = `${dto.fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')}@${nowYear}!`;

    const userDto = {
      email,
      password,
      role: UserRole.DOCTOR,
      fullName: dto.fullName,
      status: UserStatus.ACTIVE,
    };

    const user = await this.userService.create(userDto, avatar);

    let avatarUrl: string | null = null;
    if (avatar) {
      const uploaded = await this.cloudinaryService.uploadImage(
        avatar,
        'doctors/avatar',
      );
      avatarUrl = uploaded.secure_url;
    }

    const specialty = await this.specialtyRepo.findOne({
      where: { id: dto.specialtyId },
    });
    if (!specialty) throw new NotFoundException('Specialty not found');

    const clinic = await this.clinicRepo.findOne({
      where: { id: dto.clinicId },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');

    const yearsOfExperience = Number(dto.yearsOfExperience);
    if (isNaN(yearsOfExperience)) {
      throw new BadRequestException('yearsOfExperience must be a number');
    }

    const slug = slugifyName(dto.fullName);

    const existingDoctor = await this.doctorRepo.findOne({ where: { slug } });
    let finalSlug = slug;
    if (existingDoctor) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      finalSlug = `${slug}-${randomSuffix}`;
    }

    const doctor = this.doctorRepo.create({
      user,
      clinic,
      specialty,
      bio: dto.bio,
      slug: finalSlug,
      yearsOfExperience,
      licenseNumber: dto.licenseNumber,
      avatar: avatarUrl || user.avatarUrl,
    });

    return this.doctorRepo.save(doctor);
  }

  async update(
    id: string,
    dto: UpdateDoctorDto,
    avatar: Express.Multer.File,
    userId: string,
    role: string,
  ) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['clinic', 'user', 'specialty'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (role === 'clinic' && doctor.clinic.userId !== userId) {
      throw new ForbiddenException(
        'You cannot update a doctor not in your clinic',
      );
    }

    if (dto.specialtyId) {
      const specialty = await this.specialtyRepo.findOne({
        where: { id: dto.specialtyId },
      });
      if (!specialty) throw new NotFoundException('Specialty not found');
      doctor.specialty = specialty;
    }

    if (avatar) {
      const uploadedAvatar = await this.cloudinaryService.uploadImage(
        avatar,
        'doctors/avatar',
      );
      doctor.avatar = uploadedAvatar.secure_url;
    }

    Object.assign(doctor, dto);
    return this.doctorRepo.save(doctor);
  }

  async remove(id: string, userId: string, role: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['clinic', 'user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (role === 'clinic' && doctor.clinic.userId !== userId) {
      throw new ForbiddenException(
        'You cannot delete a doctor not in your clinic',
      );
    }

    await this.doctorRepo.remove(doctor);
    return { message: 'Doctor deleted successfully' };
  }
}
