import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Package } from './packages.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Specialty } from '../specialties/specialty.entity';

import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Package, Clinic, Specialty])],
  controllers: [PackagesController],
  providers: [PackagesService, CloudinaryService],
})
export class PackagesModule {}
