import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  apiKey: process.env.CLOUDINARY_API_KEY,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}));
