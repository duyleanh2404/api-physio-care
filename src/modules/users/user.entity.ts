import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserStatus, UserProvider, UserRole } from 'src/enums/user.enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'varchar2',
    length: 20,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'varchar2', length: 20, default: UserStatus.INACTIVE })
  status: string;

  @Column({ type: 'varchar2', length: 20, default: UserProvider.LOCAL })
  provider: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  verificationOtp: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
