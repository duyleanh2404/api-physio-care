import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Record } from './record.entity';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';

import { SignatureModule } from 'src/core/signature/signature.module';
import { EncryptionModule } from 'src/core/encryption/encryption.module';

@Module({
  imports: [
    SignatureModule,
    EncryptionModule,
    TypeOrmModule.forFeature([Record]),
  ],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
