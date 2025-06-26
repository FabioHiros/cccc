import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaMenu } from '../../../apresentacao/menus/EstrategiaMenu';
import { MenuEdicao } from '../../../apresentacao/menus/MenuEdicao';
import { Cliente } from '../../../core/entidades/Cliente';

export class EditarDependente extends OperacaoBase {
    private armazem: ArmazemDados;
    private menuEdicao: EstrategiaMenu;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.menuEdicao = new MenuEdicao();
    }

    processar(): void {
        console.clear();
        console.log('✏️  EDITANDO CLIENTE DEPENDENTE');
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

        let continuar = true;
        while (continuar) {
            this.menuEdicao.exibir();
            const opcao = this.entrada.receberNumero('Escolha o que deseja editar:');

            switch (opcao) {
                case 1:
                    const novoNome = this.entrada.receberTexto('📝 Novo nome:');
                    dependente.definirNome(novoNome);
                    console.log('✅ Nome atualizado!');
                    break;
                case 2:
                    const novoNomeSocial = this.entrada.receberTexto('🏷️  Novo nome social:');
                    dependente.definirNomeSocial(novoNomeSocial);
                    console.log('✅ Nome social atualizado!');
                    break;
                case 3:
                    const novaData = this.entrada.receberData('🎂 Nova data de nascimento');
                    dependente.definirDataNascimento(novaData);
                    console.log('✅ Data de nascimento atualizada!');
                    break;
                case 4:
                    this.alterarTitular(dependente);
                    break;
                case 5:
                    console.log('ℹ️  O endereço é herdado do titular.');
                    break;
                case 6:
                    this.editarDocumentos(dependente);
                    break;
                case 0:
                    continuar = false;
                    break;
                default:
                    console.log('❌ Opção inválida!');
            }
        }
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

    private alterarTitular(dependente: Cliente): void {
        const titulares = this.armazem.obterTitulares();
        if (titulares.length === 0) {
            console.log('❌ Não há titulares disponíveis!');
            return;
        }

        console.log('👥 TITULARES DISPONÍVEIS:');
        titulares.forEach(titular => {
            console.log(`• ${titular.Nome}`);
            titular.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
        });

        const numeroDoc = this.entrada.receberTexto('📄 Digite o número do documento do novo titular:');
        const novoTitular = this.armazem.buscarClientePorDocumento(numeroDoc);

        if (!novoTitular || !novoTitular.ehTitular()) {
            console.log('❌ Titular não encontrado!');
            return;
        }

        // Remove do titular anterior
        if (dependente.Titular) {
            dependente.Titular.removerDependente(dependente);
        }

        // Adiciona ao novo titular
        novoTitular.adicionarDependente(dependente);
        
        // Atualiza dados herdados
        if (novoTitular.Endereco) {
            dependente.definirEndereco(novoTitular.Endereco.clonar());
        }

        console.log('✅ Titular alterado com sucesso!');
    }

    private editarDocumentos(cliente: Cliente): void {
        if (cliente.Documentos.length === 0) {
            console.log('❌ Nenhum documento cadastrado!');
            return;
        }

        console.log('📄 DOCUMENTOS CADASTRADOS:');
        cliente.Documentos.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.Tipo}: ${doc.Numero}`);
        });

        const indice = this.entrada.receberNumero('Digite o número do documento a editar:') - 1;
        if (indice >= 0 && indice < cliente.Documentos.length) {
            const documento = cliente.Documentos[indice];
            const novoNumero = this.entrada.receberTexto(`📄 Novo número do ${documento.Tipo}:`);
            const novaData = this.entrada.receberData('📅 Nova data de expedição');
            
            documento.definirNumero(novoNumero);
            documento.definirDataExpedicao(novaData);
            console.log('✅ Documento atualizado!');
        } else {
            console.log('❌ Documento não encontrado!');
        }
    }
}