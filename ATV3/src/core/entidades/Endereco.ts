export class Endereco {
    constructor(
        private rua: string,
        private bairro: string,
        private cidade: string,
        private estado: string,
        private pais: string,
        private cep: string
    ) {}

    get Rua(): string { return this.rua; }
    get Bairro(): string { return this.bairro; }
    get Cidade(): string { return this.cidade; }
    get Estado(): string { return this.estado; }
    get Pais(): string { return this.pais; }
    get CEP(): string { return this.cep; }

    clonar(): Endereco {
        return new Endereco(this.rua, this.bairro, this.cidade, this.estado, this.pais, this.cep);
    }
}