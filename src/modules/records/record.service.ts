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

import { Record } from './record.entity';
import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';

import {
  EncryptedFile,
  EncryptionService,
} from 'src/core/encryption/encryption.service';
import { SignatureService } from 'src/core/signature/signature.service';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';
import { GetMyPatientsRecordsQueryDto } from './dto/get-my-patients-records.dto';

@Injectable()
export class RecordService {
  private readonly logger = new Logger(RecordService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    private readonly signatureService: SignatureService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(
    dto: CreateRecordDto,
    file?: Express.Multer.File,
  ): Promise<Record> {
    const generateRecordCode = () =>
      `REC-${randomBytes(3).toString('hex').toUpperCase()}`;

    const patients = await this.userRepo.findOne({
      where: { id: dto.patientsId },
    });
    if (!patients)
      throw new NotFoundException(
        `Patient with id ${dto.patientsId} not found`,
      );

    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
    });
    if (!doctor)
      throw new NotFoundException(`Doctor with id ${dto.doctorId} not found`);

    const record = this.recordRepo.create({
      ...dto,
      doctor,
      patients,
      recordCode: generateRecordCode(),
    });

    if (file) {
      const encrypted: EncryptedFile = this.encryptionService.encrypt(
        file.buffer,
      );

      const decrypted = this.encryptionService.decrypt(encrypted);
      if (!decrypted.equals(file.buffer)) {
        this.logger.error('❌ Encryption verification failed');
        throw new Error('Encryption failed verification');
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
      if (!verified) {
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
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const qb = this.recordRepo
      .createQueryBuilder('record')
      .leftJoin('record.patients', 'patients')
      .addSelect([
        'patients.id',
        'patients.email',
        'patients.fullName',
        'patients.avatarUrl',
        'patients.role',
        'patients.status',
        'patients.provider',
        'patients.slug',
      ])
      .leftJoinAndSelect('record.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .addSelect([
        'doctorUser.id',
        'doctorUser.email',
        'doctorUser.fullName',
        'doctorUser.avatarUrl',
        'doctorUser.role',
        'doctorUser.status',
        'doctorUser.provider',
        'doctorUser.createdAt',
        'doctorUser.updatedAt',
      ]);

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
        patients,
        ...rest
      } = r;

      const { password, verificationOtp, otpExpiresAt, ...safePatient } =
        patients as User;

      return {
        ...rest,
        patients: safePatient,
      };
    });

    return { page, limit, total, totalPages, data: recordsWithoutFiles };
  }

  async findRecordsMyPatients(
    userId: string,
    query?: GetMyPatientsRecordsQueryDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing userId in token.');
    }

    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) {
      throw new NotFoundException(
        'No doctor record found for this user account.',
      );
    }

    const doctorId = doctor.id;

    const {
      search,
      status,
      dateTo,
      dateFrom,
      page = 1,
      frequency,
      intensity,
      limit = 10,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
    } = query || {};

    const qb = this.recordRepo
      .createQueryBuilder('record')
      .leftJoin('record.patients', 'patients')
      .addSelect([
        'patients.id',
        'patients.email',
        'patients.fullName',
        'patients.avatarUrl',
        'patients.role',
        'patients.status',
        'patients.provider',
        'patients.slug',
      ])
      .leftJoin('record.doctor', 'doctor')
      .addSelect([
        'doctor.id',
        'doctor.yearsOfExperience',
        'doctor.licenseNumber',
        'doctor.specialtyId',
        'doctor.clinicId',
      ])
      .leftJoin('doctor.user', 'doctorUser')
      .addSelect([
        'doctorUser.id',
        'doctorUser.email',
        'doctorUser.fullName',
        'doctorUser.avatarUrl',
        'doctorUser.role',
        'doctorUser.status',
        'doctorUser.provider',
        'doctorUser.slug',
      ])
      .where('record.doctorId = :doctorId', { doctorId });

    if (search) {
      qb.andWhere(
        `(record.history LIKE :search 
      OR record.goals LIKE :search 
      OR record.progress LIKE :search 
      OR record.recordCode LIKE :search)`,
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

    const frequencyList = parseArray(frequency);
    if (frequencyList.length)
      qb.andWhere('record.frequency IN (:...frequencyList)', { frequencyList });

    const intensityList = parseArray(intensity);
    if (intensityList.length)
      qb.andWhere('record.intensity IN (:...intensityList)', { intensityList });

    if (dateFrom) qb.andWhere('record.createdAt >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('record.createdAt <= :dateTo', { dateTo });

    qb.orderBy(`record.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [records, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const recordsSanitized = records.map((r) => {
      const {
        attachmentIv,
        attachmentTag,
        attachmentData,
        attachmentSignature,
        ...rest
      } = r;

      return rest;
    });

    return {
      page,
      limit,
      total,
      totalPages,
      data: recordsSanitized,
    };
  }

  async findOne(id: string): Promise<Record> {
    const record = await this.recordRepo
      .createQueryBuilder('record')
      .leftJoin('record.patients', 'patients')
      .addSelect([
        'patients.id',
        'patients.email',
        'patients.fullName',
        'patients.avatarUrl',
        'patients.role',
        'patients.status',
        'patients.provider',
        'patients.slug',
      ])
      .leftJoin('record.doctor', 'doctor')
      .addSelect([
        'doctor.id',
        'doctor.slug',
        'doctor.avatar',
        'doctor.yearsOfExperience',
        'doctor.licenseNumber',
      ])
      .leftJoin('doctor.user', 'doctorUser')
      .addSelect([
        'doctorUser.id',
        'doctorUser.email',
        'doctorUser.fullName',
        'doctorUser.avatarUrl',
        'doctorUser.role',
        'doctorUser.status',
        'doctorUser.provider',
        'doctorUser.createdAt',
        'doctorUser.updatedAt',
      ])
      .where('record.id = :id', { id })
      .getOne();

    if (!record) throw new NotFoundException('Record not found');

    const {
      attachmentIv,
      attachmentTag,
      attachmentData,
      attachmentSignature,
      ...rest
    } = record;

    return rest;
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

  async downloadEncryptedFile(id: string, res: Response): Promise<void> {
    const record = await this.getFullRecordWithFile(id);

    if (!record.attachmentData) {
      throw new NotFoundException(
        'This record does not have an encrypted file',
      );
    }

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(
        record.attachmentName + '.enc',
      )}"`,
    });

    res.send(record.attachmentData);
    this.logger.log(
      `📦 Encrypted file "${record.attachmentName}" sent successfully`,
    );
  }

  async verifyFileIntegrity(
    id: string,
    file: Express.Multer.File,
  ): Promise<{
    recordId: string;
    fileName: string;
    verified: boolean;
    message: string;
  }> {
    const record = await this.getFullRecordWithFile(id);
    if (!record) throw new NotFoundException('Record not found');

    if (
      !record.attachmentData ||
      !record.attachmentSignature ||
      !record.attachmentIv ||
      !record.attachmentTag
    ) {
      throw new BadRequestException('This record has no attached file');
    }

    const validSignature = this.signatureService.verifyBuffer(
      record.attachmentData,
      record.attachmentSignature,
    );

    const decryptedRecord = this.encryptionService.decrypt({
      ciphertext: record.attachmentData,
      iv: record.attachmentIv,
      tag: record.attachmentTag,
    });

    const sameOriginalFile = Buffer.compare(file.buffer, decryptedRecord) === 0;

    const verified = validSignature && sameOriginalFile;

    if (verified) {
      this.logger.log(
        `✅ File "${file.originalname}" verified successfully against record ${id}`,
      );
    } else {
      this.logger.error(
        `❌ Verification failed — file "${file.originalname}" does not match record ${id}`,
      );
    }

    return {
      recordId: id,
      fileName: file.originalname,
      verified,
      message: verified
        ? '✅ File is authentic and signature verified successfully'
        : '❌ File has been modified or signature mismatch',
    };
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.recordRepo.remove(record);
  }
}
