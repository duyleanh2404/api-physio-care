import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Doctor } from '../doctors/doctor.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'timestamp' })
  workDate: Date;

  @Column({ type: 'varchar2', length: 10 })
  startTime: string;

  @Column({ type: 'varchar2', length: 10 })
  endTime: string;

  @Column({ type: 'varchar2', length: 50, default: 'available' })
  status: string;

  @Column({ type: 'clob', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
