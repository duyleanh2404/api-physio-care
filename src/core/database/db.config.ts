import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const dbConfig = (configService: ConfigService): DataSourceOptions => {
  const host = configService.get<string>('DB_HOST');
  const port = configService.get<string>('DB_PORT');
  const dbName = configService.get<string>('DB_NAME');
  const username = configService.get<string>('DB_USER');
  const password = configService.get<string>('DB_PASS');

  return {
    host,
    username,
    password,
    type: 'oracle',
    synchronize: true,
    serviceName: dbName,
    port: parseInt(port!, 10),
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
  };
};
