import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, ValidateNested, IsOptional } from 'class-validator';

export class RateLimitItemDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Maximum allowed attempts per window',
    required: false,
  })
  @IsInt()
  @Min(1)
  limit: number;

  @ApiPropertyOptional({
    example: 300,
    description: 'Time window in seconds',
    required: false,
  })
  @IsInt()
  @Min(1)
  window: number;
}

export class UpdateRateLimitDto {
  @ApiPropertyOptional({
    type: RateLimitItemDto,
    example: { limit: 10, window: 300 },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RateLimitItemDto)
  login?: RateLimitItemDto;

  @ApiPropertyOptional({
    type: RateLimitItemDto,
    example: { limit: 5, window: 300 },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RateLimitItemDto)
  register?: RateLimitItemDto;

  @ApiPropertyOptional({
    type: RateLimitItemDto,
    example: { limit: 5, window: 300 },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RateLimitItemDto)
  forgotPassword?: RateLimitItemDto;

  @ApiPropertyOptional({
    type: RateLimitItemDto,
    example: { limit: 5, window: 300 },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RateLimitItemDto)
  resetPassword?: RateLimitItemDto;

  @ApiPropertyOptional({
    type: RateLimitItemDto,
    example: { limit: 5, window: 600 },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RateLimitItemDto)
  otp?: RateLimitItemDto;

  @ApiPropertyOptional({
    type: RateLimitItemDto,
    example: { limit: 1, window: 300 },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RateLimitItemDto)
  appointment?: RateLimitItemDto;
}
