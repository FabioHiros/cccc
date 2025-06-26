import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaMenu } from '../../../apresentacao/menus/EstrategiaMenu';
import { MenuTipoCliente } from '../../../apresentacao/menus/MenuTipoCliente';
import { ExcluirDependente } from './ExcluirDependente';
import { ExcluirTitular } from './ExcluirTitular';

export class ExcluirCliente extends OperacaoBase {
    private armazem: ArmazemDados;
    private menuTipo: EstrategiaMenu;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.menuTipo = new MenuTipoCliente();
    }

    processar(): void {
        console.clear();
        console.log('🗑️  EXCLUSÃO DE CLIENTE');
        console.log('═'.repeat(50));

        this.menuTipo.exibir();
        const opcao = this.entrada.receberNumero('Escolha o tipo de cliente:');

        switch (opcao) {
            case 1:
                this.operacao = new ExcluirTitular();
                this.operacao.processar();
                break;
            case 2:
                this.operacao = new ExcluirDependente();
                this.operacao.processar();
                break;
            case 0:
                break;
            default:
                console.log('❌ Opção inválida!');
        }
    }
}