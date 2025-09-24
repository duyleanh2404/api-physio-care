import { ConfigService } from '@nestjs/config';

export const getOtpConfig = (config: ConfigService) => ({
  resendApiKey: config.get<string>('RESEND_API_KEY'),
  otpFromEmail: config.get<string>('OTP_FROM_EMAIL'),
});
