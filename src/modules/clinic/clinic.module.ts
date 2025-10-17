import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Clinic } from './clinic.entity';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { CloudinaryModule } from 'src/core/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic]), CloudinaryModule],
  controllers: [ClinicController],
  providers: [ClinicService],
  exports: [ClinicService],
})
export class ClinicModule {}
