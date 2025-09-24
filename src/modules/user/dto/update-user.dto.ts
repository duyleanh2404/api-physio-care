import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'user', description: 'New role of the user' })
  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  role?: string;

  @ApiPropertyOptional({ example: 'active', description: 'Status of the user' })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @IsOptional()
  @IsString()
  verificationOtp?: string | null;

  @IsOptional()
  otpExpiresAt?: Date | null;
}
