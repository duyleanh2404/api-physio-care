import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { managerDbConfig } from '../manager-db.config';

export const ManagerDataSourceProvider = {
  provide: 'MANAGER_DATASOURCE',
  useFactory: async (configService: ConfigService) => {
    const dataSource = new DataSource(managerDbConfig(configService));
    return dataSource.initialize();
  },
  inject: [ConfigService],
};
