import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const managerDbConfig = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'oracle',
  host: configService.get<string>('DB_HOST'),
  port: Number(configService.get<string>('DB_PORT')),
  username: configService.get<string>('DB_MANAGER_USER'),
  password: configService.get<string>('DB_MANAGER_PASS'),
  serviceName: configService.get<string>('DB_NAME'),
});
