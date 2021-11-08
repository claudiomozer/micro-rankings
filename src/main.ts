import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

let amqpUrl = 'amqp://';
amqpUrl += `${process.env.RABBITMQ_USER}:`;
amqpUrl += process.env.RABBITMQ_PASS;
amqpUrl += `@${process.env.RABBITMQ_HOST}`;
amqpUrl += `:${process.env.RABBITMQ_PORT}/smartranking`;

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [amqpUrl],
      noAck: false,
      queue: 'rankings'
    }
  });

  await app.listen();
}
bootstrap();
