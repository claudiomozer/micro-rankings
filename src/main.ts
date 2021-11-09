import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import * as momentTimezone from 'moment-timezone';

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

  Date.prototype.toJSON = function(): any {
    return momentTimezone(this)
      .tz('America/Sao_Paulo')
      .format('YYYY-MM-DD HH:mm:ss.SSS');
  };

  await app.listen();
}
bootstrap();
