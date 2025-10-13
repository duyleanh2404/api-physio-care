import { IsString, IsNotEmpty } from 'class-validator';

export class CreateQrResponseDto {
  qrUrl: string;
  sessionId: string;
  expiresIn: number;
}

export class ConfirmQrDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class CompleteQrDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
