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

@Entity('records')
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar2', length: 50, unique: true })
  recordCode: string;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'patientsId' })
  patients?: User;

  @Column({ nullable: true })
  patientsId?: string;

  @ManyToOne(() => Doctor, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor?: Doctor;

  @Column({ nullable: true })
  doctorId?: string;

  @Column({ type: 'varchar2', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'varchar2', length: 2000, nullable: true })
  history?: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  treatmentType?: string;

  @Column({ type: 'varchar2', length: 100, nullable: true })
  intensity?: string;

  @Column({ type: 'varchar2', length: 100, nullable: true })
  frequency?: string;

  @Column({ type: 'varchar2', length: 2000, nullable: true })
  goals?: string;

  @Column({ type: 'varchar2', length: 2000, nullable: true })
  progress?: string;

  @Column({ type: 'blob', nullable: true })
  attachmentData?: Buffer;

  @Column({ type: 'raw', length: 12, nullable: true })
  attachmentIv?: Buffer;

  @Column({ type: 'raw', length: 16, nullable: true })
  attachmentTag?: Buffer;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  attachmentName?: string;

  @Column({ type: 'varchar2', length: 100, nullable: true })
  attachmentMime?: string;

  @Column({ type: 'clob', nullable: true })
  attachmentSignature?: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
