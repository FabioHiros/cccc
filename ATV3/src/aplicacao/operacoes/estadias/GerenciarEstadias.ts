import { OperacaoBase } from '../OperacaoBase';
import { MenuEstadias } from '../../../apresentacao/menus/MenuEstadias';
import { RegistrarEstadia } from './RegistrarEstadia';
import { RealizarCheckOut } from './RealizarCheckOut';
import { ListarEstadiasAtivas } from './ListarEstadiasAtivas';
import { ListarEstadiasFinalizadas } from './ListarEstadiasFinalizadas';
import { ListarEstadiasPorTipo } from './ListarEstadiasPorTipo';
import { ListarEstadiasPorCliente } from './ListarEstadiasPorCliente';
import { RelatorioOcupacao } from './RelatorioOcupacao';

export class GerenciarEstadias extends OperacaoBase {
    private menuEstadias: MenuEstadias;

    constructor() {
        super();
        this.menuEstadias = new MenuEstadias();
    }

    processar(): void {
        console.clear();
        console.log('🏨 GERENCIAMENTO DE ESTADIAS');
        console.log('═'.repeat(50));

        this.menuEstadias.exibir();
        const opcao = this.entrada.receberNumero('🎯 Selecione uma opção:');

        switch (opcao) {
            case 1:
                this.operacao = new RegistrarEstadia();
                this.operacao.processar();
                break;
            case 2:
                this.operacao = new RealizarCheckOut();
                this.operacao.processar();
                break;
            case 3:
                this.operacao = new ListarEstadiasAtivas();
                this.operacao.processar();
                break;
            case 4:
                this.operacao = new ListarEstadiasFinalizadas();
                this.operacao.processar();
                break;
            case 5:
                this.operacao = new ListarEstadiasPorTipo();
                this.operacao.processar();
                break;
            case 6:
                this.operacao = new ListarEstadiasPorCliente();
                this.operacao.processar();
                break;
            case 7:
                this.operacao = new RelatorioOcupacao();
                this.operacao.processar();
                break;
            case 0:
                break;
            default:
                console.log('❌ Opção inválida!');
        }
    }
}