import {
  IsUUID,
  Length,
  Matches,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Doctor ID for the appointment',
  })
  @IsUUID('4', { message: 'doctorId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'doctorId is required' })
  doctorId: string;

  @ApiProperty({
    description: 'User ID who books the appointment',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @ApiProperty({
    description: 'Schedule ID for the appointment',
  })
  @IsUUID('4', { message: 'scheduleId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'scheduleId is required' })
  scheduleId: string;

  @ApiProperty({
    description: 'Phone number of the user (Vietnam format: 0xxxxxxxxx)',
  })
  @IsString({ message: 'phone must be a string' })
  @Matches(/^(0|\+84)(\d{9})$/, {
    message: 'phone must be a valid Vietnamese phone number',
  })
  @Length(10, 12, { message: 'phone must be between 10 and 12 digits' })
  @IsNotEmpty({ message: 'phone is required' })
  phone: string;

  @ApiProperty({
    description: 'Optional notes for the appointment',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @Length(0, 1000, { message: 'notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiProperty({
    description: 'Province code of the user',
  })
  @IsString({ message: 'provinceCode must be a string' })
  @Matches(/^\d+$/, { message: 'provinceCode must contain only digits' })
  @IsNotEmpty({ message: 'provinceCode is required' })
  provinceCode: string;

  @ApiProperty({
    description: 'District code of the user',
  })
  @IsString({ message: 'districtCode must be a string' })
  @Matches(/^\d+$/, { message: 'districtCode must contain only digits' })
  @IsNotEmpty({ message: 'districtCode is required' })
  districtCode: string;

  @ApiProperty({
    description: 'Ward code of the user',
  })
  @IsString({ message: 'wardCode must be a string' })
  @Matches(/^\d+$/, { message: 'wardCode must contain only digits' })
  @IsNotEmpty({ message: 'wardCode is required' })
  wardCode: string;

  @ApiProperty({
    description: 'Detailed address (house number, street, etc.)',
  })
  @IsString({ message: 'address must be a string' })
  @Length(5, 255, { message: 'address must be between 5 and 255 characters' })
  @IsNotEmpty({ message: 'address is required' })
  address: string;
}
