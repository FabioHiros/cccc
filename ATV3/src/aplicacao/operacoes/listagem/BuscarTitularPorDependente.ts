import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaFormatacao } from '../../../apresentacao/formatadores/EstrategiaFormatacao';
import { FormatadorCliente } from '../../../apresentacao/formatadores/FormatadorCliente';
import { Cliente } from '../../../core/entidades/Cliente';

export class BuscarTitularPorDependente extends OperacaoBase {
    private armazem: ArmazemDados;
    private formatador: EstrategiaFormatacao;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.formatador = new FormatadorCliente();
    }

    processar(): void {
        console.clear();
        console.log('🔎 BUSCAR TITULAR POR DEPENDENTE');
        console.log('═'.repeat(50));
        
        const dependentes = this.armazem.obterDependentes();
        if (dependentes.length === 0) {
            console.log('❌ Não há dependentes cadastrados!');
            return;
        }
        
        this.listarDependentes(dependentes);
        
        const numeroDoc = this.entrada.receberTexto('📄 Digite o número do documento do dependente:');
        const dependente = this.armazem.buscarClientePorDocumento(numeroDoc);
        
        if (!dependente || dependente.ehTitular()) {
            console.log('❌ Dependente não encontrado!');
            return;
        }
        
        if (!dependente.Titular) {
            console.log('❌ Este dependente não possui titular associado.');
            return;
        }
        
        console.log(`\n👨‍👩‍👧‍👦 TITULAR DE ${dependente.Nome.toUpperCase()}:`);
        console.log('═'.repeat(50));
        console.log(this.formatador.formatar(dependente.Titular));
    }

    private listarDependentes(dependentes: Cliente[]): void {
        console.log('👶 DEPENDENTES DISPONÍVEIS:');
        console.log('─'.repeat(30));
        dependentes.forEach(dependente => {
            console.log(`• ${dependente.Nome}`);
            dependente.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
            console.log('');
        });
    }
}