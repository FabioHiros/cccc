import { EstrategiaMenu } from '../../apresentacao/menus/EstrategiaMenu';
import { ColetorEntrada } from '../../apresentacao/entrada/ColetorEntrada';

export abstract class OperacaoBase {
    protected opcao!: number;
    protected menu!: EstrategiaMenu;
    protected entrada = new ColetorEntrada();
    protected operacao!: OperacaoBase;
    protected execucao!: boolean;

    public get Execucao(): boolean {
        return this.execucao;
    }

    abstract processar(): void;
}