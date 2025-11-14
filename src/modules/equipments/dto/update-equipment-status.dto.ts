import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateEquipmentStatusDto {
  @ApiProperty({
    description: 'New status of the equipment',
    example: 'active',
  })
  @IsString()
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}
