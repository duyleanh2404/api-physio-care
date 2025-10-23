import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Doctor } from '../doctors/doctor.entity';

@Entity('clinics')
export class Clinic {
  @OneToMany(() => Doctor, (doctor) => doctor.clinic)
  doctors: Doctor[];

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar2', length: 500, nullable: true })
  address?: string;

  @Column({ type: 'varchar2', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  banner?: string;

  @Column({ type: 'clob', nullable: true })
  description?: string;

  @Column({ type: 'clob', nullable: true })
  notes?: string;

  @Column({ type: 'varchar2', length: 20, nullable: true })
  provinceCode?: string;

  @Column({ type: 'varchar2', length: 20, nullable: true })
  districtCode?: string;

  @Column({ type: 'varchar2', length: 20, nullable: true })
  wardCode?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
