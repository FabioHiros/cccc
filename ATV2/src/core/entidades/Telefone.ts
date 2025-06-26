export class Telefone {
    constructor(
        private ddd: string,
        private numero: string
    ) {}

    get DDD(): string { return this.ddd; }
    get Numero(): string { return this.numero; }

    definirDDD(ddd: string): void { this.ddd = ddd; }
    definirNumero(numero: string): void { this.numero = numero; }

    clonar(): Telefone {
        return new Telefone(this.ddd, this.numero);
    }
}