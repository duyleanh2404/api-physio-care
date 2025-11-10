import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiOperation } from '@nestjs/swagger';

import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ClinicResponseDto } from 'src/modules/clinics/dto/clinic-response.dto';

export const ApiFindAllClinics = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all clinics',
      description: 'Retrieve a list of all clinics in the system',
    }),
    ApiResponse({
      status: 200,
      description: 'List of clinics successfully retrieved',
      type: PaginatedResponseDto(ClinicResponseDto),
    }),
  );

export const ApiFindOneClinicBySlug = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get clinic by slug',
      description:
        'Retrieve detailed information about a specific clinic by its slug',
    }),
    ApiParam({
      name: 'slug',
      description: 'Clinic slug',
    }),
    ApiResponse({
      status: 200,
      description: 'Clinic details retrieved successfully',
      type: ClinicResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Clinic not found',
      schema: { example: { message: 'Clinic not found' } },
    }),
  );

export const ApiFindOneClinic = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get clinic by ID',
      description:
        'Retrieve detailed information about a specific clinic by its ID',
    }),
    ApiParam({
      name: 'id',
      description: 'Clinic ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Clinic details retrieved successfully',
      type: ClinicResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Clinic not found',
      schema: { example: { message: 'Clinic not found' } },
    }),
  );

export const ApiFindMeClinic = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get current user's clinic information",
      description:
        'Retrieve clinic information associated with the currently authenticated user',
    }),
    ApiResponse({
      status: 200,
      description: 'Clinic information retrieved successfully',
      type: ClinicResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - missing or invalid token',
      schema: { example: { message: 'Unauthorized' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Clinic not found for this user',
      schema: { example: { message: 'Clinic not found for this user' } },
    }),
  );

export const ApiCreateClinic = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new clinic (Admin only)',
      description:
        'Admin can create a new clinic with its details and media (avatar, banner)',
    }),
    ApiResponse({
      status: 201,
      description: 'Clinic created successfully',
      type: ClinicResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
    ApiResponse({
      status: 409,
      description: 'Clinic already exists',
      schema: { example: { message: 'Clinic already exists' } },
    }),
  );

export const ApiUpdateClinic = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update clinic information (Admin only)',
      description:
        'Update clinic details such as name, address, or media (avatar, banner)',
    }),
    ApiParam({
      name: 'id',
      description: 'Clinic ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Clinic updated successfully',
      type: ClinicResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Clinic not found',
      schema: { example: { message: 'Clinic not found' } },
    }),
  );

export const ApiDeleteClinic = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete clinic (Admin only)',
      description: 'Remove a clinic record from the system',
    }),
    ApiParam({
      name: 'id',
      description: 'Clinic ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Clinic deleted successfully',
      schema: { example: { message: 'Clinic deleted successfully' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Clinic not found',
      schema: { example: { message: 'Clinic not found' } },
    }),
  );
