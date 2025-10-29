import {
  IsUUID,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

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
    description: 'Appointment date and time',
  })
  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({
    description: 'Optional notes for the appointment',
    required: false,
  })
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
