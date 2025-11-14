import {
  Min,
  IsIn,
  IsInt,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserStatus } from 'src/enums/user.enums';

export class GetMyPatientsQueryDto {
  @ApiPropertyOptional({ description: 'Search by patient name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by user status (single or comma-separated)',
    enum: UserStatus,
    example: 'active,inactive',
  })
  @IsOptional()
  @IsEnum(UserStatus, { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  status?: UserStatus | UserStatus[];

  @ApiPropertyOptional({
    description: 'Filter appointments from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter appointments until this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['createdAt', 'fullName', 'email'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'fullName', 'email'])
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
