import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Length,
  Matches,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateClinicDto {
  @ApiProperty({ description: 'Name of the clinic' })
  @IsString()
  @IsNotEmpty({ message: 'Clinic name is required' })
  @Length(3, 255, {
    message: 'Clinic name must be between 3 and 255 characters',
  })
  name: string;

  @ApiProperty({ description: 'Full address of the clinic' })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @Length(5, 255, {
    message: 'Address must be between 5 and 255 characters',
  })
  address: string;

  @ApiProperty({ description: 'Clinic contact phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9\-\+\s]{8,15}$/, {
    message:
      'Phone number must contain 8–15 digits and may include + or - characters',
  })
  phone: string;

  @ApiProperty({
    description: 'Province/City code of the clinic (VD: 79 for HCM)',
    example: '79',
  })
  @IsString()
  @IsNotEmpty({ message: 'Province code is required' })
  @Length(1, 20, { message: 'Province code must not exceed 20 characters' })
  provinceId: string;

  @ApiProperty({
    description: 'District code of the clinic',
    example: '760',
  })
  @IsString()
  @IsNotEmpty({ message: 'District code is required' })
  @Length(1, 20, { message: 'District code must not exceed 20 characters' })
  districtId: string;

  @ApiProperty({
    description: 'Ward code of the clinic',
    example: '26734',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ward code is required' })
  @Length(1, 20, { message: 'Ward code must not exceed 20 characters' })
  wardId: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload a new avatar file (optional)',
  })
  avatar?: any;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload a new banner file (optional)',
  })
  banner?: any;

  @ApiPropertyOptional({
    description:
      'Detailed description of the clinic’s services and specialties',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Internal notes or additional information about the clinic',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;
}
