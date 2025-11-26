import {
  IsIn,
  IsUUID,
  IsString,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMyPackagesQueryDto {
  @ApiPropertyOptional({
    description: 'Search packages by name, code, description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by specialty ID',
  })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiPropertyOptional({
    description: 'Sort by field (default: createdAt)',
    example: 'createdAt',
    enum: [
      'name',
      'price',
      'discountPercent',
      'createdAt',
      'updatedAt',
      'code',
    ],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order (ASC or DESC)',
    example: 'DESC',
    enum: ['ASC', 'DESC', 'asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Current page (pagination)',
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
