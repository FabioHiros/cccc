import { EstrategiaMenu } from './EstrategiaMenu';

export class MenuPrincipal implements EstrategiaMenu {
    exibir(): void {
        console.log('═'.repeat(70));
        console.log('    🌊  A T L A N T I S   R E S O R T   M A N A G E R  🌊');
        console.log('                Sistema de Gerenciamento Premium');
        console.log('═'.repeat(70));
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║                        PAINEL DE CONTROLE                        ║');
        console.log('╠══════════════════════════════════════════════════════════════════╣');
        console.log('║  [1] 🆕 Cadastrar Cliente Principal                             ║');
        console.log('║  [2] 👨‍👩‍👧‍👦 Cadastrar Cliente Dependente                           ║');
        console.log('║  [3] 📋 Listar Clientes Principais                              ║');
        console.log('║  [4] 👶 Listar Todos os Dependentes                             ║');
        console.log('║  [5] 🔍 Listar Dependentes por Principal                        ║');
        console.log('║  [6] 🔎 Buscar Principal de Dependente                          ║');
        console.log('║  [7] ✏️  Editar Cliente                                         ║');
        console.log('║  [8] 🗑️  Excluir Cliente                                        ║');
        console.log('║  [0] 🚪 Sair do Sistema                                          ║');
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log('═'.repeat(70));
    }
}