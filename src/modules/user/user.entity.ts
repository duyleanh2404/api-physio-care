import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserStatus, UserProvider } from 'src/enums/user.enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'varchar2', length: 500, nullable: true })
  refreshToken?: string;

  @Column({ type: 'varchar2', length: 20, default: UserStatus.INACTIVE })
  status: string;

  @Column({ type: 'varchar2', length: 20, default: UserProvider.LOCAL })
  provider: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  verificationOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
