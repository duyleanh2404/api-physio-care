import { Min, IsIn, IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetDoctorsByClinicQueryDto {
  @ApiPropertyOptional({
    description:
      'Search keyword by doctor name, license number, or specialty name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter doctors by specialty ID',
  })
  @IsOptional()
  @IsString()
  specialtyId?: string;

  @ApiPropertyOptional({
    description: 'Filter doctors by clinic province code',
  })
  @IsOptional()
  @IsString()
  provinceId?: string;

  @ApiPropertyOptional({
    description: 'Minimum years of experience',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  yearsFrom?: number;

  @ApiPropertyOptional({
    description: 'Maximum years of experience',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  yearsTo?: number;

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
    description: 'Number of records per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['createdAt', 'experienceYears', 'name', 'licenseNumber'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'experienceYears', 'name', 'licenseNumber'])
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order direction',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
