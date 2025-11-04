import {
  Min,
  IsInt,
  IsEnum,
  IsUUID,
  Matches,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

export class GetAppointmentsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by doctor ID' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description:
      'Filter by appointment status (single or comma-separated for multiple)',
    enum: AppointmentStatus,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus, { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  status?: AppointmentStatus | AppointmentStatus[];

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment start time (HH:mm or HH:mm:ss)',
  })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'startTime must be in HH:mm or HH:mm:ss format',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment end time (HH:mm or HH:mm:ss)',
  })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'endTime must be in HH:mm or HH:mm:ss format',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field, e.g., appointmentDate',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'ASC',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
