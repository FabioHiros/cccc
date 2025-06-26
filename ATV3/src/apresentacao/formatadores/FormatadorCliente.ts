import { EstrategiaFormatacao } from './EstrategiaFormatacao';
import { Cliente } from '../../core/entidades/Cliente';

export class FormatadorCliente implements EstrategiaFormatacao {
    formatar(cliente: Cliente): string {
        let info = `\n╔─ PERFIL DO CLIENTE ─────────────────────────────────────────╗\n`;
        info += `║ 👤 Nome: ${cliente.Nome}\n`;
        info += `║ 🏷️  Nome Social: ${cliente.NomeSocial}\n`;
        info += `║ 🎂 Nascimento: ${cliente.DataNascimento.toLocaleDateString()}\n`;
        info += `║ 📅 Cadastro: ${cliente.DataCadastro.toLocaleDateString()}\n`;
        
        if (cliente.Endereco) {
            info += `║ 🏠 Endereço: ${cliente.Endereco.Rua}, ${cliente.Endereco.Cidade}\n`;
        }
        
        if (cliente.Titular) {
            info += `║ 👨‍👩‍👧‍👦 Titular: ${cliente.Titular.Nome}\n`;
        }
        
        info += `║ 📄 Documentos:\n`;
        cliente.Documentos.forEach(doc => {
            info += `║    • ${doc.Tipo}: ${doc.Numero}\n`;
        });
        
        info += `║ 📞 Telefones:\n`;
        cliente.Telefones.forEach(tel => {
            info += `║    • (${tel.DDD}) ${tel.Numero}\n`;
        });
        
        if (cliente.Dependentes.length > 0) {
            info += `║ 👥 Dependentes: ${cliente.Dependentes.length}\n`;
        }
        
        info += `╚═════════════════════════════════════════════════════════════╝`;
        return info;
    }
}