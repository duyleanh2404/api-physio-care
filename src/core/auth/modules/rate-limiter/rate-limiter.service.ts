import Redis from 'ioredis';
import { HttpStatus, Injectable, HttpException } from '@nestjs/common';

import { UpdateRateLimitDto } from '../../dto/update-rate-limit.dto';

export type RateLimitAction =
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'resetPassword'
  | 'otp';

@Injectable()
export class RateLimiterService {
  private readonly redis: Redis;
  private readonly configKey = 'rate_limit:config';

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async updateConfig(payload: UpdateRateLimitDto) {
    const pipeline = this.redis.pipeline();
    for (const [action, config] of Object.entries(payload)) {
      pipeline.hset(this.configKey, action, JSON.stringify(config));
    }
    await pipeline.exec();
    return payload;
  }

  async resetFailCount(action: RateLimitAction, key: string) {
    const redisKey = `rate:${action}:${key}`;
    await this.redis.del(redisKey);
    return { action, key, reset: true };
  }

  private async getConfig(action: RateLimitAction) {
    const redisData = await this.redis.hget(this.configKey, action);
    const defaultConfig: Record<
      RateLimitAction,
      { limit: number; window: number }
    > = {
      login: { limit: 10, window: 300 },
      register: { limit: 5, window: 300 },
      forgotPassword: { limit: 5, window: 300 },
      resetPassword: { limit: 5, window: 300 },
      otp: { limit: 5, window: 600 },
    };

    if (!redisData) return defaultConfig[action];

    try {
      return JSON.parse(redisData) as { limit: number; window: number };
    } catch {
      throw new HttpException(
        `Invalid rate limit config for action ${action}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async check(action: RateLimitAction, key: string) {
    const redisKey = `rate:${action}:${key}`;
    const attempts = await this.redis.get(redisKey);
    const { limit, window } = await this.getConfig(action);

    if (attempts && parseInt(attempts) >= limit) {
      const ttl = await this.redis.ttl(redisKey);
      throw new HttpException(
        `Exceeded ${limit} ${action} attempts. Try again in ${ttl} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!attempts) {
      await this.redis.set(redisKey, 1, 'EX', window);
    } else {
      await this.redis.incr(redisKey);
    }
  }

  public async checkLogin(emailOrIp: string) {
    return this.check('login', emailOrIp);
  }
  public async checkRegister(email: string) {
    return this.check('register', email);
  }
  public async checkForgotPassword(email: string) {
    return this.check('forgotPassword', email);
  }
  public async checkResetPassword(email: string) {
    return this.check('resetPassword', email);
  }
  public async checkOtp(email: string) {
    return this.check('otp', email);
  }

  public async getCurrentConfig() {
    const redisData = await this.redis.hgetall(this.configKey);
    const defaultConfig: Record<
      RateLimitAction,
      { limit: number; window: number }
    > = {
      login: { limit: 10, window: 300 },
      register: { limit: 5, window: 300 },
      forgotPassword: { limit: 5, window: 300 },
      resetPassword: { limit: 5, window: 300 },
      otp: { limit: 5, window: 600 },
    };

    const result: Record<RateLimitAction, { limit: number; window: number }> = {
      ...defaultConfig,
    };

    for (const [action, value] of Object.entries(redisData)) {
      try {
        result[action as RateLimitAction] = JSON.parse(value);
      } catch {}
    }

    return result;
  }
}
