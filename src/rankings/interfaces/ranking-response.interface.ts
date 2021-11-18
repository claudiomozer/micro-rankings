export interface RankingResponse
{
    jogador?: string;
    posicao?: string;
    pontuacao?: number;
    historicoPartidas?: Historico;
}

export interface Historico
{
    vitorias?: number;
    derrotas?: number;
}