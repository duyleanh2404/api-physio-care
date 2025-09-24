import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export const ApiFindAllUsers = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all users (Admin only)',
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of users',
      schema: {
        example: {
          page: 1,
          limit: 10,
          totalPages: 5,
          total: 50,
          data: [
            {
              id: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
              email: 'user@example.com',
              fullName: 'John Doe',
              role: 'user',
              createdAt: '2025-09-23T12:00:00.000Z',
              updatedAt: '2025-09-23T12:10:00.000Z',
            },
          ],
        },
      },
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
      example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
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
