import { Cliente } from '../entidades/Cliente';

export class ArmazemDados {
    private static instanciaUnica: ArmazemDados;
    private clientes: Cliente[] = [];

    private constructor() {}

    static get InstanciaUnica(): ArmazemDados {
        if (!ArmazemDados.instanciaUnica) {
            ArmazemDados.instanciaUnica = new ArmazemDados();
        }
        return ArmazemDados.instanciaUnica;
    }

    get Clientes(): Cliente[] {
        return this.clientes;
    }

    adicionarCliente(cliente: Cliente): void {
        this.clientes.push(cliente);
    }

    removerCliente(cliente: Cliente): void {
        const indice = this.clientes.indexOf(cliente);
        if (indice > -1) {
            this.clientes.splice(indice, 1);
        }
    }

    buscarClientePorDocumento(numeroDocumento: string): Cliente | undefined {
        return this.clientes.find(cliente =>
            cliente.Documentos.some(doc => doc.Numero === numeroDocumento)
        );
    }

    obterTitulares(): Cliente[] {
        return this.clientes.filter(cliente => cliente.ehTitular());
    }

    obterDependentes(): Cliente[] {
        return this.clientes.filter(cliente => !cliente.ehTitular());
    }
}