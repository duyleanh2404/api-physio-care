import { BadRequestException, Injectable } from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class OtpRateLimiter {
  private readonly redis: Redis;
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_SECONDS = 10 * 60;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async check(email: string) {
    const key = `otp:${email}`;
    const attempts = await this.redis.incr(key);

    if (attempts === 1) {
      await this.redis.expire(key, this.WINDOW_SECONDS);
    }

    if (attempts > this.MAX_ATTEMPTS) {
      const ttl = await this.redis.ttl(key);
      throw new BadRequestException(
        `You have exceeded the maximum number of OTP requests. Try again in ${ttl} seconds.`,
      );
    }
  }
}
