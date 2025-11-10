import { ApiProperty } from '@nestjs/swagger';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { DoctorResponseDto } from 'src/modules/doctors/dto/doctor-response.dto';

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: 'a890c41f-a963-432c-8d52-9b9e236442e3',
  })
  id: string;

  @ApiProperty({ description: 'Doctor information', type: DoctorResponseDto })
  doctor: DoctorResponseDto;

  @ApiProperty({ description: 'User information', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Appointment date and time',
    example: '2025-11-10T17:00:00.000Z',
  })
  appointmentDate: string;

  @ApiProperty({
    description: 'Optional notes',
    required: false,
    example: 'Patient prefers morning schedule.',
  })
  notes?: string;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Created date',
    example: '2025-11-10T06:47:19.710Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Updated date',
    example: '2025-11-10T06:47:19.710Z',
  })
  updatedAt: string;
}
