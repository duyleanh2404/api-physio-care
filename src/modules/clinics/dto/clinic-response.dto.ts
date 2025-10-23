import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClinicResponseDto {
  @ApiProperty({
    example: '4f57a56d-20e7-4c4a-b5f3-f9b8a5fdb776',
    description: 'Unique identifier of the clinic',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'An Tâm General Clinic',
    description: 'Name of the clinic',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    example: '12 Nguyen Van Bao, Ward 4, Go Vap, Ho Chi Minh City',
    description: 'Full address of the clinic',
  })
  @Expose()
  address?: string;

  @ApiPropertyOptional({
    example: '0909 123 456',
    description: 'Contact phone number of the clinic',
  })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({
    example: 'info@antamclinic.vn',
    description: 'Contact email of the clinic',
  })
  @Expose()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://antamclinic.vn',
    description: 'Official website of the clinic',
  })
  @Expose()
  website?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.antamclinic.vn/avatar.jpg',
    description: 'Thumbnail or logo of the clinic',
  })
  @Expose()
  avatar?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.antamclinic.vn/banner.jpg',
    description: 'Banner image of the clinic',
  })
  @Expose()
  banner?: string;

  @ApiPropertyOptional({
    example:
      'The clinic specializes in internal medicine, ENT, dermatology, and cardiology.',
    description: 'Short description of clinic services and expertise',
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    example: 'Mon - Sun: 8:00 AM - 8:00 PM',
    description: 'Working hours of the clinic',
  })
  @Expose()
  workingHours?: string;

  @ApiProperty({
    example: '2025-10-14T08:00:00.000Z',
    description: 'Date when the clinic record was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-14T09:15:00.000Z',
    description: 'Date when the clinic record was last updated',
  })
  @Expose()
  updatedAt: Date;
}
