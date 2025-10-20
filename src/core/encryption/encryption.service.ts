import { Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export interface EncryptedFile {
  iv: Buffer;
  tag: Buffer;
  ciphertext: Buffer;
}

@Injectable()
export class EncryptionService {
  private readonly aesKey: Buffer;

  constructor() {
    this.aesKey = Buffer.from(process.env.AES_KEY!, 'hex');
  }

  encrypt(buffer: Buffer): EncryptedFile {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.aesKey, iv);
    const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    return { ciphertext, iv, tag };
  }

  decrypt(data: EncryptedFile): Buffer {
    const decipher = createDecipheriv('aes-256-gcm', this.aesKey, data.iv);
    decipher.setAuthTag(data.tag);
    return Buffer.concat([decipher.update(data.ciphertext), decipher.final()]);
  }
}
