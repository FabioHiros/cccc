import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaMenu } from '../../../apresentacao/menus/EstrategiaMenu';
import { MenuEdicao } from '../../../apresentacao/menus/MenuEdicao';
import { Cliente } from '../../../core/entidades/Cliente';
import { Endereco } from '../../../core/entidades/Endereco';

export class EditarTitular extends OperacaoBase {
    private armazem: ArmazemDados;
    private menuEdicao: EstrategiaMenu;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.menuEdicao = new MenuEdicao();
    }

    processar(): void {
        console.clear();
        console.log('✏️  EDITANDO CLIENTE TITULAR');
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

        let continuar = true;
        while (continuar) {
            this.menuEdicao.exibir();
            const opcao = this.entrada.receberNumero('Escolha o que deseja editar:');

            switch (opcao) {
                case 1:
                    const novoNome = this.entrada.receberTexto('📝 Novo nome:');
                    titular.definirNome(novoNome);
                    console.log('✅ Nome atualizado!');
                    break;
                case 2:
                    const novoNomeSocial = this.entrada.receberTexto('🏷️  Novo nome social:');
                    titular.definirNomeSocial(novoNomeSocial);
                    console.log('✅ Nome social atualizado!');
                    break;
                case 3:
                    const novaData = this.entrada.receberData('🎂 Nova data de nascimento');
                    titular.definirDataNascimento(novaData);
                    console.log('✅ Data de nascimento atualizada!');
                    break;
                case 4:
                    this.editarTelefones(titular);
                    break;
                case 5:
                    this.editarEndereco(titular);
                    break;
                case 6:
                    this.editarDocumentos(titular);
                    break;
                case 0:
                    continuar = false;
                    break;
                default:
                    console.log('❌ Opção inválida!');
            }
        }
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

    private editarTelefones(cliente: Cliente): void {
        if (cliente.Telefones.length === 0) {
            console.log('❌ Nenhum telefone cadastrado!');
            return;
        }

        console.log('📞 TELEFONES CADASTRADOS:');
        cliente.Telefones.forEach((tel, index) => {
            console.log(`${index + 1}. (${tel.DDD}) ${tel.Numero}`);
        });

        const indice = this.entrada.receberNumero('Digite o número do telefone a editar:') - 1;
        if (indice >= 0 && indice < cliente.Telefones.length) {
            const telefone = cliente.Telefones[indice];
            const novoDDD = this.entrada.receberTexto('📞 Novo DDD:');
            const novoNumero = this.entrada.receberTexto('📞 Novo número:');
            
            telefone.definirDDD(novoDDD);
            telefone.definirNumero(novoNumero);
            console.log('✅ Telefone atualizado!');
        } else {
            console.log('❌ Telefone não encontrado!');
        }
    }

    private editarEndereco(cliente: Cliente): void {
        if (!cliente.Endereco) {
            console.log('❌ Nenhum endereço cadastrado!');
            return;
        }

        console.log('🏠 NOVO ENDEREÇO:');
        const rua = this.entrada.receberTexto('   Rua:');
        const bairro = this.entrada.receberTexto('   Bairro:');
        const cidade = this.entrada.receberTexto('   Cidade:');
        const estado = this.entrada.receberTexto('   Estado:');
        const pais = this.entrada.receberTexto('   País:');
        const cep = this.entrada.receberTexto('   CEP:');

        const novoEndereco = new Endereco(rua, bairro, cidade, estado, pais, cep);
        cliente.definirEndereco(novoEndereco);
        
        // Atualiza endereço dos dependentes
        cliente.Dependentes.forEach(dependente => {
            dependente.definirEndereco(novoEndereco.clonar());
        });
        
        console.log('✅ Endereço atualizado!');
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
