import { NomeAcomodacao } from "../enums/TipoAcomodacao";

export default class Acomodacao {
    constructor(
        private nomeAcomodacao: NomeAcomodacao,
        private camaSolteiro: number,
        private camaCasal: number,
        private suite: number,
        private climatizacao: boolean,
        private garagem: number
    ) {}

    public get NomeAcomodacao(): NomeAcomodacao { return this.nomeAcomodacao; }
    public get CamaSolteiro(): number { return this.camaSolteiro; }
    public get CamaCasal(): number { return this.camaCasal; }
    public get Suite(): number { return this.suite; }
    public get Climatizacao(): boolean { return this.climatizacao; }
    public get Garagem(): number { return this.garagem; }

    public getResumo(): string {
        return `${this.nomeAcomodacao} - Solteiro: ${this.camaSolteiro}, Casal: ${this.camaCasal}, Suítes: ${this.suite}, Climatização: ${this.climatizacao ? 'Sim' : 'Não'}, Garagem: ${this.garagem}`;
    }
}