import {
  IsUUID,
  IsArray,
  IsString,
  IsOptional,
  IsDate,
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
    example: 'b3a64d8b-6b85-4cf4-a7d1-c94c3b4e5d33',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'The working date',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  workDate: Date;

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
    description: 'Status of the schedule (e.g., available, booked, cancelled)',
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
