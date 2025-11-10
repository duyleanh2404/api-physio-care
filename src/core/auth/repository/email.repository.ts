import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

import { Resend } from 'resend';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import otpConfig from '../config/otp.config';
import { OtpRateLimiter } from '../services/otp-rate-limiter.service';

@Injectable()
export class EmailRepository {
  private readonly resend: Resend;
  private readonly otpFromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly otpRateLimiter: OtpRateLimiter,
  ) {
    const otpCfg =
      this.configService.getOrThrow<ConfigType<typeof otpConfig>>('otp');

    this.resend = new Resend(otpCfg.resendApiKey);
    this.otpFromEmail = otpCfg.otpFromEmail!;
  }

  private compileTemplate(templateName: string, context: any): string {
    const basePath =
      process.env.NODE_ENV === 'production'
        ? path.join(__dirname, 'templates')
        : path.join(__dirname, '../../../core/auth/mail/templates');

    const templatePath = path.join(basePath, `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    return template(context);
  }

  async sendOtp(email: string, otp: string, subject: string) {
    await this.otpRateLimiter.check(email);

    const html = this.compileTemplate('confirmation', {
      otp,
      email,
      subject,
      companyName: 'PhysioCare',
      ttlMinutes: 5,
    });

    try {
      const { error } = await this.resend.emails.send({
        from: this.otpFromEmail,
        to: email,
        subject,
        html,
      });

      if (error) {
        throw new InternalServerErrorException('Failed to send OTP email');
      }
    } catch (err) {
      throw new InternalServerErrorException(
        `Error sending OTP email: ${err.message || err}`,
      );
    }
  }
}
