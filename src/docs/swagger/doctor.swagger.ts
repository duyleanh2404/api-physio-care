import {
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
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

export const ApiFindMyPatients = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get patients of the currently logged-in doctor',
      description:
        'Retrieve a paginated list of patients who have appointments with the currently authenticated doctor.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of patients retrieved successfully',
      type: PaginatedResponseDto(UserResponseDto),
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor not found for this user',
      schema: { example: { message: 'Doctor not found for this user' } },
    }),
  );

export const ApiFindOneDoctorBySlug = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get doctor by slug',
      description: 'Retrieve details of a specific doctor by their slug',
    }),
    ApiParam({
      name: 'slug',
      description: 'Doctor slug',
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

export const ApiFindOneDoctorByClinicSlug = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get doctor by clinic slug and doctor slug',
      description:
        'Retrieve details of a specific doctor by clinic slug and doctor slug. Useful when multiple clinics have doctors with the same slug.',
    }),
    ApiParam({
      name: 'clinicSlug',
      description: 'Slug of the clinic where the doctor works',
      example: 'phong-kham-an-binh',
    }),
    ApiParam({
      name: 'slug',
      description: 'Slug of the doctor',
      example: 'tran-van-a',
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

export const ApiFindMeDoctor = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get currently logged-in doctor information',
      description:
        'Retrieve the doctor profile that is linked to the currently authenticated user (based on the token).',
    }),
    ApiResponse({
      status: 200,
      description: 'Doctor profile retrieved successfully',
      type: DoctorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor not found for this user',
      schema: { example: { message: 'Doctor not found for this user' } },
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
