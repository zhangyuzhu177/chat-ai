import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const cfgSrv = app.get(ConfigService)

  app.enableCors({
    origin: true, // 允许任何来源（自动反射请求的 origin）
    credentials: true, // 允许携带 Cookie
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.use(cookieParser())

  app.setGlobalPrefix(cfgSrv.get('API_PREFIX')!);
  await app.listen(parseInt(cfgSrv.get('PORT') || '3000'));
  logger.verbose(`App is running on ${await app.getUrl()}${cfgSrv.get('API_PREFIX')}`);
}

bootstrap();
