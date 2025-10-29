import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Specialty } from '../specialties/specialty.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Specialty, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'specialtyId' })
  specialty: Specialty;

  @ManyToOne(() => Clinic, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ type: 'varchar2', length: 255, unique: true })
  slug: string;

  @Column({ nullable: true })
  licenseNumber?: string;

  @Column({ type: 'int', nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'clob', nullable: true })
  bio?: string;

  @Column({ type: 'varchar2', length: 500, nullable: true })
  avatar?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
