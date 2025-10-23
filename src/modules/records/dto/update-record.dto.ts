import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRecordDto {
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  patientsId?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'active',
    enum: ['active', 'completed', 'pending'],
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  history?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  treatmentType?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  intensity?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  frequency?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  goals?: string;

  @ApiPropertyOptional({ example: '' })
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
