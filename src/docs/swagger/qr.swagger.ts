import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ScanQrDto } from 'src/core/qr/dto/scan-qr.dto';
import { RequestQrDto } from 'src/core/qr/dto/request-qr.dto';

export const ApiRequestQr = () =>
  applyDecorators(
    ApiOperation({ summary: 'Request a QR code by email' }),
    ApiBody({ type: RequestQrDto }),
    ApiResponse({
      status: 201,
      description: 'QR code created successfully',
      schema: {
        type: 'object',
        properties: {
          nonce: { type: 'string', example: 'uuid-nonce' },
          qrUrl: {
            type: 'string',
            example: 'https://your-web.com/qr-login?nonce=uuid-nonce',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'User not found' },
        },
      },
    }),
  );

export const ApiScanQr = () =>
  applyDecorators(
    ApiOperation({ summary: 'Scan and confirm QR login' }),
    ApiBody({ type: ScanQrDto }),
    ApiResponse({
      status: 200,
      description: 'QR login successful',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'QR login successful' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized (JWT missing or invalid)',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'QR code expired or user not found',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'QR code expired or invalid' },
        },
      },
    }),
  );
