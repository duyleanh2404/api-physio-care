import { Injectable } from '@nestjs/common';
import { createSign, createVerify } from 'crypto';

@Injectable()
export class SignatureService {
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor() {
    this.privateKey =
      process.env.ECDSA_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '';
    this.publicKey = process.env.ECDSA_PUBLIC_KEY?.replace(/\\n/g, '\n') ?? '';
  }

  signBuffer(buffer: Buffer): string {
    if (!this.privateKey) return '';
    const sign = createSign('SHA256');
    sign.update(buffer);
    sign.end();
    return sign.sign(this.privateKey).toString('hex');
  }

  verifyBuffer(buffer: Buffer, signature: string): boolean {
    if (!this.publicKey || !signature) return false;
    const verify = createVerify('SHA256');
    verify.update(buffer);
    verify.end();
    try {
      return verify.verify(this.publicKey, Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  }
}
