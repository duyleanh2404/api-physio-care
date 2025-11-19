import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Equipment } from './equipment.entity';
import { Clinic } from '../clinics/clinic.entity';

import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { GetEquipmentsQueryDto } from './dto/get-equipments-query.dto';
import { GetMyEquipmentsQueryDto } from './dto/get-my-equipments-query.dto';

import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,

    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
  userId: string,
  dto: CreateEquipmentDto,
  file?: Express.Multer.File,
  ) {
    let clinicId = dto.clinicId;

    if (!clinicId) {
      const clinic = await this.clinicRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!clinic) {
        throw new ForbiddenException('Clinic not found or access denied');
      }

      clinicId = clinic.id;
    }

    let imageUrl: string | undefined;
    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file, 'equipments');
      imageUrl = uploaded.secure_url;
    }

    const equipment = this.equipmentRepo.create({
      ...dto,
      clinic: { id: clinicId },
      image: imageUrl,
    });

    return this.equipmentRepo.save(equipment);
  }

  async findAll(query: GetEquipmentsQueryDto) {
    const { search, status, clinicId, page = 1, limit = 10 } = query;

    const qb = this.equipmentRepo.createQueryBuilder('equipment');

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `(
        LOWER(equipment.name) LIKE :search OR
        LOWER(equipment.code) LIKE :search OR
        LOWER(equipment.model) LIKE :search OR
        LOWER(equipment.serialNumber) LIKE :search
      )`,
        { search: searchTerm },
      );
    }

    if (status) {
      const statusArray = status.split(',').map((s) => s.trim());
      qb.andWhere('equipment.status IN (:...statusArray)', { statusArray });
    }

    if (clinicId) {
      qb.andWhere('equipment.clinicId = :clinicId', { clinicId });
    }

    qb.leftJoinAndSelect('equipment.clinic', 'clinic')
      .orderBy('equipment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data };
  }

  async findMyEquipments(userId: string, query: GetMyEquipmentsQueryDto) {
    const clinic = await this.clinicRepo.findOne({
      where: { userId },
    });
    if (!clinic) throw new ForbiddenException('Clinic not found');

    const { search, status, page = 1, limit = 10 } = query;

    const qb = this.equipmentRepo.createQueryBuilder('equipment');
    qb.where('equipment.clinicId = :clinicId', { clinicId: clinic.id });

    if (search) {
      qb.andWhere(
        '(LOWER(equipment.name) LIKE :search OR LOWER(equipment.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (status) {
      const statusArray = status.split(',');
      ``;
      qb.andWhere('equipment.status IN (:...statusArray)', { statusArray });
    }

    qb.orderBy('equipment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data };
  }

  async findOne(id: string) {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['clinic'],
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  async update(id: string, userId: string, dto: UpdateEquipmentDto) {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['clinic', 'clinic.user'],
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    if (equipment.clinic.user.id !== userId) {
      throw new ForbiddenException('You cannot update this equipment');
    }

    Object.assign(equipment, dto);
    return this.equipmentRepo.save(equipment);
  }

  async updateStatus(
    id: string,
    userId: string,
    status: 'active' | 'inactive',
  ) {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['clinic', 'clinic.user'],
    });

    if (!equipment) throw new NotFoundException('Equipment not found');

    if (equipment.clinic.user.id !== userId) {
      throw new ForbiddenException('You cannot update this equipment');
    }

    equipment.status = status;
    return this.equipmentRepo.save(equipment);
  }

  async remove(id: string, userId: string) {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['clinic', 'clinic.user'],
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    if (equipment.clinic.user.id !== userId) {
      throw new ForbiddenException('You cannot delete this equipment');
    }

    await this.equipmentRepo.remove(equipment);
    return { message: 'Equipment deleted successfully' };
  }
}
