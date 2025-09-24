import * as argon2 from 'argon2';

import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { EmailRepository } from './email.repository';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class OtpRepository {
  constructor(
    private readonly userService: UserService,
    private readonly emailRepo: EmailRepository,
  ) {}

  async createOtp(
    userId: string,
    email: string,
    length = 6,
    ttl = 5 * 60 * 1000,
  ): Promise<string> {
    const otp = this.generateOtp(length);
    const hashedOtp = await argon2.hash(otp);
    const expiresAt = new Date(Date.now() + ttl);

    try {
      await this.userService.update(userId, {
        verificationOtp: hashedOtp,
        otpExpiresAt: expiresAt,
      });

      await this.emailRepo.sendOtp(email, otp, 'Xác minh tài khoản');

      return otp;
    } catch (err) {
      throw new InternalServerErrorException(
        `Không thể tạo OTP: ${err.message || err}`,
      );
    }
  }

  async resendOtp(userId: string, email: string): Promise<string> {
    const otp = this.generateOtp(6);
    const hashedOtp = await argon2.hash(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      await this.userService.update(userId, {
        verificationOtp: hashedOtp,
        otpExpiresAt: expiresAt,
      });

      await this.emailRepo.sendOtp(email, otp, 'Gửi lại mã OTP');

      return otp;
    } catch (err) {
      throw new InternalServerErrorException(
        `Không thể gửi lại OTP: ${err.message || err}`,
      );
    }
  }

  async sendOtpForPasswordReset(
    userId: string,
    email: string,
  ): Promise<string> {
    const otp = this.generateOtp(6);
    const hashedOtp = await argon2.hash(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      await this.userService.update(userId, {
        verificationOtp: hashedOtp,
        otpExpiresAt: expiresAt,
      });

      await this.emailRepo.sendOtp(email, otp, 'Đặt lại mật khẩu');

      return otp;
    } catch (err) {
      throw new InternalServerErrorException(
        `Không thể gửi OTP đặt lại mật khẩu: ${err.message || err}`,
      );
    }
  }

  async validateOtp(userId: string, otp: string): Promise<boolean> {
    const user = await this.userService.findById(userId);

    if (!user || !user.verificationOtp || !user.otpExpiresAt) return false;

    const isNotExpired = user.otpExpiresAt > new Date();
    const isValid = await argon2.verify(user.verificationOtp, otp);

    return isValid && isNotExpired;
  }

  async removeOtp(userId: string) {
    await this.userService.update(userId, {
      verificationOtp: null,
      otpExpiresAt: null,
    });
  }

  async getOtpExpiry(userId: string): Promise<Date | null> {
    const user = await this.userService.findById(userId);
    return user?.otpExpiresAt ?? null;
  }

  private generateOtp(length: number): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }
}
