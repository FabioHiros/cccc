import { TipoDocumento } from '../enums/TipoDocumento';

export class Documento {
    constructor(
        private numero: string,
        private tipo: TipoDocumento,
        private dataExpedicao: Date
    ) {}

    get Numero(): string { return this.numero; }
    get Tipo(): TipoDocumento { return this.tipo; }
    get DataExpedicao(): Date { return this.dataExpedicao; }

    definirNumero(numero: string): void { this.numero = numero; }
    definirDataExpedicao(data: Date): void { this.dataExpedicao = data; }
}