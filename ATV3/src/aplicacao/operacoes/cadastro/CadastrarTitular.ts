import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { Cliente } from '../../../core/entidades/Cliente';
import { Endereco } from '../../../core/entidades/Endereco';
import { Telefone } from '../../../core/entidades/Telefone';
import { Documento } from '../../../core/entidades/Documento';
import { TipoDocumento } from '../../../core/enums/TipoDocumento';
import { MenuDocumentos } from '../../../apresentacao/menus/MenuDocumentos';

export class CadastrarTitular extends OperacaoBase {
    private armazem: ArmazemDados;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
    }

    processar(): void {
        console.clear();
        console.log('🆕 CADASTRANDO CLIENTE PRINCIPAL');
        console.log('═'.repeat(50));
        
        const nome = this.entrada.receberTexto('📝 Nome completo:');
        const nomeSocial = this.entrada.receberTexto('🏷️  Nome social:');
        const dataNascimento = this.entrada.receberData('🎂 Data de nascimento');
        
        // Cadastro de endereço
        console.log('\n🏠 DADOS DO ENDEREÇO:');
        const rua = this.entrada.receberTexto('   Rua:');
        const bairro = this.entrada.receberTexto('   Bairro:');
        const cidade = this.entrada.receberTexto('   Cidade:');
        const estado = this.entrada.receberTexto('   Estado:');
        const pais = this.entrada.receberTexto('   País:');
        const cep = this.entrada.receberTexto('   CEP:');
        
        const endereco = new Endereco(rua, bairro, cidade, estado, pais, cep);
        const cliente = new Cliente(nome, nomeSocial, dataNascimento, endereco);
        
        // Cadastro de telefone
        console.log('\n📞 DADOS DO TELEFONE:');
        const ddd = this.entrada.receberTexto('   DDD:');
        const numeroTelefone = this.entrada.receberTexto('   Número:');
        cliente.adicionarTelefone(new Telefone(ddd, numeroTelefone));
        
        // Cadastro de documentos
        this.cadastrarDocumentos(cliente);
        
        this.armazem.adicionarCliente(cliente);
        console.log('\n✅ Cliente principal cadastrado com sucesso!');
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