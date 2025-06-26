import { Documento } from './Documento';
import { Endereco } from './Endereco';
import { Telefone } from './Telefone';

export class Cliente {
    private dependentes: Cliente[] = [];
    private documentos: Documento[] = [];
    private telefones: Telefone[] = [];
    private dataCadastro: Date;

    constructor(
        private nome: string,
        private nomeSocial: string,
        private dataNascimento: Date,
        private endereco?: Endereco,
        private titular?: Cliente
    ) {
        this.dataCadastro = new Date();
    }

    // Getters
    get Nome(): string { return this.nome; }
    get NomeSocial(): string { return this.nomeSocial; }
    get DataNascimento(): Date { return this.dataNascimento; }
    get DataCadastro(): Date { return this.dataCadastro; }
    get Endereco(): Endereco | undefined { return this.endereco; }
    get Titular(): Cliente | undefined { return this.titular; }
    get Dependentes(): Cliente[] { return [...this.dependentes]; }
    get Documentos(): Documento[] { return [...this.documentos]; }
    get Telefones(): Telefone[] { return [...this.telefones]; }

  
    definirNome(nome: string): void { this.nome = nome; }
    definirNomeSocial(nomeSocial: string): void { this.nomeSocial = nomeSocial; }
    definirDataNascimento(data: Date): void { this.dataNascimento = data; }
    definirEndereco(endereco: Endereco): void { this.endereco = endereco; }
    definirTitular(titular: Cliente): void { this.titular = titular; }

  
    adicionarDependente(dependente: Cliente): void {
        if (!this.dependentes.includes(dependente)) {
            this.dependentes.push(dependente);
            dependente.definirTitular(this);
        }
    }

    removerDependente(dependente: Cliente): void {
        const indice = this.dependentes.indexOf(dependente);
        if (indice > -1) {
            this.dependentes.splice(indice, 1);
        }
    }

    adicionarDocumento(documento: Documento): void {
        this.documentos.push(documento);
    }

    adicionarTelefone(telefone: Telefone): void {
        this.telefones.push(telefone);
    }

    ehTitular(): boolean {
        return this.titular === undefined;
    }

    buscarDocumento(numeroDocumento: string): Documento | undefined {
        return this.documentos.find(doc => doc.Numero === numeroDocumento);
    }
}