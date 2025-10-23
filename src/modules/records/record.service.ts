import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';

import { Record } from './record.entity';
import {
  EncryptedFile,
  EncryptionService,
} from 'src/core/encryption/encryption.service';
import { SignatureService } from 'src/core/signature/signature.service';

@Injectable()
export class RecordService {
  private readonly logger = new Logger(RecordService.name);

  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,

    private readonly signatureService: SignatureService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(
    dto: CreateRecordDto,
    file?: Express.Multer.File,
  ): Promise<Record> {
    const generateRecordCode = () =>
      `REC-${randomBytes(3).toString('hex').toUpperCase()}`;

    const record = this.recordRepo.create({
      ...dto,
      recordCode: generateRecordCode(),
    });

    if (file) {
      const encrypted: EncryptedFile = this.encryptionService.encrypt(
        file.buffer,
      );

      const decrypted = this.encryptionService.decrypt(encrypted);

      if (!decrypted.equals(file.buffer)) {
        this.logger.error(
          '❌ Encryption verification failed — decrypted data does NOT match original',
        );
        throw new Error('Encryption failed verification');
      } else {
        this.logger.log(
          `✅ Encryption successful for file "${file.originalname}"`,
        );
      }

      record.attachmentIv = encrypted.iv;
      record.attachmentTag = encrypted.tag;
      record.attachmentMime = file.mimetype;
      record.attachmentName = file.originalname;
      record.attachmentData = encrypted.ciphertext;

      const signature = this.signatureService.signBuffer(encrypted.ciphertext);
      record.attachmentSignature = signature;

      const verified = this.signatureService.verifyBuffer(
        encrypted.ciphertext,
        signature,
      );

      if (verified) {
        this.logger.log(
          `✅ Digital signature successful for file "${file.originalname}"`,
        );
      } else {
        this.logger.error('❌ Digital signature verification failed');
        throw new Error('Signature verification failed');
      }
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
      const encrypted: EncryptedFile = this.encryptionService.encrypt(
        file.buffer,
      );

      const decrypted = this.encryptionService.decrypt(encrypted);
      if (!decrypted.equals(file.buffer)) {
        this.logger.error(
          '❌ Encryption verification failed — decrypted data does NOT match original (update)',
        );
        throw new Error('Encryption failed verification');
      } else {
        this.logger.log(
          `✅ Encryption successful for updated file "${file.originalname}"`,
        );
      }

      record.attachmentIv = encrypted.iv;
      record.attachmentTag = encrypted.tag;
      record.attachmentMime = file.mimetype;
      record.attachmentName = file.originalname;
      record.attachmentData = encrypted.ciphertext;

      const signature = this.signatureService.signBuffer(encrypted.ciphertext);
      record.attachmentSignature = signature;

      const verified = this.signatureService.verifyBuffer(
        encrypted.ciphertext,
        signature,
      );

      if (verified) {
        this.logger.log(
          `✅ Digital signature successful for updated file "${file.originalname}"`,
        );
      } else {
        this.logger.error('❌ Digital signature verification failed (update)');
        throw new Error('Signature verification failed');
      }
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
      frequency,
      intensity,
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
        `(record.history LIKE :search OR record.goals LIKE :search OR record.progress LIKE :search OR record.recordCode LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const parseArray = (val: any) =>
      Array.isArray(val)
        ? val
        : typeof val === 'string'
          ? val
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
          : [];

    const statusList = parseArray(status);
    if (statusList.length)
      qb.andWhere('record.status IN (:...statusList)', { statusList });

    const doctorList = parseArray(doctorId);
    if (doctorList.length)
      qb.andWhere('record.doctorId IN (:...doctorList)', { doctorList });

    const patientList = parseArray(patientsId);
    if (patientList.length)
      qb.andWhere('record.patientsId IN (:...patientList)', { patientList });

    const frequencyList = parseArray(frequency);
    if (frequencyList.length)
      qb.andWhere('record.frequency IN (:...frequencyList)', { frequencyList });

    const intensityList = parseArray(intensity);
    if (intensityList.length)
      qb.andWhere('record.intensity IN (:...intensityList)', { intensityList });

    const treatmentList = parseArray(treatmentType);
    if (treatmentList.length)
      qb.andWhere('record.treatmentType IN (:...treatmentList)', {
        treatmentList,
      });

    if (dateFrom) qb.andWhere('record.createdAt >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('record.createdAt <= :dateTo', { dateTo });

    qb.orderBy(`record.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [records, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const recordsWithoutFiles = records.map((r) => {
      const {
        attachmentIv,
        attachmentTag,
        attachmentData,
        attachmentSignature,
        ...rest
      } = r;
      return rest;
    });

    return { page, limit, total, totalPages, data: recordsWithoutFiles };
  }

  async findOne(id: string): Promise<Record> {
    const record = await this.recordRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');

    const {
      attachmentIv,
      attachmentTag,
      attachmentData,
      attachmentSignature,
      ...rest
    } = record;

    return rest as Record;
  }

  async getFullRecordWithFile(id: string): Promise<Record> {
    const record = await this.recordRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }

  async downloadFile(id: string, res: Response): Promise<void> {
    const record = await this.getFullRecordWithFile(id);

    if (
      !record.attachmentData ||
      !record.attachmentIv ||
      !record.attachmentTag
    ) {
      throw new NotFoundException('This record does not have an attached file');
    }

    if (!record.attachmentSignature) {
      throw new BadRequestException('Missing digital signature for this file');
    }

    const isValid = this.signatureService.verifyBuffer(
      record.attachmentData,
      record.attachmentSignature,
    );

    if (!isValid) {
      this.logger.error(
        `❌ Invalid signature for file "${record.attachmentName}"`,
      );
      throw new BadRequestException('File signature is invalid or tampered');
    } else {
      this.logger.log(
        `✅ Digital signature verified successfully for file "${record.attachmentName}"`,
      );
    }

    const decrypted = this.encryptionService.decrypt({
      ciphertext: record.attachmentData,
      iv: record.attachmentIv,
      tag: record.attachmentTag,
    });

    this.logger.log(
      `🔓 File "${record.attachmentName}" decrypted successfully`,
    );

    res.set({
      'Content-Type': record.attachmentMime || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(
        record.attachmentName || 'file.bin',
      )}"`,
    });

    res.send(decrypted);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.recordRepo.remove(record);
  }
}
