import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Clinic } from '../clinics/clinic.entity';
import { Specialty } from '../specialties/specialty.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int', nullable: true })
  discountPercent: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', array: true })
  services: string[];

  @Column({ type: 'uuid' })
  clinicId: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.packages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ type: 'uuid' })
  specialtyId: string;

  @ManyToOne(() => Specialty, (specialty) => specialty.packages, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'specialtyId' })
  specialty: Specialty;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
