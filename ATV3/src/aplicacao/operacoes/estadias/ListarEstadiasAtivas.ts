import { OperacaoBase } from '../OperacaoBase';
import { ArmazemEstadias } from '../../../core/repositorios/ArmazemEstadias';
import { FormatadorEstadia } from '../../../apresentacao/formatadores/FormatadorEstadia';

export class ListarEstadiasAtivas extends OperacaoBase {
    private armazem: ArmazemEstadias;
    private formatador: FormatadorEstadia;

    constructor() {
        super();
        this.armazem = ArmazemEstadias.InstanciaUnica;
        this.formatador = new FormatadorEstadia();
    }

    processar(): void {
        console.clear();
        console.log('📋 ESTADIAS ATIVAS');
        console.log('═'.repeat(50));

        const estadiasAtivas = this.armazem.obterEstadiasAtivas();
        if (estadiasAtivas.length === 0) {
            console.log('📭 Nenhuma estadia ativa encontrada.');
            return;
        }

        estadiasAtivas.forEach((estadia, index) => {
            console.log(`\n${index + 1}. ${this.formatador.formatar(estadia)}`);
        });

        console.log(`\n📊 Total de estadias ativas: ${estadiasAtivas.length}`);
    }
}