import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaFormatacao } from '../../../apresentacao/formatadores/EstrategiaFormatacao';
import { FormatadorCliente } from '../../../apresentacao/formatadores/FormatadorCliente';

export class ListarTitulares extends OperacaoBase {
    private armazem: ArmazemDados;
    private formatador: EstrategiaFormatacao;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.formatador = new FormatadorCliente();
    }

    processar(): void {
        console.clear();
        console.log('📋 LISTA DE TITULARES');
        console.log('═'.repeat(50));
        
        const titulares = this.armazem.obterTitulares();
        if (titulares.length === 0) {
            console.log('📭 Nenhum titular encontrado.');
            return;
        }
        
        titulares.forEach((titular, index) => {
            console.log(`\n${index + 1}. ${this.formatador.formatar(titular)}`);
        });
        
        console.log(`\n📊 Total de titulares: ${titulares.length}`);
    }
}