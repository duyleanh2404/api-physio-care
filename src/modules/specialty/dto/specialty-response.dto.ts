import { ApiProperty } from '@nestjs/swagger';

export class SpecialtyResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the specialty',
    example: 'd8f8a3e1-9c73-4c61-92b7-0af52c947b13',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the specialty',
    example: 'Physiotherapy',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the specialty',
    example: 'Physical therapy for rehabilitation and recovery',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Image URL representing the specialty',
    example: 'https://cdn.example.com/specialties/physiotherapy.jpg',
    nullable: true,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Date and time when the specialty was created',
    example: '2025-09-23T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the specialty was last updated',
    example: '2025-09-23T12:10:00.000Z',
  })
  updatedAt: Date;
}
