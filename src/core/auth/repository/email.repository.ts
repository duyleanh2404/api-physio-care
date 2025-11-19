import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

import { Resend } from 'resend';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import otpConfig from '../config/otp.config';
import { RateLimiterService } from '../modules/rate-limiter/rate-limiter.service';

@Injectable()
export class EmailRepository {
  private readonly resend: Resend;
  private readonly otpFromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimiter: RateLimiterService,
  ) {
    const otpCfg =
      this.configService.getOrThrow<ConfigType<typeof otpConfig>>('otp');

    this.resend = new Resend(otpCfg.resendApiKey);
    this.otpFromEmail = otpCfg.otpFromEmail!;
  }

  private compileTemplate(templateName: string, context: any): string {
    const basePath = path.resolve(__dirname, 'templates');

    const templatePath = path.join(basePath, `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at path: ${templatePath}`);
    }

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    return template(context);
  }

  async sendOtp(email: string, otp: string, subject: string) {
    await this.rateLimiter.checkOtp(email);

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
