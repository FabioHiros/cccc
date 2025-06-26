import { OperacaoBase } from '../OperacaoBase';
import { ArmazemEstadias } from '../../../core/repositorios/ArmazemEstadias';
import { FormatadorEstadia } from '../../../apresentacao/formatadores/FormatadorEstadia';
import { MenuTipoAcomodacao } from '../../../apresentacao/menus/MenuTipoAcomodacao';
import { NomeAcomodacao } from '../../../core/enums/TipoAcomodacao';

export class ListarEstadiasPorTipo extends OperacaoBase {
    private armazem: ArmazemEstadias;
    private formatador: FormatadorEstadia;
    private menuTipoAcomodacao: MenuTipoAcomodacao;

    constructor() {
        super();
        this.armazem = ArmazemEstadias.InstanciaUnica;
        this.formatador = new FormatadorEstadia();
        this.menuTipoAcomodacao = new MenuTipoAcomodacao();
    }

    processar(): void {
        console.clear();
        console.log('🔍 ESTADIAS POR TIPO DE ACOMODAÇÃO');
        console.log('═'.repeat(50));

        this.menuTipoAcomodacao.exibir();
        const opcao = this.entrada.receberNumero('Escolha o tipo de acomodação:');

        const tipoAcomodacao = this.obterTipoAcomodacao(opcao);
        if (!tipoAcomodacao) {
            console.log('❌ Tipo de acomodação inválido!');
            return;
        }

        const estadias = this.armazem.obterEstadiasPorTipo(tipoAcomodacao);
        if (estadias.length === 0) {
            console.log(`📭 Nenhuma estadia encontrada para: ${tipoAcomodacao}`);
            return;
        }

        console.log(`\n🛏️  ESTADIAS - ${tipoAcomodacao.toUpperCase()}`);
        console.log('═'.repeat(50));

        estadias.forEach((estadia, index) => {
            console.log(`\n${index + 1}. ${this.formatador.formatar(estadia)}`);
        });

        console.log(`\n📊 Total: ${estadias.length} estadias`);
    }

    private obterTipoAcomodacao(opcao: number): string | null {
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