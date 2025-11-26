import {
  Min,
  Max,
  IsUUID,
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({
    description: 'Package name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Original price of the package (before discount)',
    example: 1200000,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Discount percentage (0–100)',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiProperty({
    description: 'Detailed description of the package',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'List of services included in the package',
    example: ['Blood Test', 'Ultrasound', 'X-Ray'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  services?: string[];

  @ApiProperty({
    description: 'Clinic ID associated with the package',
  })
  @IsUUID()
  clinicId: string;

  @ApiProperty({
    description: 'Specialty ID associated with the package',
  })
  @IsUUID()
  specialtyId: string;
}
