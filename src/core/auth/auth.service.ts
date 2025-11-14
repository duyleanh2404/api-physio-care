import * as argon2 from 'argon2';

import {
  Injectable,
  HttpStatus,
  HttpException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { differenceInDays } from 'date-fns';

import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

import { OtpRepository } from './repository/otp.repository';
import { TokenRepository } from './repository/token.repository';

import { UserService } from 'src/modules/users/user.service';
import { RateLimiterService } from './modules/rate-limiter/rate-limiter.service';

import { AuthGateway } from './auth.gateway';
import { UserProvider, UserRole, UserStatus } from 'src/enums/user.enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authGateway: AuthGateway,

    private readonly otpRepo: OtpRepository,
    private readonly tokenRepo: TokenRepository,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async login(
    email: string,
    password: string,
    deviceInfo?: any,
    ipAddress?: string,
  ) {
    await this.rateLimiter.checkLogin(ipAddress || email);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.locked) {
      if (user.failedLoginAttempts >= 5) {
        throw new HttpException(
          'Your account has been temporarily locked due to multiple failed login attempts. Please reset your password or contact support.',
          HttpStatus.LOCKED,
        );
      } else {
        throw new HttpException(
          'Your account has been banned by an administrator. Please contact support.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const MAX_PASSWORD_AGE_DAYS = 90;
    if (user.lastPasswordChangeAt) {
      const daysSinceChange = differenceInDays(
        new Date(),
        new Date(user.lastPasswordChangeAt),
      );
      if (daysSinceChange > MAX_PASSWORD_AGE_DAYS) {
        throw new HttpException(
          `Your password is expired. It was last changed ${daysSinceChange} days ago. Please reset your password.`,
          426,
        );
      }
    }

    const isPasswordValid = await argon2.verify(user.password!, password);
    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 5) {
        user.locked = true;
        await this.userService.update(user.id, {
          failedLoginAttempts: user.failedLoginAttempts,
          locked: true,
          status: UserStatus.BANNED,
        });

        throw new HttpException(
          'Your account has been locked due to 5 failed login attempts. Please reset your password or contact support.',
          HttpStatus.LOCKED,
        );
      }

      await this.userService.update(user.id, {
        failedLoginAttempts: user.failedLoginAttempts,
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.failedLoginAttempts > 0 || user.locked) {
      await this.userService.update(user.id, {
        failedLoginAttempts: 0,
        locked: false,
        status: UserStatus.ACTIVE,
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.otpRepo.createOtp(user.id, email);
      throw new HttpException(
        'Account not verified. OTP has been sent to your email.',
        428,
      );
    }

    this.authGateway.logoutAll(user.id);

    const tokens = await this.tokenRepo.generateTokens(
      user,
      deviceInfo,
      ipAddress,
    );

    const safeUser = (({
      id,
      role,
      email,
      status,
      fullName,
      provider,
      avatarUrl,
      createdAt,
      updatedAt,
    }) => ({
      id,
      role,
      email,
      status,
      fullName,
      provider,
      avatarUrl,
      createdAt,
      updatedAt,
    }))(user);

    return { user: safeUser, ...tokens };
  }

  async register(registerDto: RegisterDto) {
    await this.rateLimiter.checkRegister(registerDto.email);

    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already exists');

    const user = await this.userService.create({
      ...registerDto,
      role: UserRole.USER,
      fullName: registerDto.fullName,
    });

    await this.otpRepo.createOtp(user.id, registerDto.email);

    return {
      message: 'Registration successful. Please verify your account',
      email: user.email,
    };
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userService.create({
      email: dto.email,
      role: UserRole.ADMIN,
      password: dto.password,
      fullName: dto.fullName,
      status: UserStatus.ACTIVE,
      provider: UserProvider.LOCAL,
    });

    const safeUser = (({
      id,
      role,
      email,
      status,
      fullName,
      provider,
      avatarUrl,
      createdAt,
      updatedAt,
    }) => ({
      id,
      role,
      email,
      status,
      fullName,
      provider,
      avatarUrl,
      createdAt,
      updatedAt,
    }))(user);

    return safeUser;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    return this.tokenRepo.refreshTokens(
      userId,
      refreshToken,
      this.userService.findById.bind(this.userService),
    );
  }

  async decodeRefreshToken(token: string) {
    return this.tokenRepo.decodeRefreshToken(token);
  }

  async verifyUser(email: string, otp: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid or expired OTP');

    const isValid = await this.otpRepo.validateOtp(user.id, otp);
    if (!isValid) throw new BadRequestException('Invalid or expired OTP');

    await this.userService.update(user.id, {
      status: UserStatus.ACTIVE,
      verificationOtp: null,
      otpExpiresAt: null,
    });

    return { message: 'Account successfully verified' };
  }

  async forgotPassword(email: string) {
    await this.rateLimiter.checkForgotPassword(email);

    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    await this.otpRepo.sendOtpForPasswordReset(user.id, email);

    return { message: 'OTP sent to email' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    await this.rateLimiter.checkResetPassword(email);

    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.otpRepo.validateOtp(user.id, otp);
    if (!isValid) throw new BadRequestException('Invalid or expired OTP');

    await this.userService.update(user.id, {
      password: await argon2.hash(newPassword),
      lastPasswordChangeAt: new Date(),
      failedLoginAttempts: 0,
      locked: false,
      status: UserStatus.ACTIVE,
    });

    await this.otpRepo.removeOtp(user.id);

    return { message: 'Password reset successfully' };
  }

  async resendOtp(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    await this.otpRepo.resendOtp(user.id, email);

    return { message: 'OTP resent successfully', email };
  }

  async validateGoogleUser(user: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
  }) {
    let existingUser = await this.userService.findByEmail(user.email);

    if (!existingUser) {
      existingUser = await this.userService.create({
        password: '',
        email: user.email,
        role: UserRole.USER,
        avatarUrl: user.picture,
        status: UserStatus.ACTIVE,
        provider: UserProvider.GOOGLE,
        fullName: `${user.firstName} ${user.lastName}`,
      });
    }

    return this.tokenRepo.generateTokens(existingUser);
  }

  async verifyToken(token: string) {
    const payload = await this.tokenRepo.verifyAccessToken(token);
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      valid: true,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    };
  }

  async logout(userId: string) {
    await this.tokenRepo.revokeAllTokens(userId);
    return { message: 'Logged out successfully' };
  }
}
