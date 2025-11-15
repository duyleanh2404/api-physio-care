import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const dbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST');
  const port = configService.get<string>('DB_PORT');
  const dbName = configService.get<string>('DB_NAME');
  const username = configService.get<string>('DB_USER');
  const password = configService.get<string>('DB_PASS');

  return {
    type: 'postgres',
    host,
    port: parseInt(port!, 10),
    username,
    password,
    database: dbName,
    synchronize: true,
    autoLoadEntities: true,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  };
};
