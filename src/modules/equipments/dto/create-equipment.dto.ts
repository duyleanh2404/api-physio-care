import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEquipmentDto {
  @ApiProperty({
    description: 'The name of the medical equipment',
  })
  @IsNotEmpty({ message: 'Equipment name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Equipment code',
  })
  @IsNotEmpty({ message: 'Equipment code is required' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Type of the equipment (e.g., Ultrasound, Laser, etc.)',
  })
  @IsNotEmpty({ message: 'Equipment type is required' })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Equipment model',
  })
  @IsNotEmpty({ message: 'Equipment model is required' })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Serial number of the equipment',
  })
  @IsNotEmpty({ message: 'Serial number is required' })
  @IsString()
  serialNumber: string;

  @ApiProperty({
    example:
      'High-quality diagnostic imaging equipment used for 4D ultrasound.',
    description: 'Detailed description of the equipment (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description:
      'Operational status of the equipment (active/inactive/maintenance)',
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  status: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file of the equipment (optional)',
    required: false,
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    description: 'Clinic ID that owns this equipment (for admin use only)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  clinicId?: string;
}
