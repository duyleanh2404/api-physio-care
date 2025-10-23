import { createClient } from 'redis';
import { Module } from '@nestjs/common';

import { QrService } from './qr.service';
import { QrGateway } from './qr.gateway';

import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/modules/users/user.module';
import { QrController } from './qr.controller';

@Module({
  imports: [UserModule, AuthModule],
  providers: [
    QrGateway,
    QrService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = createClient({ url: process.env.REDIS_URL });
        client.connect();
        return client;
      },
    },
  ],
  controllers: [QrController],
  exports: [QrService],
})
export class QrModule {}
