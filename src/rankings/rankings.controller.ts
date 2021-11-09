import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { timingSafeEqual } from 'crypto';
import { Partida } from './interfaces/partida.interface';
import { RankingsService } from './rankings.service';

const ackErros: string[] = ['E11000'];

@Controller()
export class RankingsController
{
    private readonly logger = new Logger(RankingsController.name);
    private readonly rankingsService: RankingsService;

    constructor(rankingsService: RankingsService)
    {
        this.rankingsService = rankingsService;
    }
    
    @EventPattern('processar-partida')
    async processarPartida(
        @Payload() data: any,
        @Ctx() context: RmqContext
    ) {
        const channel = context.getChannelRef();
        const originalMessage = context.getMessage();

        try {
            
            this.logger.log(`data: ${JSON.stringify(data)}`);
            const idPartida: string = data.idPartida;
            const partida: Partida = data.partida;

            await this.rankingsService.processarPartida(idPartida, partida);
            await channel.acK(originalMessage);

        } catch (error) {
            
            const filterAckError = ackErros.filter(ackError => error.message.includes(ackError));
            if (filterAckError.length > 0) {
                await channel.acK(originalMessage);
            }

        }
    }
}
