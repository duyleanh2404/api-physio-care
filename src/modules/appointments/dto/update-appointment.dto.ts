import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

export class UpdateAppointmentDto {
  @ApiProperty({
    description: 'Updated appointment date and time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({ description: 'Updated notes', required: false })
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Updated status',
    enum: AppointmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
