import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND,
    credentials: true,
  });

  //   // ✅ لازم raw body للـ webhook
  // app.use(
  //   '/api/v1/checkout/webhook',
  //   bodyParser.raw({ type: 'application/json' }),
  // );

  // خلي Stripe Webhook يستخدم raw body
  // app.use(
  //   '/api/v1/checkout/webhook',
  //   bodyParser.raw({ type: 'application/json' }),
  // );

    app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
      limit: '10mb',
    }),
  );

    app.enableCors({
    origin: process.env.FRONTEND, 
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
