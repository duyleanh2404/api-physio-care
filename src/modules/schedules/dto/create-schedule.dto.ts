import {
  IsUUID,
  IsArray,
  IsString,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TimeSlotDto {
  @ApiProperty({ description: 'Start time of the time slot (format: HH:mm)' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time of the time slot (format: HH:mm)' })
  @IsString()
  endTime: string;
}

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Unique ID of the doctor assigned to this schedule',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'The working date (format: YYYY-MM-DD)' })
  @IsDateString()
  workDate: string;

  @ApiProperty({
    type: [TimeSlotDto],
    description: 'Array of time slots for this schedule',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];

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
