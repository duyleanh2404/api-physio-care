import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

import { RecordStatus } from 'src/enums/patients.enum';

export class CreateRecordDto {
  @ApiProperty({ description: 'ID of the patient' })
  @IsNotEmpty({ message: 'Please provide the patient ID.' })
  @IsString({ message: 'Patient ID must be a string.' })
  patientsId: string;

  @ApiProperty({ description: 'ID of the doctor' })
  @IsNotEmpty({ message: 'Please provide the doctor ID.' })
  @IsString({ message: 'Doctor ID must be a string.' })
  doctorId: string;

  @ApiProperty({
    example: 'active',
    enum: Object.values(RecordStatus),
    description: 'Status of the record',
  })
  @IsNotEmpty({ message: 'Please select a status for the record.' })
  @IsEnum(Object.values(RecordStatus), {
    message: 'Status must be one of the allowed values.',
  })
  status: RecordStatus;

  @ApiProperty({ description: 'Medical history of the patient' })
  @IsNotEmpty({ message: 'Please provide the medical history.' })
  @IsString({ message: 'Medical history must be a string.' })
  history: string;

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

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload a single attachment file',
    required: false,
  })
  @IsOptional()
  attachment?: any;
}
