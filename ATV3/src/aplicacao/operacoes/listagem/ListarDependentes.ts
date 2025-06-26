import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaFormatacao } from '../../../apresentacao/formatadores/EstrategiaFormatacao';
import { FormatadorCliente } from '../../../apresentacao/formatadores/FormatadorCliente';

export class ListarDependentes extends OperacaoBase {
    private armazem: ArmazemDados;
    private formatador: EstrategiaFormatacao;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.formatador = new FormatadorCliente();
    }

    processar(): void {
        console.clear();
        console.log('📋 LISTA DE DEPENDENTES');
        console.log('═'.repeat(50));
        
        const dependentes = this.armazem.obterDependentes();
        if (dependentes.length === 0) {
            console.log('📭 Nenhum dependente encontrado.');
            return;
        }
        
        dependentes.forEach((dependente, index) => {
            console.log(`\n${index + 1}. ${this.formatador.formatar(dependente)}`);
        });
        
        console.log(`\n📊 Total de dependentes: ${dependentes.length}`);
    }
}