import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom, Observable, Observer } from 'rxjs';
import { Categoria } from './interfaces/categoria,interface';
import { Partida } from './interfaces/partida.interface';
import { Ranking } from './interfaces/ranking.schema';
import { EventoNome } from './evento-nome.enum';
import { RankingResponse, Historico } from './interfaces/ranking-response.interface';
import * as momentTimezone from 'moment-timezone';
import * as _ from 'lodash';
import { ClientDesafiosService } from 'src/infrastructure/services/client-desafios.service';
import { ClientAdminBackendService } from 'src/infrastructure/services/client-admin-backend.service';

@Injectable()
export class RankingsService
{
    private readonly logger = new Logger(RankingsService.name);
    private readonly rankingModel: Model<Ranking>;
    private readonly clientAdminBackendService: ClientAdminBackendService;
    private readonly clientDesafiosService: ClientDesafiosService

    constructor (
      @InjectModel('Ranking') rankingModel: Model<Ranking>,
      clientAdminBackendService: ClientAdminBackendService,
      clientDesafiosService: ClientDesafiosService
    ) {
        this.rankingModel = rankingModel;
        this.clientAdminBackendService = clientAdminBackendService;
        this.clientDesafiosService = clientDesafiosService
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
    
                await ranking.save();
            }));   
        } catch (error) {
            this.logger.error(`error: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async consultarRankings(idCategoria: string, dataRef: string) : Promise<RankingResponse[] | RankingResponse>
    {
        try {
            this.logger.log(`idCategoria: ${idCategoria} data: ${dataRef}`);

            if (!dataRef) {
                dataRef = momentTimezone.tz('America/Sao_Paulo').format('YYYY-MM-DD');
                this.logger.log(`dataRef ${dataRef}`)
            }

            const registrosRanking = await this.rankingModel.find()
                .where('categoria')
                .equals(idCategoria)
                .exec();
            
            const desafiosObserver: Observable<any> = await this.clientDesafiosService.client().send('consultar-desafios-realizados', {
                idCategoria, dataRef
            });
            const desafios = await lastValueFrom(desafiosObserver);
  
            _.remove(registrosRanking, function (item) {
                desafios.filter(desafio => desafio._id == item.desafio);
            });

            this.logger.log(`registrosRanking: ${JSON.stringify(registrosRanking)}`);

            // Agrupar por jogador

            const resultado = _(registrosRanking)
                .groupBy('jogador')
                .map((items, key) => ({
                    'jogador': key,
                    'historico': _.countBy(items, 'evento'),
                    'pontos': _.sumBy(items, 'pontos')
                }))
                .value(); 
                
            const resultadoOrdenado = _.orderBy(resultado,'pontos', 'desc');

            const rankingResponseList: RankingResponse[] = [];
            return resultadoOrdenado.map( (item, index) => {
                const rankingResponse: RankingResponse = {};
                rankingResponse.jogador = item.jogador;
                rankingResponse.posicao = (index + 1);
                rankingResponse.pontuacao = item.pontos;

                const historico: Historico = {};
                historico.vitorias = item.historico.VITORIA ? item.historico.VITORIA : 0;
                historico.derrotas = item.historico.DERROTA ? item.historico.DERROTA : 0;
                rankingResponse.historicoPartidas = historico
                
                return rankingResponse;
            });
        } catch (error) {
            this.logger.error(`errors: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }
    }
}
