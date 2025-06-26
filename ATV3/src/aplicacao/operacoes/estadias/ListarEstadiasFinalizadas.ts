import { OperacaoBase } from '../OperacaoBase';
import { ArmazemEstadias } from '../../../core/repositorios/ArmazemEstadias';
import { FormatadorEstadia } from '../../../apresentacao/formatadores/FormatadorEstadia';

export class ListarEstadiasFinalizadas extends OperacaoBase {
    private armazem: ArmazemEstadias;
    private formatador: FormatadorEstadia;

    constructor() {
        super();
        this.armazem = ArmazemEstadias.InstanciaUnica;
        this.formatador = new FormatadorEstadia();
    }

    processar(): void {
        console.clear();
        console.log('📊 ESTADIAS FINALIZADAS');
        console.log('═'.repeat(50));

        const estadiasFinalizadas = this.armazem.obterEstadiasFinalizadas();
        if (estadiasFinalizadas.length === 0) {
            console.log('📭 Nenhuma estadia finalizada encontrada.');
            return;
        }

        estadiasFinalizadas.forEach((estadia, index) => {
            console.log(`\n${index + 1}. ${this.formatador.formatar(estadia)}`);
        });

        console.log(`\n📊 Total de estadias finalizadas: ${estadiasFinalizadas.length}`);
    }
}