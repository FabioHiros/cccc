import { EstrategiaMenu } from './EstrategiaMenu';

export class MenuTipoCliente implements EstrategiaMenu {
    exibir(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║              👥 SELEÇÃO DE TIPO DE CLIENTE 👥              ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  ➤ [1] 👤 Cliente Principal (Titular)                    ║');
        console.log('║  ➤ [2] 👶 Cliente Dependente                             ║');
        console.log('║  ➤ [0] ⬅️  Voltar ao Menu Principal                      ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
    }
}