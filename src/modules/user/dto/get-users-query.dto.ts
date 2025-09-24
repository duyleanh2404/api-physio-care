import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';

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
}
