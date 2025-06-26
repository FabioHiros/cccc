import { OperacaoBase } from './aplicacao/operacoes/OperacaoBase';
import { ControladorPrincipal } from './aplicacao/controlador/ControladorPrincipal';
import { ColetorEntrada } from './apresentacao/entrada/ColetorEntrada';

console.clear();
console.log('🌊 Bem-vindo ao Atlantis Resort Manager! 🌊');
console.log('Sistema premium de gestão para resorts, clubes e hotéis');

let controlador: OperacaoBase;
let sistemaAtivo = true;

while (sistemaAtivo) {
    controlador = new ControladorPrincipal();
    controlador.processar();
    sistemaAtivo = controlador.Execucao;
    
    if (sistemaAtivo) {
        const entrada = new ColetorEntrada();
        entrada.receberTexto('\n⏸️  Pressione ENTER para continuar...');
        console.clear();
    }
}