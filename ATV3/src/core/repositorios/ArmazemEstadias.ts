import { Estadia } from '../entidades/Estadia';
import { Cliente } from '../entidades/Cliente';

export class ArmazemEstadias {
    private static instanciaUnica: ArmazemEstadias;
    private estadias: Estadia[] = [];

    private constructor() {}

    static get InstanciaUnica(): ArmazemEstadias {
        if (!ArmazemEstadias.instanciaUnica) {
            ArmazemEstadias.instanciaUnica = new ArmazemEstadias();
        }
        return ArmazemEstadias.instanciaUnica;
    }

    get Estadias(): Estadia[] {
        return [...this.estadias];
    }

    adicionarEstadia(estadia: Estadia): void {
        this.estadias.push(estadia);
    }

    removerEstadia(estadia: Estadia): void {
        const indice = this.estadias.indexOf(estadia);
        if (indice > -1) {
            this.estadias.splice(indice, 1);
        }
    }

    realizarCheckOut(estadia: Estadia): void {
        estadia.realizarCheckOut();
    }

    obterEstadiasAtivas(): Estadia[] {
        return this.estadias.filter(estadia => estadia.estaAtiva());
    }

    obterEstadiasFinalizadas(): Estadia[] {
        return this.estadias.filter(estadia => !estadia.estaAtiva());
    }

    obterEstadiasPorCliente(cliente: Cliente): Estadia[] {
        return this.estadias.filter(estadia => estadia.Cliente === cliente);
    }

    obterEstadiasPorTipo(tipo: string): Estadia[] {
        return this.estadias.filter(estadia => estadia.TipoAcomodacao === tipo);
    }

    obterEstadiaAtivaDoCliente(cliente: Cliente): Estadia | undefined {
        return this.estadias.find(estadia => 
            estadia.Cliente === cliente && estadia.estaAtiva()
        );
    }

    obterEstatisticas(): { ativas: number, finalizadas: number, total: number } {
        const ativas = this.obterEstadiasAtivas().length;
        const finalizadas = this.obterEstadiasFinalizadas().length;
        const total = this.estadias.length;
        
        return { ativas, finalizadas, total };
    }
}