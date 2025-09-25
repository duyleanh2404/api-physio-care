import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({
    description: 'The email address to resend the OTP to',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
