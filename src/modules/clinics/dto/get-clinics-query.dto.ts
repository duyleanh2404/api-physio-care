import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';

export class GetClinicsQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword by clinic name or address',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter clinics created after this date (format: YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter clinics created before this date (format: YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by province code',
  })
  @IsOptional()
  @IsString()
  provinceCode?: string;

  @ApiPropertyOptional({
    description: 'Filter by district code',
  })
  @IsOptional()
  @IsString()
  districtCode?: string;

  @ApiPropertyOptional({
    description: 'Filter by ward code',
  })
  @IsOptional()
  @IsString()
  wardCode?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Field name to sort by',
    enum: ['createdAt', 'name', 'provinceCode', 'districtCode'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'name', 'provinceCode', 'districtCode'])
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    description: 'Sort order direction',
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
