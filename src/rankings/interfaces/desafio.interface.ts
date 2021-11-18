import { DesafioStatus } from "./desafio-status.enum";
import { Document } from "mongoose";

export interface Desafio extends Document
{
    _id: string,
    dataHoraDesafio: Date,
    status: DesafioStatus,
    dataHoraSolicitacao: Date,
    dataHoraResposta: Date,
    solicitante: string,
    categoria: string,
    partida?: string,
    jogadores: string[]
}
