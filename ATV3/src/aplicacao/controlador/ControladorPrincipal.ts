import { OperacaoBase } from '../operacoes/OperacaoBase';
import { MenuPrincipal } from '../../apresentacao/menus/MenuPrincipal';
import { CadastrarDependente } from '../operacoes/cadastro/CadastrarDependente';
import { CadastrarTitular } from '../operacoes/cadastro/CadastrarTitular';
import { EditarCliente } from '../operacoes/edicao/EditarCliente';
import { ExcluirCliente } from '../operacoes/exclusao/ExcluirCliente';
import { BuscarTitularPorDependente } from '../operacoes/listagem/BuscarTitularPorDependente';
import { ListarDependentes } from '../operacoes/listagem/ListarDependentes';
import { ListarDependentesPorTitular } from '../operacoes/listagem/ListarDependentesPorTitular';
import { ListarTitulares } from '../operacoes/listagem/ListarTitulares';
import { GerenciarEstadias } from '../operacoes/estadias/GerenciarEstadias';

export class ControladorPrincipal extends OperacaoBase {
    constructor() {
        super();
        this.execucao = true;
        this.menu = new MenuPrincipal();
    }

    processar(): void {
        this.menu.exibir();
        this.opcao = this.entrada.receberNumero('🎯 Selecione uma opção:');
        
        switch (this.opcao) {
            case 1:
                this.operacao = new CadastrarTitular();
                this.operacao.processar();
                break;
            case 2:
                this.operacao = new CadastrarDependente();
                this.operacao.processar();
                break;
            case 3:
                this.operacao = new ListarTitulares();
                this.operacao.processar();
                break;
            case 4:
                this.operacao = new ListarDependentes();
                this.operacao.processar();
                break;
            case 5:
                this.operacao = new ListarDependentesPorTitular();
                this.operacao.processar();
                break;
            case 6:
                this.operacao = new BuscarTitularPorDependente();
                this.operacao.processar();
                break;
            case 7:
                this.operacao = new EditarCliente();
                this.operacao.processar();
                break;
            case 8:
                this.operacao = new ExcluirCliente();
                this.operacao.processar();
                break;
            case 9:
                this.operacao = new GerenciarEstadias();
                this.operacao.processar();
                break;
            case 0:
                this.execucao = false;
                console.log('\n🌊 Obrigado por usar o Atlantis Resort Manager! 🌊');
                console.log('Sistema encerrado com sucesso. Até logo! 👋');
                break;
            default:
                console.log('❌ Opção não reconhecida! Tente novamente.');
        }
    }
}