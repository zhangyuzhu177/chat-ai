import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const cfgSrv = app.get(ConfigService)
console.log(cfgSrv.get('CLIENT_URL'));

  // app.enableCors({
  //   origin: cfgSrv.get('CLIENT_URL'),
  //   credentials: true,
  // });

  app.enableCors()

  app.use(cookieParser())

  app.setGlobalPrefix(cfgSrv.get('API_PREFIX')!);
  await app.listen(parseInt(cfgSrv.get('PORT') || '3000'));
  logger.verbose(`App is running on ${await app.getUrl()}${cfgSrv.get('API_PREFIX')}`);
}

bootstrap();
