import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

@Injectable()
export class ClientAdminBackendService
{
    private clientAdminBackend: ClientProxy;
    private configService: ConfigService;

    constructor(configService: ConfigService) {
        this.configService = configService;
        this.setup();
    }

    private setup() {
        const amqpUrl = this.getConnectionUrl();
    
        this.clientAdminBackend = ClientProxyFactory.create({
          transport: Transport.RMQ,
          options:{
            urls: [amqpUrl],
            queue: 'admin-backend'
          }
        });
    }

    private getConnectionUrl(): string
    {
        let url = 'amqp://';
        url += `${this.configService.get<string>('RABBITMQ_USER')}:`;
        url += this.configService.get<string>('RABBITMQ_PASS');
        url += `@${this.configService.get<string>('RABBITMQ_HOST')}`;
        url += `:${this.configService.get<string>('RABBITMQ_PORT')}/smartranking`;
        return url;
    }

    public client() : ClientProxy
    {
        return this.clientAdminBackend;
    }
}