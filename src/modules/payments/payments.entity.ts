import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentStatus } from 'src/enums/payments-status.enum';
import { Appointment } from '../appointments/appointments.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Appointment, (a) => a.payment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  appointmentId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 100 })
  transactionId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  rawDescription?: string;

  @CreateDateColumn()
  createdAt: Date;
}
