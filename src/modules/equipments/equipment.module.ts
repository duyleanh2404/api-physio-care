import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Equipment } from './equipment.entity';
import { Clinic } from '../clinics/clinic.entity';

import { EquipmentService } from './equipment.service';
import { EquipmentsController } from './equipment.controller';
import { CloudinaryModule } from 'src/core/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment, Clinic]), CloudinaryModule],
  controllers: [EquipmentsController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
