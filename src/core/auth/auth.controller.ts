import {
  Get,
  Post,
  Body,
  Request,
  Response,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

import {
  ApiLogin,
  ApiLogout,
  ApiRefresh,
  ApiRegister,
  ApiResendOtp,
  ApiResetPassword,
  ApiVerifyAccount,
  ApiForgotPassword,
} from 'src/docs/swagger/auth.swagger';
import { AuthService } from './auth.service';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiLogin()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  @ApiRegister()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @ApiRefresh()
  async refresh(@Body() dto: RefreshTokenDto) {
    const payload = await this.authService.decodeRefreshToken(dto.refreshToken);
    return this.authService.refreshTokens(payload.sub, dto.refreshToken);
  }

  @Post('verify')
  @ApiVerifyAccount()
  verify(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyUser(dto.email, dto.otp);
  }

  @Post('forgot-password')
  @ApiForgotPassword()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiResetPassword()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Post('resend-otp')
  @ApiResendOtp()
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }

  @Get('google')
  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Request() req, @Response() res) {
    const { accessToken, refreshToken } = req.user;
    const appUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return res.redirect(
      `${appUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }

  @Post('logout')
  @ApiLogout()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    const user = req.user as any;
    return this.authService.logout(user.sub);
  }
}
