import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEquipmentDto {
  @ApiProperty({
    example: 'Digital X-ray Machine',
    description: 'Updated equipment name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Software upgraded to the latest version',
    description: 'Updated description of the equipment (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'inactive',
    description: 'Updated operational status (active/inactive)',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}
