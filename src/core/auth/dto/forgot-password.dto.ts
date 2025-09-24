import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      'The email address of the user who wants to reset their password',
  })
  @IsEmail()
  email: string;
}
