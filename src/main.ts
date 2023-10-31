import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required to verify Stripe Webhook event signature (https://stripe.com/docs/webhooks/signatures)
  });
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle(configService.get('name'))
    // .setDescription('')
    .setVersion(configService.get('version'))
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-KEY' }, 'X-API-KEY')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // app.enableCors({
  //   allowedHeaders: ['content-type'],
  //   origin: 'http://localhost:3000',
  //   credentials: true,
  // });

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });

  await app.listen(configService.get('port'));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
