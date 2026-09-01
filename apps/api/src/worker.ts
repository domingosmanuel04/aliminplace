import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('Aluniplace worker online — crons activos');
  await new Promise(() => undefined);
}

bootstrap();
