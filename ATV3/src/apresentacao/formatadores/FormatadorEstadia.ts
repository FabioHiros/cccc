import { Estadia } from '../../core/entidades/Estadia';

export class FormatadorEstadia {
    formatar(estadia: Estadia): string {
        const status = estadia.estaAtiva() ? '🟢 ATIVA' : '🔴 FINALIZADA';
        const diarias = estadia.calcularDiarias();
        
        let info = `\n╔─ ESTADIA ────────────────────────────────────────────╗\n`;
        info += `║ 👤 Hóspede: ${estadia.Cliente.Nome}\n`;
        info += `║ 🛏️  Acomodação: ${estadia.TipoAcomodacao}\n`;
        info += `║ 📊 Status: ${status}\n`;
        info += `║ 📅 Check-in: ${estadia.DataCheckIn.toLocaleDateString()}\n`;
        
        if (estadia.DataCheckOut) {
            info += `║ 📅 Check-out: ${estadia.DataCheckOut.toLocaleDateString()}\n`;
        } else {
            info += `║ 📅 Check-out previsto: ${estadia.DataPrevisaoSaida.toLocaleDateString()}\n`;
        }
        
        info += `║ 🗓️  Diárias: ${diarias} dia(s)\n`;
        info += `║ 🏨 Detalhes: ${estadia.Acomodacao.getResumo()}\n`;
        info += `╚═════════════════════════════════════════════════════╝`;
        
        return info;
    }
}