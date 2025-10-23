import {
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiResponse,
  ApiProduces,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { UpdateRecordDto } from 'src/modules/records/dto/update-record.dto';
import { CreateRecordDto } from 'src/modules/records/dto/create-record.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { RecordResponseDto } from 'src/modules/records/dto/record-response.dto';

export const ApiCreateRecord = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new medical record with optional file attachment',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateRecordDto }),
    ApiResponse({
      status: 201,
      description: 'Record created successfully',
      type: RecordResponseDto,
    }),
  );

export const ApiUpdateRecord = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update an existing record with optional new attachment file',
    }),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      description: 'Record ID',
    }),
    ApiBody({ type: UpdateRecordDto }),
    ApiResponse({
      status: 200,
      description: 'Record updated successfully',
      type: RecordResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Record not found',
      schema: { example: { message: 'Record not found' } },
    }),
  );

export const ApiFindAllRecords = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all medical records' }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of medical records',
      type: PaginatedResponseDto(RecordResponseDto),
    }),
  );

export const ApiFindOneRecord = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get details of a record by ID' }),
    ApiParam({
      name: 'id',
      description: 'Record ID',
      example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    }),
    ApiResponse({
      status: 200,
      description: 'Record details',
      type: RecordResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Record not found',
      schema: { example: { message: 'Record not found' } },
    }),
  );

export const ApiDownloadRecord = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Download the attached encrypted file of a record',
      description:
        'Decrypts and verifies the digital signature before sending the original file back to the client.',
    }),
    ApiParam({
      name: 'id',
      description: 'Record ID',
    }),
    ApiProduces('application/octet-stream'),
    ApiResponse({
      status: 200,
      description: 'Encrypted file decrypted and returned successfully',
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid or missing digital signature',
      schema: { example: { message: 'File signature is invalid or tampered' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Record or file not found',
      schema: { example: { message: 'Record not found' } },
    }),
  );

export const ApiDeleteRecord = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a record by ID' }),
    ApiParam({
      name: 'id',
      description: 'Record ID',
      example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    }),
    ApiResponse({
      status: 200,
      description: 'Record deleted successfully',
      schema: { example: { message: 'Record deleted successfully' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Record not found',
      schema: { example: { message: 'Record not found' } },
    }),
  );
