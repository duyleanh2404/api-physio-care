import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GetSchedulesRangeDto {
  @ApiProperty({
    description: 'Start date of the range',
  })
  @IsDateString()
  @IsNotEmpty()
  dateFrom: string;

  @ApiProperty({
    description: 'End date of the range',
  })
  @IsDateString()
  @IsNotEmpty()
  dateTo: string;

  @ApiProperty({
    description: 'Doctor ID (optional)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiProperty({
    description: 'Clinic ID (optional)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  clinicId?: string;
}
