import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'patientsId is required' })
  @IsString({ message: 'patientsId must be a string' })
  patientsId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'doctorId is required' })
  @IsString({ message: 'doctorId must be a string' })
  doctorId: string;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'completed', 'pending'],
    description: 'Record status',
  })
  @IsNotEmpty({ message: 'status is required' })
  @IsEnum(['active', 'completed', 'pending'], {
    message: 'status must be one of: active, completed, pending',
  })
  status: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'history is required' })
  @IsString({ message: 'history must be a string' })
  history: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'treatmentType is required' })
  @IsString({ message: 'treatmentType must be a string' })
  treatmentType: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'intensity is required' })
  @IsString({ message: 'intensity must be a string' })
  intensity: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'frequency is required' })
  @IsString({ message: 'frequency must be a string' })
  frequency: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'goals is required' })
  @IsString({ message: 'goals must be a string' })
  goals: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'progress is required' })
  @IsString({ message: 'progress must be a string' })
  progress: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload a single attachment file (optional)',
  })
  @IsOptional()
  attachment?: any;
}
