import { ApiProperty } from '@nestjs/swagger';

import { ClinicResponseDto } from 'src/modules/clinics/dto/clinic-response.dto';

export class EquipmentResponseDto {
  @ApiProperty({
    example: '9f7d2c9b-81d5-4d7b-9ab3-76db78cdca2f',
    description: 'Unique identifier of the equipment',
  })
  id: string;

  @ApiProperty({
    example: 'Ultrasound Machine Model X200',
    description: 'Name of the medical equipment',
  })
  name: string;

  @ApiProperty({
    example: 'Used for prenatal checkups and abdominal scans',
    description: 'Description or usage details of the equipment',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'inactive', 'maintenance'],
    description: 'Current operational status of the equipment',
  })
  status: string;

  @ApiProperty({
    example: '2025-11-11T09:30:00.000Z',
    description: 'Date and time when the equipment record was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-11-11T10:00:00.000Z',
    description: 'Date and time when the equipment record was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    type: () => ClinicResponseDto,
    description: 'Clinic that owns or manages this equipment',
  })
  clinic: ClinicResponseDto;
}
