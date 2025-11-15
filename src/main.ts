import { join } from 'path';
import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const dataSource = app.get(DataSource);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    console.log('✅ PostgreSQL DB connected successfully');
  } catch (err) {
    console.error('❌ PostgreSQL DB connection failed:', err.message); // 🔄
    process.exit(1);
  }

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Physio Care API')
    .setDescription('API documentation for the Physiotherapy Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || process.env.APP_PORT || 8000;
  const host = process.env.RENDER
    ? '0.0.0.0'
    : process.env.APP_HOST || 'localhost';

  await app.listen(port, host);

  const appUrl = process.env.BACKEND_URL || `http://${host}:${port}`;
  console.log(`🚀 Server running at ${appUrl}`);
  console.log(`📖 Swagger docs available at ${appUrl}/api/v1/docs`);
}

bootstrap();
