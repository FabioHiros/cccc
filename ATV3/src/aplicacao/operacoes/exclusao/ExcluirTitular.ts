import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { Cliente } from '../../../core/entidades/Cliente';

export class ExcluirTitular extends OperacaoBase {
    private armazem: ArmazemDados;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
    }

    processar(): void {
        console.clear();
        console.log('🗑️  EXCLUINDO CLIENTE TITULAR');
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

        if (titular.Dependentes.length > 0) {
            console.log(`⚠️  Este titular possui ${titular.Dependentes.length} dependente(s).`);
            const confirmacao = this.entrada.receberTexto('Deseja excluir também os dependentes? (S/N):');
            
            if (confirmacao.toUpperCase() === 'S') {
                // Remove todos os dependentes
                titular.Dependentes.forEach(dependente => {
                    this.armazem.removerCliente(dependente);
                });
                console.log(`✅ ${titular.Dependentes.length} dependente(s) excluído(s).`);
            } else {
                console.log('❌ Operação cancelada. Não é possível excluir titular com dependentes.');
                return;
            }
        }

        this.armazem.removerCliente(titular);
        console.log('✅ Titular excluído com sucesso!');
    }

    private listarTitulares(titulares: Cliente[]): void {
        console.log('👥 TITULARES DISPONÍVEIS:');
        console.log('─'.repeat(30));
        titulares.forEach(titular => {
            console.log(`• ${titular.Nome}`);
            titular.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
            if (titular.Dependentes.length > 0) {
                console.log(`  👥 ${titular.Dependentes.length} dependente(s)`);
            }
            console.log('');
        });
    }
}