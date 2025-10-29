import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

export const ApiFindMeUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get current logged-in user',
    }),
    ApiResponse({
      status: 200,
      description: 'Current user details',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Missing or invalid token',
      schema: { example: { message: 'Unauthorized' } },
    }),
  );

export const ApiFindAllUsers = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all users (Admin only)',
    }),
    ApiQuery({ name: 'status', required: false, type: String }),
    ApiQuery({ name: 'role', required: false, type: String }),
    ApiQuery({ name: 'dateFrom', required: false, type: String }),
    ApiQuery({ name: 'dateTo', required: false, type: String }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of users',
      type: PaginatedResponseDto(UserResponseDto),
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );

export const ApiFindOneUserBySlug = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user details by slug (Admin only)',
    }),
    ApiParam({
      name: 'slug',
      description: 'User slug',
      example: 'john-doe',
    }),
    ApiResponse({
      status: 200,
      description: 'User details',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: { example: { message: 'User not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );

export const ApiFindOneUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user details by ID (Admin only)',
    }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiResponse({
      status: 200,
      description: 'User details',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: { example: { message: 'User not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );

export const ApiCreateUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new user (Admin only)' }),
    ApiResponse({
      status: 201,
      description: 'User created successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
    ApiResponse({
      status: 409,
      description: 'Email already exists',
      schema: { example: { message: 'Email already exists' } },
    }),
  );

export const ApiUpdateUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update user information (Admin only)',
    }),
    ApiParam({
      name: 'id',
      description: 'User ID',
    }),
    ApiResponse({
      status: 200,
      description: 'User information updated successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: { example: { message: 'User not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );

export const ApiBanUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Ban a user account (Admin only)' }),
    ApiParam({
      name: 'id',
      description: 'ID of the user to be banned',
      example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    }),
    ApiResponse({
      status: 200,
      description: 'User account successfully banned',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: { example: { message: 'User not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
    ApiResponse({
      status: 400,
      description: 'User is already banned',
      schema: { example: { message: 'User is already banned' } },
    }),
  );

export const ApiUnbanUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Unban a user account (Admin only)' }),
    ApiParam({
      name: 'id',
      description: 'ID of the user to be unbanned',
      example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    }),
    ApiResponse({
      status: 200,
      description: 'User account successfully unbanned',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: { example: { message: 'User not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
    ApiResponse({
      status: 400,
      description: 'User is already active',
      schema: { example: { message: 'User is already active' } },
    }),
  );

export const ApiDeleteUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete user (Admin only)' }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiResponse({
      status: 200,
      description: 'User deleted successfully',
      schema: { example: { message: 'User deleted successfully' } },
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: { example: { message: 'User not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );
