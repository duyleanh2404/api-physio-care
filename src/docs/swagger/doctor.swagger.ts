import {
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { CreateDoctorDto } from 'src/modules/doctors/dto/create-doctor.dto';
import { UpdateDoctorDto } from 'src/modules/doctors/dto/update-doctor.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { DoctorResponseDto } from 'src/modules/doctors/dto/doctor-response.dto';

export const ApiFindAllDoctors = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all doctors',
      description: 'Retrieve a list of all doctors in the system',
    }),
    ApiResponse({
      status: 200,
      description: 'List of doctors successfully retrieved',
      type: PaginatedResponseDto(DoctorResponseDto),
    }),
  );

export const ApiFindOneDoctor = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get doctor by ID',
      description: 'Retrieve details of a specific doctor by their ID',
    }),
    ApiParam({
      name: 'id',
      description: 'Doctor ID',
      example: 'a15b7e42-0a6b-47a1-9d4f-1c1b88e4d6e9',
    }),
    ApiResponse({
      status: 200,
      description: 'Doctor details retrieved successfully',
      type: DoctorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor not found',
      schema: { example: { message: 'Doctor not found' } },
    }),
  );

export const ApiCreateDoctor = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new doctor (Admin only)',
      description:
        'Admin can create a new doctor by linking with a user and specialty. Supports file upload for avatar.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateDoctorDto }),
    ApiResponse({
      status: 201,
      description: 'Doctor created successfully',
      type: DoctorResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
    ApiResponse({
      status: 409,
      description: 'Doctor already exists for this user',
      schema: { example: { message: 'Doctor already exists' } },
    }),
  );

export const ApiUpdateDoctor = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update doctor information (Admin only)',
      description:
        'Update doctor details such as bio, specialty, license number, or avatar.',
    }),
    ApiParam({
      name: 'id',
      description: 'Doctor ID',
      example: 'b57e8b1c-5b91-4e21-92b3-3b024f1a7a4d',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: UpdateDoctorDto }),
    ApiResponse({
      status: 200,
      description: 'Doctor information updated successfully',
      type: DoctorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor not found',
      schema: { example: { message: 'Doctor not found' } },
    }),
  );

export const ApiDeleteDoctor = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete doctor (Admin only)',
      description: 'Remove a doctor record from the system',
    }),
    ApiParam({
      name: 'id',
      description: 'Doctor ID',
      example: '4f57a56d-20e7-4c4a-b5f3-f9b8a5fdb776',
    }),
    ApiResponse({
      status: 200,
      description: 'Doctor deleted successfully',
      schema: { example: { message: 'Doctor deleted successfully' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor not found',
      schema: { example: { message: 'Doctor not found' } },
    }),
  );
