import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { slugifyName } from 'src/utils/slugify';

import { Specialty } from './specialty.entity';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { GetSpecialtiesQueryDto } from './dto/get-specialties-query.dto';

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepo: Repository<Specialty>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: GetSpecialtiesQueryDto) {
    const {
      search,
      dateTo,
      dateFrom,
      page = 1,
      limit = 10,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.specialtyRepo.createQueryBuilder('specialty');

    if (dateFrom) {
      qb.andWhere('specialty.createdAt >= :dateFrom', {
        dateFrom: new Date(new Date(dateFrom).setHours(0, 0, 0, 0)),
      });
    }

    if (dateTo) {
      qb.andWhere('specialty.createdAt <= :dateTo', {
        dateTo: new Date(new Date(dateTo).setHours(23, 59, 59, 999)),
      });
    }

    if (search) {
      qb.andWhere('LOWER(TRIM(specialty.name)) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.clone().getCount();
    const totalPages = Math.ceil(total / limit);

    const validSortFields = ['id', 'name', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`specialty.${sortField}`, sortOrder as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const data = await qb.getMany();

    return {
      page,
      limit,
      total,
      totalPages,
      data,
    };
  }

  async findBySlug(slug: string) {
    const specialty = await this.specialtyRepo.findOne({
      where: { slug },
    });

    if (!specialty) throw new NotFoundException('Specialty not found');
    return specialty;
  }

  async findOne(id: string) {
    const specialty = await this.specialtyRepo.findOne({ where: { id } });
    if (!specialty) throw new NotFoundException('Specialty not found');
    return specialty;
  }

  async create(
    dto: CreateSpecialtyDto,
    request: any,
    image?: Express.Multer.File,
  ) {
    const specialtyRepo = request.queryRunner.manager.getRepository(Specialty);

    const existing = await specialtyRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Specialty name already exists');

    if (image) {
      const uploaded = await this.cloudinaryService.uploadImage(
        image,
        'specialty',
      );
      dto.imageUrl = uploaded.secure_url;
    }

    let slug = slugifyName(dto.name);

    const existingSlug = await specialtyRepo.findOne({ where: { slug } });
    if (existingSlug) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      slug = `${slug}-${randomSuffix}`;
    }

    const specialty = specialtyRepo.create({ ...dto, slug });
    return specialtyRepo.save(specialty);
  }

  async update(
    id: string,
    dto: UpdateSpecialtyDto,
    image?: Express.Multer.File,
  ) {
    const specialty = await this.specialtyRepo.findOne({ where: { id } });
    if (!specialty) throw new NotFoundException('Specialty not found');

    if (image) {
      const uploaded = await this.cloudinaryService.uploadImage(
        image,
        'specialty',
      );
      dto.imageUrl = uploaded.secure_url;
    }

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        (specialty as any)[key] = value;
      }
    });

    return this.specialtyRepo.save(specialty);
  }

  async remove(id: string, request: any) {
    const specialtyRepo = request.queryRunner.manager.getRepository(Specialty);

    const specialty = await specialtyRepo.findOne({ where: { id } });
    if (!specialty) throw new NotFoundException('Specialty not found');

    await specialtyRepo.delete(id);
    return { message: 'Specialty deleted successfully' };
  }
}
