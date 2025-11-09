import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar2', length: 255, unique: true })
  slug: string;

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
  provinceId?: string;

  @Column({ type: 'varchar2', length: 20, nullable: true })
  districtId?: string;

  @Column({ type: 'varchar2', length: 20, nullable: true })
  wardId?: string;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Doctor, (doctor) => doctor.clinic)
  doctors: Doctor[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
