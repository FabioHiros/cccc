import { OperacaoBase } from '../OperacaoBase';
import { ArmazemEstadias } from '../../../core/repositorios/ArmazemEstadias';

export class RelatorioOcupacao extends OperacaoBase {
    private armazem: ArmazemEstadias;

    constructor() {
        super();
        this.armazem = ArmazemEstadias.InstanciaUnica;
    }

    processar(): void {
        console.clear();
        console.log('📈 RELATÓRIO DE OCUPAÇÃO');
        console.log('═'.repeat(50));

        const estatisticas = this.armazem.obterEstatisticas();
        const estadiasAtivas = this.armazem.obterEstadiasAtivas();
      
        // Estatísticas gerais
        console.log('\n📊 ESTATÍSTICAS GERAIS:');
        console.log('─'.repeat(30));
        console.log(`🟢 Estadias Ativas: ${estatisticas.ativas}`);
        console.log(`🔴 Estadias Finalizadas: ${estatisticas.finalizadas}`);
        console.log(`📋 Total de Estadias: ${estatisticas.total}`);

        // Taxa de ocupação por tipo
        if (estadiasAtivas.length > 0) {
            console.log('\n🛏️  OCUPAÇÃO POR TIPO DE ACOMODAÇÃO:');
            console.log('─'.repeat(40));
            
            const ocupacaoPorTipo = this.calcularOcupacaoPorTipo(estadiasAtivas);
            for (const [tipo, quantidade] of ocupacaoPorTipo) {
                console.log(`• ${tipo}: ${quantidade} estadias`);
            }

            console.log('\n👥 HÓSPEDES ATIVOS:');
            console.log('─'.repeat(25));
            estadiasAtivas.forEach(estadia => {
                const diarias = estadia.calcularDiarias();
                console.log(`• ${estadia.Cliente.Nome} - ${estadia.TipoAcomodacao} (${diarias} diárias)`);
            });
        } else {
            console.log('\n📭 Nenhuma estadia ativa no momento.');
        }

        console.log('\n═'.repeat(5));
    }

    private calcularOcupacaoPorTipo(estadias: any[]): Map<string, number> {
        const contadores = new Map<string, number>();
        
        estadias.forEach(estadia => {
            const tipo = estadia.TipoAcomodacao;
            contadores.set(tipo, (contadores.get(tipo) || 0) + 1);
        });

        return contadores;
    }
}