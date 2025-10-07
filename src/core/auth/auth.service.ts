import * as argon2 from 'argon2';

import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

import { OtpRepository } from './repository/otp.repository';
import { TokenRepository } from './repository/token.repository';

import { UserService } from 'src/modules/user/user.service';
import { UserProvider, UserRole, UserStatus } from 'src/enums/user.enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,

    private readonly otpRepo: OtpRepository,
    private readonly tokenRepo: TokenRepository,
  ) {}

  async login(
    email: string,
    password: string,
    deviceInfo?: any,
    ipAddress?: string,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user || !(await argon2.verify(user.password!, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.otpRepo.createOtp(user.id, email);
      throw new ForbiddenException(
        'Account not verified. OTP has been sent to your email',
      );
    }

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
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already exists');

    const user = await this.userService.create({
      ...registerDto,
      role: UserRole.USER,
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

    await this.userService.update(user.id, { status: UserStatus.ACTIVE });
    await this.otpRepo.removeOtp(user.id);

    return { message: 'Account successfully verified' };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    await this.otpRepo.sendOtpForPasswordReset(user.id, email);

    return { message: 'OTP sent to email' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.otpRepo.validateOtp(user.id, otp);
    if (!isValid) throw new BadRequestException('Invalid or expired OTP');

    await this.userService.update(user.id, {
      password: await argon2.hash(newPassword),
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
