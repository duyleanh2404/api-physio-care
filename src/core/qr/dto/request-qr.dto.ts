import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestQrDto {
  @ApiProperty({
    description: 'Email of the user',
  })
  @IsEmail()
  email: string;
}
