import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { Cliente } from '../../../core/entidades/Cliente';

export class ExcluirDependente extends OperacaoBase {
    private armazem: ArmazemDados;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
    }

    processar(): void {
        console.clear();
        console.log('🗑️  EXCLUINDO CLIENTE DEPENDENTE');
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

        // Remove do titular
        if (dependente.Titular) {
            dependente.Titular.removerDependente(dependente);
        }

        // Remove do armazém
        this.armazem.removerCliente(dependente);
        console.log('✅ Dependente excluído com sucesso!');
    }

    private listarDependentes(dependentes: Cliente[]): void {
        console.log('👶 DEPENDENTES DISPONÍVEIS:');
        console.log('─'.repeat(30));
        dependentes.forEach(dependente => {
            console.log(`• ${dependente.Nome}`);
            dependente.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
            if (dependente.Titular) {
                console.log(`  👨‍👩‍👧‍👦 Titular: ${dependente.Titular.Nome}`);
            }
            console.log('');
        });
    }
}