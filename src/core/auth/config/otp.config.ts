import { registerAs } from '@nestjs/config';

export default registerAs('otp', () => ({
  resendApiKey: process.env.RESEND_API_KEY,
  otpFromEmail: process.env.OTP_FROM_EMAIL,
}));
