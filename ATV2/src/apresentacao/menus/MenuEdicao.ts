import { EstrategiaMenu } from './EstrategiaMenu';

export class MenuEdicao implements EstrategiaMenu {
    exibir(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                ✏️  OPÇÕES DE EDIÇÃO ✏️                    ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  ➤ [1] 📝 Nome                                           ║');
        console.log('║  ➤ [2] 🏷️  Nome Social                                    ║');
        console.log('║  ➤ [3] 🎂 Data de Nascimento                             ║');
        console.log('║  ➤ [4] 📞 Telefones                                      ║');
        console.log('║  ➤ [5] 🏠 Endereço                                       ║');
        console.log('║  ➤ [6] 📄 Documentos                                     ║');
        console.log('║  ➤ [0] ✅ Finalizar Edição                               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
    }
}