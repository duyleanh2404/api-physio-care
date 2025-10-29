import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt, IsString, IsIn } from 'class-validator';

export class GetSchedulesQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword (e.g., doctor name or notes)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter schedules by a specific doctor ID',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter schedules starting from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter schedules up to this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by schedule status (comma-separated or array)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Field name to sort by',
    enum: ['createdAt', 'workDate', 'doctorName', 'status'],
    example: 'workDate',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'workDate', 'doctorName', 'status'])
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
