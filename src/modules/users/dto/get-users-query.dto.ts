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

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Search by email or full name',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
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
    example: 'email',
    enum: ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  @IsIn(['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'], {
    message: 'sortBy must be one of the allowed fields',
  })
  sortBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Sort order: ascending or descending',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString({ message: 'sortOrder must be a string' })
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder must be either ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    description: 'Comma-separated list of fields to return',
  })
  @IsOptional()
  @IsString({ message: 'fields must be a string' })
  fields?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (e.g. active, inactive, banned)',
  })
  @IsOptional()
  @IsString({ message: 'status must be a string' })
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by role (e.g. user, doctor)',
  })
  @IsOptional()
  @IsString({ message: 'role must be a string' })
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter users created from this date (ISO format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom must be a valid ISO date string' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter users created until this date (ISO format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateTo must be a valid ISO date string' })
  dateTo?: string;
}
