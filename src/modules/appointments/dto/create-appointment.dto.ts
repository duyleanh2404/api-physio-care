import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Doctor ID for the appointment',
  })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({
    description: 'User ID who books the appointment',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Optional notes for the appointment',
    required: false,
  })
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Province code of the user',
  })
  @IsString()
  provinceCode: string;

  @ApiProperty({
    description: 'District code of the user',
  })
  @IsString()
  districtCode: string;

  @ApiProperty({
    description: 'Ward code of the user',
  })
  @IsString()
  wardCode: string;

  @ApiProperty({
    description: 'Detailed address of the user (street, house number, etc.)',
  })
  @IsString()
  address: string;
}
