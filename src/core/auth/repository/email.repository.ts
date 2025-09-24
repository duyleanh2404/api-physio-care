import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { getOtpConfig } from '../config/otp.config';

@Injectable()
export class EmailRepository {
  private resend: Resend;
  private otpFromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const otpConfig = getOtpConfig(this.configService);
    this.resend = new Resend(otpConfig.resendApiKey);
    this.otpFromEmail = otpConfig.otpFromEmail!;
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
    const logoUrl = `${process.env.APP_URL}/logo.svg`;

    const html = this.compileTemplate('confirmation', {
      otp,
      email,
      logoUrl,
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
