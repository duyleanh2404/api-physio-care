import {
  IsUUID,
  Length,
  Matches,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Doctor ID for the appointment (required if no packageId)',
    required: false,
  })
  @ValidateIf((o) => !o.packageId)
  @IsUUID('4', { message: 'doctorId must be a valid UUID v4' })
  @IsNotEmpty({
    message: 'doctorId is required when packageId is not provided',
  })
  doctorId?: string;

  @ApiProperty({
    description: 'Schedule ID for the appointment (required if no packageId)',
    required: false,
  })
  @ValidateIf((o) => !o.packageId)
  @IsUUID('4', { message: 'scheduleId must be a valid UUID v4' })
  @IsNotEmpty({
    message: 'scheduleId is required when packageId is not provided',
  })
  scheduleId?: string;

  @ApiProperty({
    description: 'Package ID for appointment (required if no doctorId)',
    required: false,
  })
  @ValidateIf((o) => !o.doctorId && !o.scheduleId)
  @IsUUID('4', { message: 'packageId must be a valid UUID v4' })
  @IsNotEmpty({
    message:
      'packageId is required when doctorId and scheduleId are not provided',
  })
  packageId?: string;

  @ApiProperty({ description: 'User ID who books the appointment' })
  @IsUUID('4', { message: 'userId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @ApiProperty({
    description: 'Phone number (Vietnam format: 0xxxxxxxxx)',
  })
  @IsString()
  @Matches(/^(0|\+84)(\d{9})$/, {
    message: 'phone must be a valid Vietnamese phone number',
  })
  @Length(10, 12)
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d+$/)
  @IsNotEmpty()
  provinceId: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d+$/)
  @IsNotEmpty()
  districtId: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d+$/)
  @IsNotEmpty()
  wardId: string;

  @ApiProperty()
  @IsString()
  @Length(5, 255)
  @IsNotEmpty()
  address: string;
}
