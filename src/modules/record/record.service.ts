import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';

import { Record } from './record.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private recordRepo: Repository<Record>,
  ) {}

  async create(
    dto: CreateRecordDto,
    file?: Express.Multer.File,
  ): Promise<Record> {
    const generateRecordCode = () => {
      const randomStr = randomBytes(3).toString('hex').toUpperCase();
      return `REC-${randomStr}`;
    };

    const record = this.recordRepo.create({
      ...dto,
      recordCode: generateRecordCode(),
    });

    if (file) {
      record.attachmentData = file.buffer;
      record.attachmentName = file.originalname;
      record.attachmentMime = file.mimetype;
    }

    return await this.recordRepo.save(record);
  }

  async update(
    id: string,
    dto: UpdateRecordDto,
    file?: Express.Multer.File,
  ): Promise<Record> {
    const record = await this.findOne(id);

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (record as any)[key] = value;
      }
    });

    if (file) {
      record.attachmentData = file.buffer;
      record.attachmentName = file.originalname;
      record.attachmentMime = file.mimetype;
    }

    return this.recordRepo.save(record);
  }

  async findAll(query: GetRecordsQueryDto) {
    const {
      search,
      status,
      dateTo,
      dateFrom,
      doctorId,
      page = 1,
      limit = 10,
      patientsId,
      treatmentType,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.recordRepo
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('record.doctor', 'doctor');

    if (search) {
      qb.andWhere(
        '(record.history LIKE :search OR record.goals LIKE :search OR record.progress LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (patientsId)
      qb.andWhere('record.patientsId = :patientsId', { patientsId });

    if (treatmentType)
      qb.andWhere('record.treatmentType = :treatmentType', { treatmentType });

    if (status) qb.andWhere('record.status = :status', { status });
    if (dateTo) qb.andWhere('record.createdAt <= :dateTo', { dateTo });
    if (doctorId) qb.andWhere('record.doctorId = :doctorId', { doctorId });
    if (dateFrom) qb.andWhere('record.createdAt >= :dateFrom', { dateFrom });

    qb.orderBy(`record.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [records, total] = await qb.getManyAndCount();

    return { data: records, total, page, limit };
  }

  async findOne(id: string): Promise<Record> {
    const record = await this.recordRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.recordRepo.remove(record);
  }
}
