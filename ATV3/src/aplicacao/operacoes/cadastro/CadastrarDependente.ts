import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { Cliente } from '../../../core/entidades/Cliente';
import { Documento } from '../../../core/entidades/Documento';
import { TipoDocumento } from '../../../core/enums/TipoDocumento';
import { MenuDocumentos } from '../../../apresentacao/menus/MenuDocumentos';

export class CadastrarDependente extends OperacaoBase {
    private armazem: ArmazemDados;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
    }

    processar(): void {
        console.clear();
        console.log('🆕 CADASTRANDO CLIENTE DEPENDENTE');
        console.log('═'.repeat(50));
        
        const titulares = this.armazem.obterTitulares();
        if (titulares.length === 0) {
            console.log('❌ Não há titulares cadastrados! Cadastre um titular primeiro.');
            return;
        }
        
        this.listarTitulares(titulares);
        
        const numeroDoc = this.entrada.receberTexto('📄 Digite o número do documento do titular:');
        const titular = this.armazem.buscarClientePorDocumento(numeroDoc);
        
        if (!titular || !titular.ehTitular()) {
            console.log('❌ Titular não encontrado!');
            return;
        }
        
        const nome = this.entrada.receberTexto('📝 Nome completo do dependente:');
        const nomeSocial = this.entrada.receberTexto('🏷️  Nome social:');
        const dataNascimento = this.entrada.receberData('🎂 Data de nascimento');
        
        const dependente = new Cliente(nome, nomeSocial, dataNascimento);
        
        // Herda dados do titular
        if (titular.Endereco) {
            dependente.definirEndereco(titular.Endereco.clonar());
        }
        
        titular.Telefones.forEach(tel => {
            dependente.adicionarTelefone(tel.clonar());
        });
        
        // Cadastro de documentos
        this.cadastrarDocumentos(dependente);
        
        titular.adicionarDependente(dependente);
        this.armazem.adicionarCliente(dependente);
        
        console.log('\n✅ Dependente cadastrado com sucesso!');
    }

    private listarTitulares(titulares: Cliente[]): void {
        console.log('👥 TITULARES DISPONÍVEIS:');
        console.log('─'.repeat(50));
        titulares.forEach(titular => {
            console.log(`• ${titular.Nome}`);
            titular.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
            console.log('');
        });
    }

    private cadastrarDocumentos(cliente: Cliente): void {
        const menuDocs = new MenuDocumentos();
        let continuar = true;
        
        while (continuar) {
            menuDocs.exibir();
            const opcao = this.entrada.receberNumero('Escolha uma opção:');
            
            switch (opcao) {
                case 1:
                    this.adicionarDocumento(cliente, TipoDocumento.RG);
                    break;
                case 2:
                    this.adicionarDocumento(cliente, TipoDocumento.CPF);
                    break;
                case 3:
                    this.adicionarDocumento(cliente, TipoDocumento.Passaporte);
                    break;
                case 0:
                    continuar = false;
                    break;
                default:
                    console.log('❌ Opção inválida!');
            }
        }
    }

    private adicionarDocumento(cliente: Cliente, tipo: TipoDocumento): void {
        const numero = this.entrada.receberTexto(`Número do ${tipo}:`);
        const dataExpedicao = this.entrada.receberData('Data de expedição');
        cliente.adicionarDocumento(new Documento(numero, tipo, dataExpedicao));
        console.log(`✅ ${tipo} adicionado!`);
    }
}
