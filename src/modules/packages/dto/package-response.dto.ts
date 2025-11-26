import { ApiProperty } from '@nestjs/swagger';

export class PackageResponseDto {
  @ApiProperty({ example: 'b4c1d3d2-7a3f-4f2e-9e67-123456789abc' })
  id: string;

  @ApiProperty({ example: 'Premium Health Check Package' })
  name: string;

  @ApiProperty({ example: 1200000 })
  price: number;

  @ApiProperty({ example: 10 })
  discountPercent: number;

  @ApiProperty({ example: 'A full advanced health check package.' })
  description: string;

  @ApiProperty({
    example: ['Blood Test Basic', 'X-ray Chest', 'Abdominal Ultrasound'],
    required: false,
  })
  services?: string[];

  @ApiProperty({ example: 'c3100591-0483-4b74-94fb-2ca651f5f7d5' })
  clinicId: string;

  @ApiProperty({ example: 'a1234f21-3211-42fc-a22b-111122223333' })
  specialtyId: string;

  @ApiProperty({ example: '2025-01-26T07:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-26T07:30:00.000Z' })
  updatedAt: Date;
}
