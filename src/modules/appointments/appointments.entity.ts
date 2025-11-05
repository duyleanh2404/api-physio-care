import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Schedule } from '../schedules/schedule.entity';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar2', length: 50, unique: true })
  code: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @Column({ type: 'varchar2', length: 20, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Column({ type: 'clob', nullable: true })
  notes?: string;

  @Column({ type: 'varchar2', length: 20 })
  phone: string;

  @Column({ type: 'varchar2', length: 10 })
  provinceId: string;

  @Column({ type: 'varchar2', length: 10 })
  districtId: string;

  @Column({ type: 'varchar2', length: 10 })
  wardId: string;

  @Column({ type: 'varchar2', length: 500 })
  address: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
