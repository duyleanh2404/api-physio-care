import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { EquipmentResponseDto } from 'src/modules/equipments/dto/equipment-response.dto';
import { UpdateEquipmentStatusDto } from 'src/modules/equipments/dto/update-equipment-status.dto';

export const ApiCreateEquipment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create new equipment (Clinic only)',
      description:
        'Allows a clinic to add a new equipment item with its details and status.',
    }),
    ApiResponse({
      status: 201,
      description: 'Equipment created successfully',
      type: EquipmentResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - only clinic owners can create equipment',
      schema: { example: { message: 'Clinic not found or access denied' } },
    }),
  );

export const ApiFindAllEquipments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all equipments (Admin only)',
      description:
        'Retrieve a paginated list of all equipments across clinics. Admin access only.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of equipments retrieved successfully',
      type: PaginatedResponseDto(EquipmentResponseDto),
    }),
  );

export const ApiFindMyEquipments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get equipments of the current clinic',
      description:
        'Retrieve a paginated list of equipments belonging to the clinic of the authenticated user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Clinic equipments retrieved successfully',
      type: PaginatedResponseDto(EquipmentResponseDto),
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - clinic not found for this user',
      schema: { example: { message: 'Clinic not found' } },
    }),
  );

export const ApiFindOneEquipment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get equipment by ID',
      description: 'Retrieve details of a specific equipment item by its ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'Equipment ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Equipment retrieved successfully',
      type: EquipmentResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Equipment not found',
      schema: { example: { message: 'Equipment not found' } },
    }),
  );

export const ApiUpdateEquipment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update equipment (Clinic or Admin)',
      description:
        'Allows a clinic owner or admin to update details of an existing equipment.',
    }),
    ApiParam({
      name: 'id',
      description: 'Equipment ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Equipment updated successfully',
      type: EquipmentResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - user cannot update this equipment',
      schema: { example: { message: 'You cannot update this equipment' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Equipment not found',
      schema: { example: { message: 'Equipment not found' } },
    }),
  );

export const ApiUpdateEquipmentStatus = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update status of equipment (Clinic or Admin)',
      description:
        'Allows a clinic owner or admin to update the status of an existing equipment (active/inactive).',
    }),
    ApiParam({
      name: 'id',
      description: 'Equipment ID',
    }),
    ApiBody({
      type: UpdateEquipmentStatusDto,
      description: 'New status of the equipment',
    }),
    ApiResponse({
      status: 200,
      description: 'Equipment status updated successfully',
      type: EquipmentResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - user cannot update this equipment',
      schema: { example: { message: 'You cannot update this equipment' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Equipment not found',
      schema: { example: { message: 'Equipment not found' } },
    }),
  );

export const ApiDeleteEquipment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete equipment (Clinic or Admin)',
      description: 'Allows clinic owner or admin to remove an equipment item.',
    }),
    ApiParam({
      name: 'id',
      description: 'Equipment ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Equipment deleted successfully',
      schema: { example: { message: 'Equipment deleted successfully' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - user cannot delete this equipment',
      schema: { example: { message: 'You cannot delete this equipment' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Equipment not found',
      schema: { example: { message: 'Equipment not found' } },
    }),
  );
