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
    type: 'varchar',
    length: 20,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserStatus.INACTIVE,
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserProvider.LOCAL,
  })
  provider: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  verificationOtp: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  slug?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  otpExpiresAt: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  locked: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastPasswordChangeAt: Date;

  @Column({
    type: 'int',
    default: 0,
  })
  failedLoginAttempts: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
