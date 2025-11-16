import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  patientsId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'active',
    enum: ['active', 'completed', 'pending'],
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  history?: string;

  @ApiPropertyOptional()
  @IsOptional()
  intensity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  frequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  goals?: string;

  @ApiPropertyOptional()
  @IsOptional()
  progress?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload a single attachment file (optional)',
  })
  @IsOptional()
  attachment?: any;
}
