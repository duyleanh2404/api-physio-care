import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsInt } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Full name of the doctor' })
  @IsString({ message: 'fullName must be a string' })
  fullName: string;

  @ApiProperty({ description: 'UUID of the doctor’s medical specialty' })
  @IsUUID(undefined, { message: 'specialtyId must be a valid UUID' })
  specialtyId: string;

  @ApiProperty({ description: 'UUID of the clinic the doctor works at' })
  @IsUUID(undefined, { message: 'clinicId must be a valid UUID' })
  clinicId: string;

  @ApiProperty({ description: 'Doctor’s professional medical license number' })
  @IsString({ message: 'licenseNumber must be a string' })
  licenseNumber: string;

  @ApiProperty({
    description: 'Number of years the doctor has practiced professionally',
  })
  @IsInt({ message: 'yearsOfExperience must be an integer' })
  @Type(() => Number)
  yearsOfExperience: number;

  @ApiProperty({ description: 'Brief biography or background of the doctor' })
  @IsString({ message: 'bio must be a string' })
  bio: string;
}
