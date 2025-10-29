import {
  Min,
  IsInt,
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

export class GetAppointmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by doctor ID',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by start date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field, e.g., appointmentDate',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', example: 'ASC' })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
