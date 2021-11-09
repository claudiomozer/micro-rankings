import { Document } from "mongoose";

export interface Categoria extends Document 
{
    readonly _id: string;
    readonly categoria: string;
    descricao: string;
    eventos: Array<Evento>;
}

export interface Evento 
{
    nome: string;
    operacao: string;
    valor: number;
}