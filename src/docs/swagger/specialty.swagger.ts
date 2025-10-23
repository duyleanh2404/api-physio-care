import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { SpecialtyResponseDto } from 'src/modules/specialties/dto/specialty-response.dto';

export const ApiFindAllSpecialties = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all specialties' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of specialties',
      type: PaginatedResponseDto(SpecialtyResponseDto),
    }),
  );

export const ApiFindOneSpecialty = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get specialty details by ID' }),
    ApiParam({ name: 'id', description: 'Specialty ID' }),
    ApiResponse({
      status: 200,
      description: 'Specialty details',
      type: SpecialtyResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Specialty not found',
      schema: { example: { message: 'Specialty not found' } },
    }),
  );

export const ApiCreateSpecialty = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new specialty (Admin only)' }),
    ApiResponse({
      status: 201,
      description: 'Specialty created successfully',
      type: SpecialtyResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Specialty name already exists',
      schema: { example: { message: 'Specialty name already exists' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );

export const ApiUpdateSpecialty = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update specialty information (Admin only)' }),
    ApiParam({ name: 'id', description: 'Specialty ID' }),
    ApiResponse({
      status: 200,
      description: 'Specialty updated successfully',
      type: SpecialtyResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Specialty not found',
      schema: { example: { message: 'Specialty not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );

export const ApiDeleteSpecialty = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete specialty (Admin only)' }),
    ApiParam({ name: 'id', description: 'Specialty ID' }),
    ApiResponse({
      status: 200,
      description: 'Specialty deleted successfully',
      schema: { example: { message: 'Specialty deleted successfully' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Specialty not found',
      schema: { example: { message: 'Specialty not found' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );
