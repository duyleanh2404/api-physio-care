import { ApiProperty, OmitType } from '@nestjs/swagger';

import { DoctorResponseDto } from 'src/modules/doctors/dto/doctor-response.dto';

export class ScheduleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the schedule',
  })
  id: string;

  @ApiProperty({
    description: 'Date of the doctor’s work schedule',
  })
  workDate: Date;

  @ApiProperty({
    description: 'Start time of the schedule (format: HH:mm)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the schedule (format: HH:mm)',
  })
  endTime: string;

  @ApiProperty({
    description: 'Current status of the schedule (e.g., available, cancelled)',
  })
  status: string;

  @ApiProperty({
    required: false,
    description: 'Optional notes or additional remarks about this schedule',
  })
  notes?: string;

  @ApiProperty({
    description: 'Information about the assigned doctor',
    type: () => DoctorResponseDto,
  })
  doctor: DoctorResponseDto;

  @ApiProperty({
    description: 'Timestamp when the schedule was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the schedule was last updated',
  })
  updatedAt: Date;
}

export class ScheduleRangeResponseDto extends OmitType(ScheduleResponseDto, [
  'doctor',
] as const) {}
