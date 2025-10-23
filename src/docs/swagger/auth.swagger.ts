import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { LoginDto } from 'src/core/auth/dto/login.dto';
import { RegisterDto } from 'src/core/auth/dto/register.dto';
import { ResendOtpDto } from 'src/core/auth/dto/resend-otp.dto';
import { VerifyOtpDto } from 'src/core/auth/dto/verify-otp.dto';
import { VerifyTokenDto } from 'src/core/auth/dto/verify-token.dto';
import { RefreshTokenDto } from 'src/core/auth/dto/refresh-token.dto';
import { ResetPasswordDto } from 'src/core/auth/dto/reset-password.dto';
import { RegisterAdminDto } from 'src/core/auth/dto/register-admin.dto';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { ForgotPasswordDto } from 'src/core/auth/dto/forgot-password.dto';
import { AuthLoginResponse } from 'src/core/auth/dto/auth-login-response.dto';
import { AuthTokensResponse } from 'src/core/auth/dto/auth-tokens-response.dto';

export const ApiRegisterAdmin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create admin account' }),
    ApiBody({ type: RegisterAdminDto }),
    ApiResponse({
      status: 201,
      description: 'Admin account created successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Email already exists',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Email already exists' },
        },
      },
    }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'User login' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      type: AuthLoginResponse,
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid email or password',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid email or password' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Account not verified. OTP has been sent to your email',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Account not verified. OTP has been sent to your email',
          },
        },
      },
    }),
  );

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new account' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'Registration successful',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Email already exists',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Email already exists' },
        },
      },
    }),
  );

export const ApiRefresh = () =>
  applyDecorators(
    ApiOperation({ summary: 'Refresh access token' }),
    ApiBody({ type: RefreshTokenDto }),
    ApiResponse({
      status: 200,
      description: 'Token refreshed successfully',
      type: AuthTokensResponse,
    }),
  );

export const ApiVerifyAccount = () =>
  applyDecorators(
    ApiOperation({ summary: 'Verify account using OTP' }),
    ApiBody({ type: VerifyOtpDto }),
    ApiResponse({
      status: 200,
      description: 'Account verified successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Account successfully verified' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid or expired OTP',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid or expired OTP' },
        },
      },
    }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiOperation({ summary: 'Logout user' }),
    ApiResponse({
      status: 200,
      description: 'Logout successful',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logged out successfully' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );

export const ApiForgotPassword = () =>
  applyDecorators(
    ApiOperation({ summary: 'Send OTP to reset password' }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'OTP sent to email',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'OTP sent successfully' },
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

export const ApiResetPassword = () =>
  applyDecorators(
    ApiOperation({ summary: 'Reset password with OTP' }),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Password reset successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Password reset successfully' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid OTP or expired',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid or expired OTP' },
        },
      },
    }),
  );

export const ApiVerifyToken = () =>
  applyDecorators(
    ApiOperation({ summary: 'Verify JWT access token' }),
    ApiBody({ type: VerifyTokenDto }),
    ApiResponse({
      status: 200,
      description: 'Token verified successfully',
      schema: {
        type: 'object',
        properties: {
          valid: { type: 'boolean', example: true },
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              email: { type: 'string', example: 'user@example.com' },
              role: { type: 'string', example: 'USER' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid or expired token',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid or expired token' },
        },
      },
    }),
  );

export const ApiResendOtp = () =>
  applyDecorators(
    ApiOperation({ summary: 'Resend OTP to user email' }),
    ApiBody({ type: ResendOtpDto }),
    ApiResponse({
      status: 200,
      description: 'OTP resent successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'OTP resent successfully' },
          email: { type: 'string', example: 'user@example.com' },
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
