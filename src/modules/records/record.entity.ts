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

@Entity('records')
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar2', length: 50, unique: true })
  recordCode: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'patientsId' })
  patient: User;

  @Column()
  patientsId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column()
  doctorId: string;

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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
