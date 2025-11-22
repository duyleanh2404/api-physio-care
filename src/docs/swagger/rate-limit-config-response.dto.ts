import { ApiProperty } from '@nestjs/swagger';

export class RateLimitItemConfigDto {
  @ApiProperty({ example: 5 })
  limit: number;

  @ApiProperty({ example: 300 })
  window: number;
}

export class RateLimitConfigResponseDto {
  @ApiProperty({ type: RateLimitItemConfigDto })
  login: RateLimitItemConfigDto;

  @ApiProperty({ type: RateLimitItemConfigDto })
  register: RateLimitItemConfigDto;

  @ApiProperty({ type: RateLimitItemConfigDto })
  forgotPassword: RateLimitItemConfigDto;

  @ApiProperty({ type: RateLimitItemConfigDto })
  resetPassword: RateLimitItemConfigDto;

  @ApiProperty({ type: RateLimitItemConfigDto })
  otp: RateLimitItemConfigDto;

  @ApiProperty({ type: RateLimitItemConfigDto })
  appointment: RateLimitItemConfigDto;
}
