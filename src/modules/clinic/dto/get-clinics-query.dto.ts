import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';

export class GetClinicsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by clinic name or address',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter clinics created after this date',
  })
  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter clinics created before this date',
  })
  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;

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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
