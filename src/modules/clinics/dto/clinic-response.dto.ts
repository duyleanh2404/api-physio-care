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

  @ApiProperty({
    example: 'an-tam-general-clinic',
    description: 'URL-friendly unique slug for the clinic',
  })
  @Expose()
  slug: string;

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
    example: 'https://cdn.antamclinic.vn/avatar.jpg',
    description: 'Avatar or logo image of the clinic',
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
    description: 'Detailed description of clinic services and expertise',
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    example: 'Located near Go Vap Park, parking available for patients.',
    description: 'Additional internal notes or remarks about the clinic',
  })
  @Expose()
  notes?: string;

  @ApiProperty({
    example: 'c22c7e8f-1e35-4acb-9f51-52b5a68b37e1',
    description: 'Identifier of the user who owns or manages this clinic',
  })
  @Expose()
  userId: string;

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
