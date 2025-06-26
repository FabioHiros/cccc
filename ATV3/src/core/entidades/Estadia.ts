import Acomodacao from './Acomodacao';
import { Cliente } from './Cliente';

export class Estadia {
    private dataCheckIn: Date;
    private dataCheckOut: Date | null = null;
    private dataPrevisaoSaida: Date;
    private ativa: boolean = true;

    constructor(
        private cliente: Cliente,
        private acomodacao: Acomodacao,
        private tipoAcomodacao: string,
        dataEntrada: Date,
        dataSaidaPrevista: Date
    ) {
        this.dataCheckIn = dataEntrada;
        this.dataPrevisaoSaida = dataSaidaPrevista;
    }

    // Getters
    get Cliente(): Cliente { return this.cliente; }
    get Acomodacao(): Acomodacao { return this.acomodacao; }
    get TipoAcomodacao(): string { return this.tipoAcomodacao; }
    get DataCheckIn(): Date { return this.dataCheckIn; }
    get DataCheckOut(): Date | null { return this.dataCheckOut; }
    get DataPrevisaoSaida(): Date { return this.dataPrevisaoSaida; }
    get Ativa(): boolean { return this.ativa; }

    // Métodos de negócio
    realizarCheckOut(): void {
        this.dataCheckOut = new Date();
        this.ativa = false;
    }

    estaAtiva(): boolean {
        return this.ativa && this.dataCheckOut === null;
    }

    calcularDiarias(): number {
        const dataFim = this.dataCheckOut || new Date();
        const diffTime = Math.abs(dataFim.getTime() - this.dataCheckIn.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    estenderEstadia(novaDataSaida: Date): void {
        if (novaDataSaida > this.dataPrevisaoSaida) {
            this.dataPrevisaoSaida = novaDataSaida;
        }
    }
}