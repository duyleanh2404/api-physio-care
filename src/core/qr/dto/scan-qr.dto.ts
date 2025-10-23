import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ScanQrDto {
  @ApiProperty({ description: 'Nonce from QR code' })
  @IsString()
  @IsNotEmpty()
  nonce: string;
}
