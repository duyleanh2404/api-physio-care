import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Doctor } from './doctor.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Specialty } from '../specialties/specialty.entity';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';

import { UserService } from '../users/user.service';
import { UserRole, UserStatus } from 'src/enums/user.enums';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,

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
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.doctorRepo
      .createQueryBuilder('doctor')
      .leftJoin('doctor.user', 'user')
      .addSelect([
        'user.id',
        'user.email',
        'user.fullName',
        'user.avatarUrl',
        'user.role',
        'user.status',
        'user.provider',
        'user.createdAt',
        'user.updatedAt',
      ])
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.clinic', 'clinic');

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

  async findOne(id: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user', 'specialty'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async create(dto: CreateDoctorDto, avatar?: Express.Multer.File) {
    const email = `${dto.fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase()}@hospital.com`;

    const nowYear = new Date().getFullYear();
    const password = `${dto.fullName.replace(/\s+/g, '')}@${nowYear}!`;

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

    const doctor = this.doctorRepo.create({
      user,
      clinic,
      specialty,
      bio: dto.bio,
      licenseNumber: dto.licenseNumber,
      yearsOfExperience,
      avatar: avatarUrl || user.avatarUrl,
    });

    return this.doctorRepo.save(doctor);
  }

  async update(id: string, dto: UpdateDoctorDto, avatar?: Express.Multer.File) {
    const doctor = await this.findOne(id);

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

  async remove(id: string) {
    const doctor = await this.findOne(id);
    await this.doctorRepo.remove(doctor);
    return { message: 'Doctor deleted successfully' };
  }
}
