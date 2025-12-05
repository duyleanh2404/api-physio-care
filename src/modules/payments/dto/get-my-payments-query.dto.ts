import {
  Min,
  IsInt,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentStatus } from 'src/enums/payments-status.enum';

export class GetMyPaymentsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by appointment ID' })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Search by transaction ID, package name, or user name/email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filter by payment status (single or comma-separated for multiple)',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  status?: PaymentStatus | PaymentStatus[];

  @ApiPropertyOptional({ description: 'Filter by start date (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort direction', default: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder: 'ASC' | 'DESC' = 'ASC';
}
