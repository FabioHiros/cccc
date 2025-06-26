import { ArmazemDados } from '../core/repositorios/ArmazemDados';
import { Cliente } from '../core/entidades/Cliente';
import { Endereco } from '../core/entidades/Endereco';
import { Telefone } from '../core/entidades/Telefone';
import { Documento } from '../core/entidades/Documento';
import { TipoDocumento } from '../core/enums/TipoDocumento';

export class TestData {
    private armazem: ArmazemDados;

    constructor() {
        this.armazem = ArmazemDados.InstanciaUnica;
    }

    public carregarDadosDeTest(): void {
        console.log('📥 Carregando dados de teste...');
        
        // Criar dados de teste
        this.criarTitularComDependentes();
        this.criarTitularSemDependentes();
        this.criarTitularComMultiplosDependentes();
        
        console.log('✅ Dados de teste carregados com sucesso!');
    }

    private criarTitularComDependentes(): void {
        // Titular 1: João Silva
        const enderecoJoao = new Endereco('Rua das Flores, 123', 'Jardim Paulista', 'São Paulo', 'SP', 'Brasil', '01310-100');
        const joao = new Cliente('João Silva', 'João', new Date('1980-05-15'), enderecoJoao);
        
        joao.adicionarTelefone(new Telefone('11', '99999-1111'));
        joao.adicionarTelefone(new Telefone('11', '3333-1111'));
        joao.adicionarDocumento(new Documento('12345678901', TipoDocumento.CPF, new Date('2010-01-15')));
        joao.adicionarDocumento(new Documento('MG1234567', TipoDocumento.RG, new Date('2010-01-20')));
        
        // Dependente 1: Maria Silva
        const maria = new Cliente('Maria Silva', 'Maria', new Date('1985-08-20'));
        maria.definirEndereco(enderecoJoao.clonar());
        joao.Telefones.forEach(tel => maria.adicionarTelefone(tel.clonar()));
        maria.adicionarDocumento(new Documento('98765432101', TipoDocumento.CPF, new Date('2015-03-10')));
        maria.adicionarDocumento(new Documento('SP9876543', TipoDocumento.RG, new Date('2015-03-15')));
        
        // Dependente 2: Pedro Silva
        const pedro = new Cliente('Pedro Silva', 'Pedrinho', new Date('2010-12-10'));
        pedro.definirEndereco(enderecoJoao.clonar());
        joao.Telefones.forEach(tel => pedro.adicionarTelefone(tel.clonar()));
        pedro.adicionarDocumento(new Documento('11111111111', TipoDocumento.CPF, new Date('2020-05-01')));
        pedro.adicionarDocumento(new Documento('SP1111111', TipoDocumento.RG, new Date('2020-05-05')));
        
        joao.adicionarDependente(maria);
        joao.adicionarDependente(pedro);
        
        this.armazem.adicionarCliente(joao);
        this.armazem.adicionarCliente(maria);
        this.armazem.adicionarCliente(pedro);
    }

    private criarTitularSemDependentes(): void {
        // Titular 2: Ana Costa (sem dependentes)
        const enderecoAna = new Endereco('Av. Paulista, 1000', 'Bela Vista', 'São Paulo', 'SP', 'Brasil', '01310-000');
        const ana = new Cliente('Ana Costa', 'Ana', new Date('1975-11-30'), enderecoAna);
        
        ana.adicionarTelefone(new Telefone('11', '88888-2222'));
        ana.adicionarDocumento(new Documento('22222222222', TipoDocumento.CPF, new Date('2008-06-10')));
        ana.adicionarDocumento(new Documento('RJ2222222', TipoDocumento.RG, new Date('2008-06-15')));
        ana.adicionarDocumento(new Documento('AA123456', TipoDocumento.Passaporte, new Date('2018-01-10')));
        
        this.armazem.adicionarCliente(ana);
    }

    private criarTitularComMultiplosDependentes(): void {
        // Titular 3: Carlos Oliveira
        const enderecoCarlos = new Endereco('Rua Augusta, 500', 'Consolação', 'São Paulo', 'SP', 'Brasil', '01305-000');
        const carlos = new Cliente('Carlos Oliveira', 'Carlos', new Date('1970-03-25'), enderecoCarlos);
        
        carlos.adicionarTelefone(new Telefone('11', '77777-3333'));
        carlos.adicionarDocumento(new Documento('33333333333', TipoDocumento.CPF, new Date('2005-09-20')));
        carlos.adicionarDocumento(new Documento('SP3333333', TipoDocumento.RG, new Date('2005-09-25')));
        
        // Múltiplos dependentes
        const dependentes = [
            { nome: 'Laura Oliveira', nomeSocial: 'Laura', nascimento: new Date('2000-01-15'), cpf: '44444444444', rg: 'SP4444444' },
            { nome: 'Bruno Oliveira', nomeSocial: 'Bruno', nascimento: new Date('2005-07-08'), cpf: '55555555555', rg: 'SP5555555' },
            { nome: 'Carla Oliveira', nomeSocial: 'Carla', nascimento: new Date('2008-11-12'), cpf: '66666666666', rg: 'SP6666666' }
        ];
        
        dependentes.forEach(depData => {
            const dependente = new Cliente(depData.nome, depData.nomeSocial, depData.nascimento);
            dependente.definirEndereco(enderecoCarlos.clonar());
            carlos.Telefones.forEach(tel => dependente.adicionarTelefone(tel.clonar()));
            dependente.adicionarDocumento(new Documento(depData.cpf, TipoDocumento.CPF, new Date()));
            dependente.adicionarDocumento(new Documento(depData.rg, TipoDocumento.RG, new Date()));
            
            carlos.adicionarDependente(dependente);
            this.armazem.adicionarCliente(dependente);
        });
        
        this.armazem.adicionarCliente(carlos);
    }

    public mostrarEstatisticas(): void {
        const titulares = this.armazem.obterTitulares();
        const dependentes = this.armazem.obterDependentes();
        
        console.log('\n📊 ESTATÍSTICAS DOS DADOS DE TESTE:');
        console.log('─'.repeat(50));
        console.log(`👥 Total de Titulares: ${titulares.length}`);
        console.log(`👶 Total de Dependentes: ${dependentes.length}`);
        console.log(`📋 Total de Clientes: ${titulares.length + dependentes.length}`);
        
        let totalDocumentos = 0;
        let totalTelefones = 0;
        
        [...titulares, ...dependentes].forEach(cliente => {
            totalDocumentos += cliente.Documentos.length;
            totalTelefones += cliente.Telefones.length;
        });
        
        console.log(`📄 Total de Documentos: ${totalDocumentos}`);
        console.log(`📞 Total de Telefones: ${totalTelefones}`);
        
        // Estatísticas por titular
        console.log('\n👥 DETALHES POR TITULAR:');
        titulares.forEach((titular, index) => {
            console.log(`${index + 1}. ${titular.Nome} - ${titular.Dependentes.length} dependente(s)`);
        });
    }
}