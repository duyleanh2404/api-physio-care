import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const dbConfig = (configService: ConfigService): DataSourceOptions => {
  const host = configService.get<string>('DB_HOST');
  const port = configService.get<string>('DB_PORT');
  const username = configService.get<string>('DB_USER');
  const password = configService.get<string>('DB_PASS');
  const dbName = configService.get<string>('DB_NAME');

  return {
    type: 'oracle',
    host,
    port: parseInt(port!, 10),
    username,
    password,
    serviceName: dbName,
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
    synchronize: true,
  };
};
