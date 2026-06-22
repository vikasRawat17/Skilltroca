import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { validateEnv } from './utils/config/env.validation';
import { QuietLogger } from './utils/logger/quiet-logger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: new QuietLogger(),
  });
  app.enableCors({ origin: env.FRONTEND_URL, credentials: true });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(env.PORT);
  logger.log(`Server is live on port ${env.PORT}`);
}
void bootstrap();
