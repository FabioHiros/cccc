import { OperacaoBase } from '../OperacaoBase';
import { ArmazemDados } from '../../../core/repositorios/ArmazemDados';
import { ArmazemEstadias } from '../../../core/repositorios/ArmazemEstadias';
import { FormatadorEstadia } from '../../../apresentacao/formatadores/FormatadorEstadia';
import { Cliente } from '../../../core/entidades/Cliente';

export class ListarEstadiasPorCliente extends OperacaoBase {
    private armazemClientes: ArmazemDados;
    private armazemEstadias: ArmazemEstadias;
    private formatador: FormatadorEstadia;

    constructor() {
        super();
        this.armazemClientes = ArmazemDados.InstanciaUnica;
        this.armazemEstadias = ArmazemEstadias.InstanciaUnica;
        this.formatador = new FormatadorEstadia();
    }

    processar(): void {
        console.clear();
        console.log('👤 ESTADIAS POR CLIENTE');
        console.log('═'.repeat(50));

        const clientes = this.armazemClientes.Clientes;
        if (clientes.length === 0) {
            console.log('❌ Não há clientes cadastrados!');
            return;
        }

        this.listarClientes(clientes);

        const numeroDoc = this.entrada.receberTexto('📄 Digite o número do documento do cliente:');
        const cliente = this.armazemClientes.buscarClientePorDocumento(numeroDoc);

        if (!cliente) {
            console.log('❌ Cliente não encontrado!');
            return;
        }

        const estadias = this.armazemEstadias.obterEstadiasPorCliente(cliente);
        if (estadias.length === 0) {
            console.log(`📭 Nenhuma estadia encontrada para: ${cliente.Nome}`);
            return;
        }

        console.log(`\n👤 ESTADIAS DE ${cliente.Nome.toUpperCase()}`);
        console.log('═'.repeat(50));

        estadias.forEach((estadia, index) => {
            console.log(`\n${index + 1}. ${this.formatador.formatar(estadia)}`);
        });

        console.log(`\n📊 Total: ${estadias.length} estadias`);
    }

    private listarClientes(clientes: Cliente[]): void {
        console.log('👥 CLIENTES DISPONÍVEIS:');
        console.log('─'.repeat(30));
        clientes.forEach(cliente => {
            console.log(`• ${cliente.Nome}`);
            cliente.Documentos.forEach(doc => {
                console.log(`  ${doc.Tipo}: ${doc.Numero}`);
            });
            console.log('');
        });
    }
}