import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Clinic } from '../clinics/clinic.entity';

@Entity('equipments')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar2', length: 100, nullable: true })
  code?: string;

  @Column({ type: 'varchar2', length: 100, nullable: true })
  type?: string;

  @Column({ type: 'varchar2', length: 100, nullable: true })
  model?: string;

  @Column({ type: 'varchar2', length: 100, nullable: true })
  serialNumber?: string;

  @Column({ type: 'varchar2', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'clob', nullable: true })
  description?: string;

  @Column({ type: 'varchar2', length: 500, nullable: true })
  image?: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.equipments, {
    onDelete: 'CASCADE',
  })
  clinic: Clinic;

  @Column()
  clinicId: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
