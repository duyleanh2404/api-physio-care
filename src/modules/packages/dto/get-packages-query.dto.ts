import {
  IsIn,
  IsUUID,
  IsString,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPackagesQueryDto {
  @ApiPropertyOptional({
    description: 'Search packages by name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by clinic ID',
  })
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @ApiPropertyOptional({
    description: 'Filter by specialty ID',
  })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiPropertyOptional({
    description: 'Current page number',
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order (ASC | DESC)',
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Filter by created date (from YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by created date (to YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter packages with price >= priceFrom',
  })
  @IsOptional()
  @IsNumberString()
  priceFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter packages with price <= priceTo',
  })
  @IsOptional()
  @IsNumberString()
  priceTo?: string;
}
