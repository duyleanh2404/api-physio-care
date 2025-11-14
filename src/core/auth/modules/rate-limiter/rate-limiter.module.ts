import { Module } from '@nestjs/common';

import { RateLimiterService } from './rate-limiter.service';
import { RateLimiterController } from './rate-limiter.controller';

@Module({
  controllers: [RateLimiterController],
  providers: [RateLimiterService],
})
export class RateLimiterModule {}
