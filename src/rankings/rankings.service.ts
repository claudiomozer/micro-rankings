import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ClientAdminBackendService } from 'src/infrastructure/services/client-admin-backend.service';
import { Categoria } from './interfaces/categoria,interface';
import { Partida } from './interfaces/partida.interface';
import { Ranking } from './interfaces/ranking.schema';
import { EventoNome } from './evento-nome.enum';

@Injectable()
export class RankingsService
{
    private readonly logger = new Logger(RankingsService.name);
    private readonly rankingModel: Model<Ranking>;
    private readonly clientAdminBackendService: ClientAdminBackendService;

    constructor (
      @InjectModel('Ranking') rankingModel: Model<Ranking>,
      clientAdminBackendService: ClientAdminBackendService
    ) {
        this.rankingModel = rankingModel;
        this.clientAdminBackendService = clientAdminBackendService
    };

    async processarPartida(idPartida: string, partida: Partida): Promise<void>
    {
        try {

            let categoriaObservable = await this.clientAdminBackendService.client().send('consultar-categorias', partida.categoria);
            const categoria: Categoria = await lastValueFrom(categoriaObservable);

            await Promise.all(partida.jogadores.map(async jogador => {
                const ranking = new this.rankingModel();
    
                ranking.categoria = partida.categoria;
                ranking.desafio = partida.desafio;
                ranking.partida = idPartida;
                ranking.jogador = jogador;
    
                if (jogador === partida.def) {
                    const eventoFilter = categoria.eventos.filter(evento => {
                        return evento.nome === EventoNome.VITORIA
                    });
                    ranking.evento = EventoNome.VITORIA;
                    ranking.pontos = eventoFilter[0].valor;
                    ranking.operacao = eventoFilter[0].operacao;
                } else {
                    const eventoFilter = categoria.eventos.filter(evento => {
                        return evento.nome === EventoNome.DERROTA
                    });
                    ranking.evento = EventoNome.DERROTA;
                    ranking.pontos = eventoFilter[0].valor;
                    ranking.operacao = eventoFilter[0].operacao;
                }
    
                this.logger.log(`ranking: ${JSON.stringify(ranking)}`);
                await ranking.save();
            }));   
        } catch (error) {
            this.logger.error(`error: ${error.message}`);
            throw new RpcException(error.message);
        }
    }
}
