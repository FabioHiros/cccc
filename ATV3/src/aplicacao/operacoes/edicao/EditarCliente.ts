import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { EstrategiaMenu } from '../../../apresentacao/menus/EstrategiaMenu';
import { MenuTipoCliente } from '../../../apresentacao/menus/MenuTipoCliente';
import { EditarDependente } from './EditarDependente';
import { EditarTitular } from './EditarTitular';

export class EditarCliente extends OperacaoBase {
    private armazem: ArmazemDados;
    private menuTipo: EstrategiaMenu;

    constructor() {
        super();
        this.armazem = ArmazemDados.InstanciaUnica;
        this.menuTipo = new MenuTipoCliente();
    }

    processar(): void {
        console.clear();
        console.log('✏️  EDIÇÃO DE CLIENTE');
        console.log('═'.repeat(50));

        this.menuTipo.exibir();
        const opcao = this.entrada.receberNumero('Escolha o tipo de cliente:');

        switch (opcao) {
            case 1:
                this.operacao = new EditarTitular();
                this.operacao.processar();
                break;
            case 2:
                this.operacao = new EditarDependente();
                this.operacao.processar();
                break;
            case 0:
                break;
            default:
                console.log('❌ Opção inválida!');
        }
    }
}