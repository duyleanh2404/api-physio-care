import {
  Put,
  Get,
  Body,
  Post,
  Param,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import * as RateLimiterService from './rate-limiter.service';

import {
  ApiCheckLimit,
  ApiResetFailCount,
  ApiUpdateRateLimit,
  ApiGetRateLimitConfig,
} from 'src/docs/swagger/auth-rate-limiter.swagger';
import { Roles } from '../../decorators/roles.decorator';
import { UpdateRateLimitDto } from '../../dto/update-rate-limit.dto';

@ApiTags('Settings')
@Controller('settings/rate-limit')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RateLimiterController {
  constructor(
    private readonly limiter: RateLimiterService.RateLimiterService,
  ) {}

  @Put()
  @ApiUpdateRateLimit()
  async updateRateLimit(@Body() body: UpdateRateLimitDto) {
    return this.limiter.updateConfig(body);
  }

  @Post(':action/reset/:key')
  @ApiResetFailCount()
  async resetFailCount(
    @Param('action') action: RateLimiterService.RateLimitAction,
    @Param('key') key: string,
  ) {
    return this.limiter.resetFailCount(action, key);
  }

  @Post(':action/check/:key')
  @ApiCheckLimit()
  async checkLimit(
    @Param('action') action: RateLimiterService.RateLimitAction,
    @Param('key') key: string,
  ) {
    await this.limiter.check(action, key);
    return { action, key, allowed: true };
  }

  @Get('config')
  @ApiGetRateLimitConfig()
  async getCurrentConfig() {
    return this.limiter.getCurrentConfig();
  }
}
