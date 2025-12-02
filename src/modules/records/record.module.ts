import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Record } from './record.entity';
import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Clinic } from '../clinics/clinic.entity';

import { RecordService } from './record.service';
import { RecordController } from './record.controller';

import { SignatureModule } from 'src/core/signature/signature.module';
import { EncryptionModule } from 'src/core/encryption/encryption.module';

@Module({
  imports: [
    SignatureModule,
    EncryptionModule,
    TypeOrmModule.forFeature([Record, User, Doctor, Clinic]),
  ],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
