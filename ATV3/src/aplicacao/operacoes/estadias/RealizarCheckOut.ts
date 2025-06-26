import { OperacaoBase } from '../OperacaoBase';
import { ArmazemEstadias } from '../../../core/repositorios/ArmazemEstadias';
import { FormatadorEstadia } from '../../../apresentacao/formatadores/FormatadorEstadia';

export class RealizarCheckOut extends OperacaoBase {
    private armazem: ArmazemEstadias;
    private formatador: FormatadorEstadia;

    constructor() {
        super();
        this.armazem = ArmazemEstadias.InstanciaUnica;
        this.formatador = new FormatadorEstadia();
    }

    processar(): void {
        console.clear();
        console.log('🏁 REALIZAR CHECK-OUT');
        console.log('═'.repeat(50));

        const estadiasAtivas = this.armazem.obterEstadiasAtivas();
        if (estadiasAtivas.length === 0) {
            console.log('📭 Nenhuma estadia ativa para check-out.');
            return;
        }

        console.log('🟢 ESTADIAS ATIVAS:');
        console.log('─'.repeat(30));
        estadiasAtivas.forEach((estadia, index) => {
            const diarias = estadia.calcularDiarias();
            console.log(`${index + 1}. ${estadia.Cliente.Nome} - ${estadia.TipoAcomodacao}`);
            console.log(`   Check-in: ${estadia.DataCheckIn.toLocaleDateString()}`);
            console.log(`   Diárias: ${diarias} dia(s)`);
            console.log('');
        });

        const indice = this.entrada.receberNumero('Digite o número da estadia para check-out:') - 1;
        if (indice < 0 || indice >= estadiasAtivas.length) {
            console.log('❌ Estadia não encontrada!');
            return;
        }

        const estadiaSelecionada = estadiasAtivas[indice];
        
        console.log('\n📋 ESTADIA SELECIONADA:');
        console.log(this.formatador.formatar(estadiaSelecionada));

        const confirmacao = this.entrada.receberTexto('\n❓ Confirma o check-out? (S/N):');
        if (confirmacao.toUpperCase() !== 'S') {
            console.log('❌ Operação cancelada.');
            return;
        }

        // Realizar check-out
        this.armazem.realizarCheckOut(estadiaSelecionada);
        
        const totalDiarias = estadiaSelecionada.calcularDiarias();
        console.log('✅ Check-out realizado com sucesso!');
        console.log(`👋 Hóspede: ${estadiaSelecionada.Cliente.Nome}`);
        console.log(`📊 Total de diárias: ${totalDiarias} dia(s)`);
        console.log(`📅 Período: ${estadiaSelecionada.DataCheckIn.toLocaleDateString()} a ${estadiaSelecionada.DataCheckOut?.toLocaleDateString()}`);
    }
}