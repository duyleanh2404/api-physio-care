import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({ description: 'ID of the patient' })
  @IsNotEmpty({ message: 'Please provide the patient ID.' })
  @IsString({ message: 'Patient ID must be a string.' })
  patientsId: string;

  @ApiPropertyOptional({ description: 'ID of the doctor (optional)' })
  @IsOptional()
  @IsString({ message: 'Doctor ID must be a string.' })
  doctorId?: string;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'completed', 'pending'],
    description: 'Status of the record',
  })
  @IsNotEmpty({ message: 'Please select a status for the record.' })
  @IsEnum(['active', 'completed', 'pending'], {
    message: 'Status must be one of the following: active, completed, pending.',
  })
  status: string;

  @ApiProperty({ description: 'Medical history of the patient' })
  @IsNotEmpty({ message: 'Please provide the medical history.' })
  @IsString({ message: 'Medical history must be a string.' })
  history: string;

  @ApiProperty({ description: 'Type of treatment' })
  @IsNotEmpty({ message: 'Please specify the type of treatment.' })
  @IsString({ message: 'Treatment type must be a string.' })
  treatmentType: string;

  @ApiProperty({ description: 'Intensity of treatment' })
  @IsNotEmpty({ message: 'Please specify the intensity.' })
  @IsString({ message: 'Intensity must be a string.' })
  intensity: string;

  @ApiProperty({ description: 'Frequency of treatment' })
  @IsNotEmpty({ message: 'Please specify the frequency of treatment.' })
  @IsString({ message: 'Frequency must be a string.' })
  frequency: string;

  @ApiProperty({ description: 'Treatment goals' })
  @IsNotEmpty({ message: 'Please provide the treatment goals.' })
  @IsString({ message: 'Treatment goals must be a string.' })
  goals: string;

  @ApiProperty({ description: 'Progress of the treatment' })
  @IsNotEmpty({ message: 'Please provide the treatment progress.' })
  @IsString({ message: 'Treatment progress must be a string.' })
  progress: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload a single attachment file (optional)',
  })
  @IsOptional()
  attachment?: any;
}
