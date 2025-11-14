import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

import { UpdateRateLimitDto } from 'src/core/auth/dto/update-rate-limit.dto';

export const ApiUpdateRateLimit = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update rate limit config',
      description:
        'Admin can update max attempts and block duration for an action',
    }),
    ApiBody({ type: UpdateRateLimitDto }),
    ApiResponse({
      status: 200,
      description: 'Rate limit updated successfully',
      schema: { example: { action: 'login', limit: 10, window: 300 } },
    }),
  );

export const ApiResetFailCount = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Reset fail count',
      description: 'Reset the fail count for a given key and action',
    }),
    ApiParam({
      name: 'action',
      description: 'Action type (login/register/forgotPassword/resetPassword)',
    }),
    ApiParam({ name: 'key', description: 'User email or IP' }),
    ApiResponse({
      status: 200,
      description: 'Fail count reset successfully',
      schema: {
        example: { action: 'login', key: 'user@example.com', reset: true },
      },
    }),
  );

export const ApiCheckLimit = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Check current limit',
      description: 'Check if a key is allowed to perform an action',
    }),
    ApiParam({ name: 'action', description: 'Action type' }),
    ApiParam({ name: 'key', description: 'User email or IP' }),
    ApiResponse({
      status: 200,
      description: 'Limit check successful',
      schema: {
        example: { action: 'login', key: 'user@example.com', allowed: true },
      },
    }),
    ApiResponse({
      status: 429,
      description: 'Too many requests',
      schema: {
        example: {
          statusCode: 429,
          error: 'Too Many Requests',
          message: 'Too many login attempts. Please try again later.',
        },
      },
    }),
  );

export const ApiGetRateLimitConfig = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get current rate limit configuration',
      description:
        'Admin can retrieve the current max attempts and block duration for all actions',
    }),
    ApiResponse({
      status: 200,
      description: 'Return current rate limit configuration',
      schema: {
        example: {
          limits: {
            login: 10,
            register: 5,
            forgotPassword: 5,
            resetPassword: 5,
          },
          windowSeconds: 300,
        },
      },
    }),
  );
