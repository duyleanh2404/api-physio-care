import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The OTP (One-Time Password) sent to the email',
  })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    example: 'newPassword123!',
    description: 'New password (minimum 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
