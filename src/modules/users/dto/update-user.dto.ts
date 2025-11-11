import {
  Min,
  IsInt,
  IsUrl,
  IsEnum,
  Matches,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserStatus } from 'src/enums/user.enums';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  fullName?: string;

  @ApiPropertyOptional({
    example: 'StrongP@ssword1!',
    description:
      'Password must be at least 8 characters, contain uppercase, lowercase, number, and special character',
    minLength: 8,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
  })
  password?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload a new avatar file (optional)',
  })
  @IsOptional()
  avatar?: any;

  @ApiPropertyOptional({
    example: UserStatus.ACTIVE,
    description: 'Status of the user',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid status' })
  status?: UserStatus;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @IsOptional()
  @IsString()
  verificationOtp?: string | null;

  @IsOptional()
  otpExpiresAt?: Date | null;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of consecutive failed login attempts',
  })
  @IsOptional()
  @IsInt({ message: 'failedLoginAttempts must be an integer' })
  @Min(0, { message: 'failedLoginAttempts cannot be negative' })
  failedLoginAttempts?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Indicates whether the account is locked',
  })
  @IsOptional()
  locked?: boolean;

  @ApiPropertyOptional({
    example: new Date().toISOString(),
    description: 'Timestamp of the last password change',
  })
  @IsOptional()
  lastPasswordChangeAt?: Date;
}
