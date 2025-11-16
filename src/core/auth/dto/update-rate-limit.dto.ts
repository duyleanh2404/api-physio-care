import { Type } from 'class-transformer';
import { IsInt, Min, ValidateNested } from 'class-validator';

export class RateLimitItemDto {
  @IsInt()
  @Min(1)
  limit: number;

  @IsInt()
  @Min(1)
  window: number;
}

export class UpdateRateLimitDto {
  @ValidateNested()
  @Type(() => RateLimitItemDto)
  login: RateLimitItemDto;

  @ValidateNested()
  @Type(() => RateLimitItemDto)
  register: RateLimitItemDto;

  @ValidateNested()
  @Type(() => RateLimitItemDto)
  forgotPassword: RateLimitItemDto;

  @ValidateNested()
  @Type(() => RateLimitItemDto)
  resetPassword: RateLimitItemDto;

  @ValidateNested()
  @Type(() => RateLimitItemDto)
  otp: RateLimitItemDto;
}
