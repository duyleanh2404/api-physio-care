import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Package } from './packages.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Specialty } from '../specialties/specialty.entity';

import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { GetPackagesQueryDto } from './dto/get-packages-query.dto';
import { GetMyPackagesQueryDto } from './dto/get-my-packages-query.dto';

import { UserRole } from 'src/enums/user.enums';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,

    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    userId: string,
    dto: CreatePackageDto,
    file?: Express.Multer.File,
  ) {
    let clinicId = dto.clinicId;

    if (!clinicId) {
      const clinic = await this.clinicRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!clinic)
        throw new ForbiddenException('Clinic not found or access denied');

      clinicId = clinic.id;
    }

    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(
        file,
        'packages',
      );
      imageUrl = uploaded.secure_url;
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

    const code = `PKG-${y}${m}${d}-${randomPart}`;

    const pkg = this.packageRepo.create({
      ...dto,
      code,
      clinicId,
      clinic: { id: clinicId } as any,
    });

    return this.packageRepo.save(pkg);
  }

  async findAll(query: GetPackagesQueryDto) {
    const {
      search,
      clinicId,
      specialtyId,
      dateFrom,
      dateTo,
      priceFrom,
      priceTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = '1',
      limit = '10',
    } = query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const qb = this.packageRepo.createQueryBuilder('pkg');

    if (search) {
      qb.andWhere(
        `(
        LOWER(pkg.code) LIKE :search OR 
        LOWER(pkg.name) LIKE :search OR 
        LOWER(pkg.description) LIKE :search
      )`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (clinicId) qb.andWhere('pkg.clinicId = :clinicId', { clinicId });

    if (specialtyId)
      qb.andWhere('pkg.specialtyId = :specialtyId', { specialtyId });

    if (dateFrom) {
      qb.andWhere('DATE(pkg.createdAt) >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      qb.andWhere('DATE(pkg.createdAt) <= :dateTo', { dateTo });
    }

    if (priceFrom) {
      qb.andWhere('pkg.price >= :priceFrom', { priceFrom: Number(priceFrom) });
    }

    if (priceTo) {
      qb.andWhere('pkg.price <= :priceTo', { priceTo: Number(priceTo) });
    }

    qb.leftJoinAndSelect('pkg.clinic', 'clinic').leftJoinAndSelect(
      'pkg.specialty',
      'specialty',
    );

    const validSortFields = ['createdAt', 'price', 'finalPrice', 'name'];

    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`pkg.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

    qb.skip((pageNumber - 1) * limitNumber).take(limitNumber);

    const [data, total] = await qb.getManyAndCount();

    return {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      data,
    };
  }

  async findMyPackages(userId: string, query: GetMyPackagesQueryDto) {
    const clinic = await this.clinicRepo.findOne({ where: { userId } });
    if (!clinic) throw new ForbiddenException('Clinic not found');

    const {
      search,
      specialtyId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.packageRepo
      .createQueryBuilder('pkg')
      .leftJoinAndSelect('pkg.specialty', 'specialty');

    qb.where('pkg.clinicId = :clinicId', { clinicId: clinic.id });

    if (search) {
      qb.andWhere(
        `(LOWER(pkg.name) LIKE :search 
        OR LOWER(pkg.description) LIKE :search
        OR LOWER(pkg.code) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (specialtyId) {
      qb.andWhere('pkg.specialtyId = :specialtyId', { specialtyId });
    }

    const validSortFields = [
      'name',
      'price',
      'discountPercent',
      'createdAt',
      'updatedAt',
      'code',
    ];

    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order: 'ASC' | 'DESC' =
      sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`pkg.${sortField}`, order);

    qb.skip((+page - 1) * +limit).take(+limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      page: +page,
      limit: +limit,
      total,
      totalPages: Math.ceil(total / +limit),
      data,
    };
  }

  async findOne(id: string) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['clinic', 'specialty'],
    });

    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async update(
    id: string,
    role: string,
    userId: string,
    dto: UpdatePackageDto,
    file?: Express.Multer.File,
  ) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['clinic', 'clinic.user'],
    });

    if (!pkg) throw new NotFoundException('Package not found');

    if (role === UserRole.CLINIC) {
      const ownerId = pkg.clinic?.user?.id;
      if (ownerId !== userId) {
        throw new ForbiddenException('You cannot update this package');
      }
    }

    const updateData: any = {};
    for (const key of Object.keys(dto)) {
      if (dto[key] !== undefined) {
        updateData[key] = dto[key];
      }
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(
        file,
        'packages',
      );
      updateData.image = uploaded.secure_url;
    }

    const newPrice = updateData.price ?? pkg.price;
    const newDiscount = updateData.discountPercent ?? pkg.discountPercent;
    updateData.finalPrice = Math.round(
      newPrice - (newPrice * newDiscount) / 100,
    );

    Object.assign(pkg, updateData);

    const saved = await this.packageRepo.save(pkg);
    const { clinic, ...cleaned } = saved;
    return cleaned;
  }

  async remove(id: string, userId: string, role: string) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['clinic', 'clinic.user'],
    });

    if (!pkg) throw new NotFoundException('Package not found');

    if (role === UserRole.CLINIC) {
      if (pkg.clinic.user.id !== userId) {
        throw new ForbiddenException('You cannot delete this package');
      }
    }

    await this.packageRepo.remove(pkg);
    return { message: 'Package deleted successfully' };
  }
}
