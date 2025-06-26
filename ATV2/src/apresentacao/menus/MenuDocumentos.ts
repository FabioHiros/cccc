import { EstrategiaMenu } from './EstrategiaMenu';

export class MenuDocumentos implements EstrategiaMenu {
    exibir(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║              📄 CADASTRO DE DOCUMENTOS 📄                   ║');
        console.log('╠═════════════════════════════════════════════════════════════╣');
        console.log('║  ➤ [1] 🆔 Registro Geral (RG)                              ║');
        console.log('║  ➤ [2] 🏛️  Cadastro de Pessoa Física (CPF)                 ║');
        console.log('║  ➤ [3] ✈️  Passaporte Internacional                        ║');
        console.log('║  ➤ [0] ✅ Finalizar Cadastro de Documentos                 ║');
        console.log('╚═════════════════════════════════════════════════════════════╝');
    }
}