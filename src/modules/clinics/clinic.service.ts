import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { slugifyName } from 'src/utils/slugify';

import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { GetClinicsQueryDto } from './dto/get-clinics-query.dto';

import { Clinic } from './clinic.entity';
import { UserRole, UserStatus } from 'src/enums/user.enums';

import { UserService } from '../users/user.service';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

@Injectable()
export class ClinicService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,

    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    dto: CreateClinicDto,
    files?: {
      avatar?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    if (files?.avatar?.[0]) {
      const uploadedAvatar = await this.cloudinaryService.uploadImage(
        files.avatar[0],
        'clinics/avatar',
      );
      dto.avatar = uploadedAvatar.secure_url;
    }

    if (files?.banner?.[0]) {
      const uploadedBanner = await this.cloudinaryService.uploadImage(
        files.banner[0],
        'clinics/banner',
      );
      dto.banner = uploadedBanner.secure_url;
    }

    let slug = slugifyName(dto.name);
    const existingClinic = await this.clinicRepo.findOne({ where: { slug } });
    if (existingClinic) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      slug = `${slug}-${randomSuffix}`;
    }

    const toPascalCase = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const email = `${dto.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase()}@hospital.com`;

    const nowYear = new Date().getFullYear();
    const password = `${toPascalCase(dto.name)}@${nowYear}!`;

    const userDto = {
      email,
      password,
      role: UserRole.CLINIC,
      fullName: dto.name,
      status: UserStatus.ACTIVE,
    };

    const user = await this.userService.create(userDto, files?.avatar?.[0]);

    const clinic = this.clinicRepo.create({
      ...dto,
      slug,
      userId: user.id,
    });

    return this.clinicRepo.save(clinic);
  }

  async findAll(query: GetClinicsQueryDto) {
    const {
      search,
      dateTo,
      dateFrom,
      provinceId,
      districtId,
      wardId,
      page = 1,
      limit = 10,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.clinicRepo.createQueryBuilder('clinic');

    if (search) {
      const keyword = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(TRIM(clinic.name)) LIKE :keyword').orWhere(
            'LOWER(TRIM(clinic.address)) LIKE :keyword',
          );
        }),
        { keyword },
      );
    }

    if (dateFrom && dateTo) {
      qb.andWhere('clinic.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    } else if (dateFrom) {
      qb.andWhere('clinic.createdAt >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      qb.andWhere('clinic.createdAt <= :dateTo', { dateTo });
    }

    if (provinceId) {
      qb.andWhere('clinic.provinceId = :provinceId', { provinceId });
    }
    if (districtId) {
      qb.andWhere('clinic.districtId = :districtId', { districtId });
    }
    if (wardId) {
      qb.andWhere('clinic.wardId = :wardId', { wardId });
    }

    const total = await qb.clone().getCount();

    qb.orderBy(`clinic.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('clinic.doctors', 'doctor');

    const data = await qb.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      data,
    };
  }

  async findBySlug(slug: string) {
    const clinic = await this.clinicRepo
      .createQueryBuilder('clinic')
      .select([
        'clinic.id',
        'clinic.name',
        'clinic.address',
        'clinic.avatar',
        'clinic.banner',
        'clinic.phone',
        'clinic.description',
      ])
      .where('clinic.slug = :slug', { slug })
      .getOne();

    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async findOne(id: string) {
    const clinic = await this.clinicRepo
      .createQueryBuilder('clinic')
      .select([
        'clinic.id',
        'clinic.name',
        'clinic.address',
        'clinic.avatar',
        'clinic.banner',
        'clinic.phone',
        'clinic.description',
      ])
      .where('clinic.id = :id', { id })
      .getOne();

    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async findMe(userId: string) {
    const clinic = await this.clinicRepo.findOne({
      where: { user: { id: userId } },
      select: ['id', 'name', 'address', 'avatar', 'banner'],
      relations: ['user'],
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found for this user');
    }

    const { password, verificationOtp, otpExpiresAt, ...safeUser } =
      clinic.user;

    return {
      clinicId: clinic.id,
      user: safeUser,
    };
  }

  async update(
    id: string,
    dto: UpdateClinicDto,
    files?: {
      avatar?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const clinic = await this.findOne(id);

    if (files?.avatar?.[0]) {
      const uploadedAvatar = await this.cloudinaryService.uploadImage(
        files.avatar[0],
        'clinics/avatar',
      );
      dto.avatar = uploadedAvatar.secure_url;
    }

    if (files?.banner?.[0]) {
      const uploadedBanner = await this.cloudinaryService.uploadImage(
        files.banner[0],
        'clinics/banner',
      );
      dto.banner = uploadedBanner.secure_url;
    }

    if (!dto.avatar) dto.avatar = clinic.avatar;
    if (!dto.banner) dto.banner = clinic.banner;

    Object.assign(clinic, dto);
    return this.clinicRepo.save(clinic);
  }

  async remove(id: string) {
    const clinic = await this.findOne(id);
    return this.clinicRepo.remove(clinic);
  }
}
