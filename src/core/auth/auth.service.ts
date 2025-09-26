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

  async login(email: string, password: string) {
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

    const tokens = await this.tokenRepo.generateTokens(user);

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

    const hashedPassword = await argon2.hash(registerDto.password);

    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
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

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      role: UserRole.ADMIN,
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

    user.password = await argon2.hash(newPassword);

    await this.userService.update(user.id, user);
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
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        avatarUrl: user.picture,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        provider: UserProvider.GOOGLE,
      });
    }

    return this.tokenRepo.generateTokens(existingUser);
  }

  async logout(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.tokenRepo.removeRefreshToken(userId);

    return { message: 'Logged out successfully' };
  }
}
