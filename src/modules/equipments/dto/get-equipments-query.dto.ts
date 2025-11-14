import {
  IsIn,
  IsUUID,
  IsString,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetEquipmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Keyword for searching by name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by equipment status (active/inactive)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page for pagination',
  })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order: ASC or DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Filter by clinic ID',
  })
  @IsOptional()
  @IsUUID()
  clinicId?: string;
}
