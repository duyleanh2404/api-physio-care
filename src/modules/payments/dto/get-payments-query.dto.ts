import {
  Min,
  IsInt,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentStatus } from 'src/enums/payments-status.enum';

export class GetPaymentsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by appointment ID' })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Search by transaction ID, patient name or email',
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

  @ApiPropertyOptional({ description: 'Filter by date (from, ISO)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date (to, ISO)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceFrom?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceTo?: number;

  @ApiPropertyOptional({ description: 'Filter by package ID' })
  @IsOptional()
  @IsString()
  packageId?: string;

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
