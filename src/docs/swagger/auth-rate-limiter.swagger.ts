import {
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { UpdateRateLimitDto } from 'src/core/auth/dto/update-rate-limit.dto';
import { RateLimitConfigResponseDto } from './rate-limit-config-response.dto';

export const ApiUpdateRateLimit = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update rate limit configuration',
      description:
        'Admin can update max attempts and window duration for each action.',
    }),
    ApiBody({ type: UpdateRateLimitDto }),
    ApiResponse({
      status: 200,
      description: 'Updated rate limit configuration',
      type: RateLimitConfigResponseDto,
    }),
  );

export const ApiResetFailCount = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Reset fail count',
      description: 'Reset attempt count for a specific action & key',
    }),
    ApiParam({
      name: 'action',
      description: 'Action type (login/register/forgotPassword/resetPassword/...)',
    }),
    ApiParam({
      name: 'key',
      description: 'Target identifier (email or userId or IP)',
    }),
    ApiResponse({
      status: 200,
      description: 'Fail count reset successfully',
      schema: {
        example: {
          action: 'login',
          key: 'user@example.com',
          reset: true,
        },
      },
    }),
  );

export const ApiCheckLimit = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Check limit for an action',
      description:
        'Validate if a key is still allowed or rate limit reached.',
    }),
    ApiParam({ name: 'action', description: 'Action type' }),
    ApiParam({ name: 'key', description: 'Email / userId / IP' }),
    ApiResponse({
      status: 200,
      description: 'Allowed',
      schema: {
        example: {
          action: 'login',
          key: 'user@example.com',
          allowed: true,
        },
      },
    }),
    ApiResponse({
      status: 429,
      description: 'Rate limit exceeded',
      schema: {
        example: {
          statusCode: 429,
          message:
            'Exceeded 5 login attempts. Try again in 120 seconds.',
          error: 'Too Many Requests',
        },
      },
    }),
  );

export const ApiGetRateLimitConfig = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Retrieve current rate limit configuration',
      description: 'Admin can view limit + window for every action.',
    }),
    ApiResponse({
      status: 200,
      description: 'Current rate limit config',
      type: RateLimitConfigResponseDto,
    }),
  );
