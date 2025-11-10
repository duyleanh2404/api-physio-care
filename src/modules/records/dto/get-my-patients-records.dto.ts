import {
  Min,
  IsIn,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMyPatientsRecordsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by goals, history, progress, or record code',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by record status (e.g. active, completed, pending)',
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by patient ID' })
  @IsOptional()
  @IsString({ message: 'patientsId must be a string' })
  patientsId?: string;

  @ApiPropertyOptional({ description: 'Filter by treatment type' })
  @IsOptional()
  @IsString({ message: 'treatmentType must be a string' })
  treatmentType?: string;

  @ApiPropertyOptional({ description: 'Filter by treatment frequency' })
  @IsOptional()
  @IsString({ message: 'frequency must be a string' })
  frequency?: string;

  @ApiPropertyOptional({ description: 'Filter by treatment intensity' })
  @IsOptional()
  @IsString({ message: 'intensity must be a string' })
  intensity?: string;

  @ApiPropertyOptional({
    description: 'Filter records created from this date (ISO format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom must be a valid ISO date string' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter records created until this date (ISO format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateTo must be a valid ISO date string' })
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    enum: [
      'id',
      'status',
      'patientsId',
      'treatmentType',
      'createdAt',
      'updatedAt',
    ],
  })
  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  @IsIn(
    ['id', 'status', 'patientsId', 'treatmentType', 'createdAt', 'updatedAt'],
    {
      message:
        'sortBy must be one of the allowed fields: id, status, patientsId, treatmentType, createdAt, updatedAt',
    },
  )
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order direction',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString({ message: 'sortOrder must be a string' })
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder must be either ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
