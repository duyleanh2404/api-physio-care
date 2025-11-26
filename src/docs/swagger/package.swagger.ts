import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { CreatePackageDto } from 'src/modules/packages/dto/create-package.dto';
import { UpdatePackageDto } from 'src/modules/packages/dto/update-package.dto';
import { PackageResponseDto } from 'src/modules/packages/dto/package-response.dto';

export const ApiCreatePackage = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new package',
      description:
        'Allows a clinic to create a new medical package with pricing, discount, services and description.',
    }),
    ApiBody({
      type: CreatePackageDto,
      description: 'Package details to be created',
    }),
    ApiResponse({
      status: 201,
      description: 'Package created successfully',
      type: PackageResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - only clinic owners can create packages',
      schema: {
        example: { message: 'Clinic not found or access denied' },
      },
    }),
  );

export const ApiFindAllPackages = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all packages',
      description:
        'Retrieve a paginated list of all packages across clinics. Admin-only endpoint.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of packages retrieved successfully',
      type: PaginatedResponseDto(PackageResponseDto),
    }),
  );

export const ApiFindMyPackages = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get packages of the current clinic',
      description:
        'Retrieve a paginated list of packages belonging to the authenticated clinic user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Clinic packages retrieved successfully',
      type: PaginatedResponseDto(PackageResponseDto),
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - clinic not found for this user',
      schema: { example: { message: 'Clinic not found' } },
    }),
  );

export const ApiFindOnePackage = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get package details by ID',
      description: 'Retrieve the details of a specific medical package.',
    }),
    ApiParam({
      name: 'id',
      description: 'Package ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Package retrieved successfully',
      type: PackageResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Package not found',
      schema: { example: { message: 'Package not found' } },
    }),
  );

export const ApiUpdatePackage = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update package',
      description:
        'Allows a clinic owner or admin to update a medical package information.',
    }),
    ApiParam({
      name: 'id',
      description: 'Package ID',
    }),
    ApiBody({
      type: UpdatePackageDto,
      description: 'Updated package information',
    }),
    ApiResponse({
      status: 200,
      description: 'Package updated successfully',
      type: PackageResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - user cannot update this package',
      schema: { example: { message: 'You cannot update this package' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Package not found',
      schema: { example: { message: 'Package not found' } },
    }),
  );

export const ApiDeletePackage = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete a package',
      description:
        'Allows a clinic owner or admin to delete a medical package.',
    }),
    ApiParam({
      name: 'id',
      description: 'Package ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Package deleted successfully',
      schema: { example: { message: 'Package deleted successfully' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - user cannot delete this package',
      schema: { example: { message: 'You cannot delete this package' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Package not found',
      schema: { example: { message: 'Package not found' } },
    }),
  );
