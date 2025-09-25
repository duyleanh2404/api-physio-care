import {
  IsUrl,
  IsEmail,
  Matches,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Please enter your email' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(50, { message: 'Email must not exceed 50 characters' })
  email: string;

  @ApiPropertyOptional({
    example: 'Abcd1234!',
    description:
      'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
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

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Please enter your full name' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(50, { message: 'Full name must not exceed 50 characters' })
  fullName: string;

  @ApiProperty({
    example: 'user',
    description: 'Role of the user',
  })
  @IsString({ message: 'Role must be a string' })
  @IsNotEmpty({ message: 'Please select a role' })
  role: string;

  @IsOptional()
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
