import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateRateLimitDto {
  @ApiProperty({
    description: 'Maximum number of failed attempts',
    example: 10,
  })
  @IsInt()
  @IsPositive()
  limit: number;

  @ApiProperty({ description: 'Block duration in seconds', example: 300 })
  @IsInt()
  @IsPositive()
  window: number;
}
