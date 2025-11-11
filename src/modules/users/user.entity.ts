import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ValueTransformer,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserStatus, UserProvider, UserRole } from 'src/enums/user.enums';

const booleanNumberTransformer: ValueTransformer = {
  to: (value: boolean) => (value ? 1 : 0),
  from: (value: number) => value === 1,
};

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

  @Column({ type: 'varchar2', length: 255, unique: true, nullable: true })
  slug?: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date;

  @Column({
    type: 'number',
    width: 1,
    default: 0,
    transformer: booleanNumberTransformer,
  })
  locked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastPasswordChangeAt: Date;

  @Column({ type: 'number', default: 0 })
  failedLoginAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
