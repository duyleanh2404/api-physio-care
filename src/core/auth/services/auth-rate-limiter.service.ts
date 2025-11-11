import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class AuthRateLimiter {
  private readonly redis: Redis;
  private readonly WINDOW_SECONDS = 300;
  private readonly LIMITS = {
    login: 10,
    register: 5,
    forgotPassword: 5,
    resetPassword: 5,
  };

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  private async checkLimit(action: keyof typeof this.LIMITS, key: string) {
    const redisKey = `rate:${action}:${key}`;
    const attempts = await this.redis.get(redisKey);

    if (attempts && parseInt(attempts) >= this.LIMITS[action]) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Too many ${action} attempts. Please try again later.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!attempts) {
      await this.redis.set(redisKey, 1, 'EX', this.WINDOW_SECONDS);
    } else {
      await this.redis.incr(redisKey);
    }
  }

  async checkLogin(emailOrIp: string) {
    await this.checkLimit('login', emailOrIp);
  }

  async checkRegister(email: string) {
    await this.checkLimit('register', email);
  }

  async checkForgotPassword(email: string) {
    await this.checkLimit('forgotPassword', email);
  }

  async checkResetPassword(email: string) {
    await this.checkLimit('resetPassword', email);
  }
}
