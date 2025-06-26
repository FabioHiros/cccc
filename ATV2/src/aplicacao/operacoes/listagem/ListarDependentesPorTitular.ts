import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaFormatacao } from '../../../apresentacao/formatadores/EstrategiaFormatacao';
import { FormatadorCliente } from '../../../apresentacao/formatadores/FormatadorCliente';
import { Cliente } from '../../../core/entidades/Cliente';

export class ListarDependentesPorTitular extends OperacaoBase {
    private armazem: ArmazemDados;
    private formatador: EstrategiaFormatacao;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.formatador = new FormatadorCliente();
    }

      processar(): void {
        console.clear();
        console.log('🔍 DEPENDENTES POR TITULAR');
        console.log('═'.repeat(50));
        
        const titulares = this.armazem.obterTitulares();
        if (titulares.length === 0) {
            console.log('❌ Não há titulares cadastrados!');
            return;
        }
        
        this.listarTitulares(titulares);
        
        const numeroDoc = this.entrada.receberTexto('📄 Digite o número do documento do titular:');
        const titular = this.armazem.buscarClientePorDocumento(numeroDoc);
        
        if (!titular || !titular.ehTitular()) {
            console.log('❌ Titular não encontrado!');
            return;
        }
        
        console.log(`\n👥 DEPENDENTES DE ${titular.Nome.toUpperCase()}:`);
        console.log('═'.repeat(50));
        
        if (titular.Dependentes.length === 0) {
            console.log('📭 Este titular não possui dependentes.');
            return;
        }
        
        titular.Dependentes.forEach((dependente, index) => {
            console.log(`\n${index + 1}. ${this.formatador.formatar(dependente)}`);
        });
        
        console.log(`\n📊 Total de dependentes: ${titular.Dependentes.length}`);
    }

    private listarTitulares(titulares: Cliente[]): void {
        console.log('👥 TITULARES DISPONÍVEIS:');
        console.log('─'.repeat(30));
        titulares.forEach(titular => {
            console.log(`• ${titular.Nome}`);
            titular.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
            console.log('');
        });
    }
}