import { EstrategiaMenu } from './EstrategiaMenu';

export class MenuTipoAcomodacao implements EstrategiaMenu {
    exibir(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║            🛏️  TIPOS DE ACOMODAÇÃO DISPONÍVEIS 🛏️          ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  ➤ [1] 💑 Casal Simples                                  ║');
        console.log('║  ➤ [2] 👪 Família Simples                               ║');
        console.log('║  ➤ [3] 🏠 Família Mais                                  ║');
        console.log('║  ➤ [4] 🏰 Família Super                                 ║');
        console.log('║  ➤ [5] 🚶 Solteiro Simples                              ║');
        console.log('║  ➤ [6] 🛋️  Solteiro Mais                                ║');
        console.log('║  ➤ [0] ⬅️  Voltar                                       ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
    }
}