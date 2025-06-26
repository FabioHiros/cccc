import { EstrategiaMenu } from './EstrategiaMenu';

export class MenuEstadias implements EstrategiaMenu {
    exibir(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║              🏨 GERENCIAMENTO DE ESTADIAS 🏨              ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  ➤ [1] 🛏️  Registrar Check-in                             ║');
        console.log('║  ➤ [2] 🏁 Realizar Check-out                             ║');
        console.log('║  ➤ [3] 📋 Listar Estadias Ativas                         ║');
        console.log('║  ➤ [4] 📊 Listar Estadias Finalizadas                    ║');
        console.log('║  ➤ [5] 🔍 Listar por Tipo de Acomodação                  ║');
        console.log('║  ➤ [6] 👤 Listar por Cliente                             ║');
        console.log('║  ➤ [7] 📈 Relatório de Ocupação                          ║');
        console.log('║  ➤ [0] ⬅️  Voltar ao Menu Principal                      ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
    }
}