import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { ArmazemEstadias } from '../../../core/repositorios/ArmazemEstadias';
import { MenuTipoAcomodacao } from '../../../apresentacao/menus/MenuTipoAcomodacao';
import { Estadia } from '../../../core/entidades/Estadia';
import { NomeAcomodacao } from '../../../core/enums/TipoAcomodacao';
import AcomodacaoFactory from '../../../core/factories/AcomodacaoFactory';

export class RegistrarEstadia extends OperacaoBase {
    private armazemClientes: ArmazemDados;
    private armazemEstadias: ArmazemEstadias;
    private menuTipoAcomodacao: MenuTipoAcomodacao;

    constructor() {
        super();
        this.armazemClientes = ArmazemDados.InstanciaUnica;
        this.armazemEstadias = ArmazemEstadias.InstanciaUnica;
        this.menuTipoAcomodacao = new MenuTipoAcomodacao();
    }

    processar(): void {
        console.clear();
        console.log('🛏️  REGISTRAR NOVA ESTADIA');
        console.log('═'.repeat(50));

        // Verificar se há clientes cadastrados
        const clientes = this.armazemClientes.Clientes;
        if (clientes.length === 0) {
            console.log('❌ Não há clientes cadastrados!');
            return;
        }

        // Selecionar cliente
        this.listarClientes();
        const numeroDoc = this.entrada.receberTexto('📄 Digite o número do documento do cliente:');
        const cliente = this.armazemClientes.buscarClientePorDocumento(numeroDoc);

        if (!cliente) {
            console.log('❌ Cliente não encontrado!');
            return;
        }

        // Verificar se cliente já possui estadia ativa
        const estadiaAtiva = this.armazemEstadias.obterEstadiaAtivaDoCliente(cliente);
        if (estadiaAtiva) {
            console.log('⚠️  Este cliente já possui uma estadia ativa!');
            console.log(`   Acomodação atual: ${estadiaAtiva.TipoAcomodacao}`);
            console.log(`   Check-in: ${estadiaAtiva.DataCheckIn.toLocaleDateString()}`);
            return;
        }

        // Selecionar tipo de acomodação
        this.menuTipoAcomodacao.exibir();
        const opcaoAcomodacao = this.entrada.receberNumero('Escolha o tipo de acomodação:');

        const tipoAcomodacao = this.obterTipoAcomodacao(opcaoAcomodacao);
        if (!tipoAcomodacao) {
            console.log('❌ Tipo de acomodação inválido!');
            return;
        }

      
        const acomodacao = AcomodacaoFactory.criarAcomodacao(tipoAcomodacao);
        if (!acomodacao) {
            console.log('❌ Erro ao criar acomodação!');
            return;
        }

        // Datas de entrada e saída prevista
        const dataEntrada = this.entrada.receberData('📅 Data de check-in');
        const dataSaidaPrevista = this.entrada.receberData('📅 Data prevista de check-out');

        if (dataSaidaPrevista <= dataEntrada) {
            console.log('❌ Data de saída deve ser posterior à data de entrada!');
            return;
        }

        // Criar e registrar a estadia
        const estadia = new Estadia(cliente, acomodacao, tipoAcomodacao, dataEntrada, dataSaidaPrevista);
        this.armazemEstadias.adicionarEstadia(estadia);

        // Exibir confirmação
        console.log('\n✅ Estadia registrada com sucesso!');
        console.log(`📊 Cliente: ${cliente.Nome}`);
        console.log(`🛏️  Acomodação: ${tipoAcomodacao}`);
        console.log(`🏨 Detalhes: ${acomodacao.getResumo()}`);
        console.log(`📅 Check-in: ${dataEntrada.toLocaleDateString()}`);
        console.log(`📅 Check-out previsto: ${dataSaidaPrevista.toLocaleDateString()}`);
    }

    private listarClientes(): void {
        console.log('👥 CLIENTES DISPONÍVEIS:');
        console.log('─'.repeat(30));
        this.armazemClientes.Clientes.forEach(cliente => {
            console.log(`• ${cliente.Nome}`);
            cliente.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
            console.log('');
        });
    }

    private obterTipoAcomodacao(opcao: number): NomeAcomodacao | null {
        switch (opcao) {
            case 1: return NomeAcomodacao.CASAL_SIMPLES;
            case 2: return NomeAcomodacao.FAMILIA_SIMPLES;
            case 3: return NomeAcomodacao.FAMILIA_MAIS;
            case 4: return NomeAcomodacao.FAMILIA_SUPER;
            case 5: return NomeAcomodacao.SOLTEIRO_SIMPLES;
            case 6: return NomeAcomodacao.SOLTEIRO_MAIS;
            default: return null;
        }
    }
}