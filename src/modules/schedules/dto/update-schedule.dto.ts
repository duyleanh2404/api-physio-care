import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateScheduleDto {
  @ApiProperty({
    description: 'Unique ID of the doctor assigned to this schedule',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'The working date (format: YYYY-MM-DD)' })
  @IsDateString()
  workDate: string;

  @ApiProperty({ description: 'Start time of the schedule (format: HH:mm)' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time of the schedule (format: HH:mm)' })
  @IsString()
  endTime: string;

  @ApiProperty({
    required: false,
    description:
      'Optional status of the schedule (e.g., available, booked, cancelled)',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    required: false,
    description: 'Optional notes or remarks for this schedule',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
