import { ArmazemDados } from '../core/repositorios/ArmazemDados';
import { Cliente } from '../core/entidades/Cliente';
import { Endereco } from '../core/entidades/Endereco';
import { Telefone } from '../core/entidades/Telefone';
import { Documento } from '../core/entidades/Documento';
import { TipoDocumento } from '../core/enums/TipoDocumento';
import { FormatadorCliente } from '../apresentacao/formatadores/FormatadorCliente';

export class TestRunner {
    private armazem: ArmazemDados;
    private formatador: FormatadorCliente;
    private testsPassed: number = 0;
    private testsFailed: number = 0;

    constructor() {
        this.armazem = ArmazemDados.InstanciaUnica;
        this.formatador = new FormatadorCliente();
    }

    public executarTodosTestes(): void {
        console.clear();
        console.log('🧪 EXECUTANDO TESTES DO SISTEMA ATLANTIS');
        console.log('═'.repeat(60));

        // Limpar dados antes dos testes
        this.limparDados();

        // Executar todos os testes
        this.testarSingleton();
        this.testarCriacaoEntidades();
        this.testarCRUDTitular();
        this.testarCRUDDependente();
        this.testarRelacionamentoTitularDependente();
        this.testarListagemEspecifica();
        this.testarBuscaEspecifica();
        this.testarEdicaoClientes();
        this.testarExclusaoClientes();
        this.testarValidacoes();

        // Mostrar resultados finais
        this.mostrarResultados();
    }

    private limparDados(): void {
        // Como o Singleton não tem método para limpar, vamos acessar a lista diretamente
        console.log('🧹 Limpando dados de teste...');
        
        // Remover todos os clientes existentes
        const clientesExistentes = [...this.armazem.Clientes];
        clientesExistentes.forEach(cliente => {
            this.armazem.removerCliente(cliente);
        });
        
        console.log(`   ✅ ${clientesExistentes.length} clientes removidos`);
        console.log(`   📊 Clientes restantes: ${this.armazem.Clientes.length}`);
    }

    private testarSingleton(): void {
        console.log('\n📋 TESTE 1: Padrão Singleton');
        console.log('─'.repeat(40));

        try {
            const instancia1 = ArmazemDados.InstanciaUnica;
            const instancia2 = ArmazemDados.InstanciaUnica;
            
            this.assert(instancia1 === instancia2, 'Singleton deve retornar a mesma instância');
            this.assert(typeof instancia1 === 'object', 'Instância deve ser um objeto');
            
            console.log('✅ Singleton funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro no teste Singleton: ${error}`);
            this.testsFailed++;
        }
    }

    private testarCriacaoEntidades(): void {
        console.log('\n📋 TESTE 2: Criação de Entidades');
        console.log('─'.repeat(40));

        try {
            // Teste Endereco
            const endereco = new Endereco('Rua A', 'Bairro B', 'Cidade C', 'Estado D', 'País E', '12345-678');
            this.assert(endereco.Rua === 'Rua A', 'Endereço deve armazenar rua corretamente');
            this.assert(endereco.CEP === '12345-678', 'Endereço deve armazenar CEP corretamente');

            // Teste Telefone
            const telefone = new Telefone('11', '99999-9999');
            this.assert(telefone.DDD === '11', 'Telefone deve armazenar DDD corretamente');
            this.assert(telefone.Numero === '99999-9999', 'Telefone deve armazenar número corretamente');

            // Teste Documento
            const documento = new Documento('123456789', TipoDocumento.CPF, new Date());
            this.assert(documento.Numero === '123456789', 'Documento deve armazenar número corretamente');
            this.assert(documento.Tipo === TipoDocumento.CPF, 'Documento deve armazenar tipo corretamente');

            // Teste Cliente
            const cliente = new Cliente('João Silva', 'João', new Date('1990-01-01'), endereco);
            this.assert(cliente.Nome === 'João Silva', 'Cliente deve armazenar nome corretamente');
            this.assert(cliente.NomeSocial === 'João', 'Cliente deve armazenar nome social corretamente');
            this.assert(cliente.ehTitular() === true, 'Cliente sem titular deve ser considerado titular');

            console.log('✅ Todas as entidades criadas corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro na criação de entidades: ${error}`);
            this.testsFailed++;
        }
    }

    private testarCRUDTitular(): void {
        console.log('\n📋 TESTE 3: CRUD Titular');
        console.log('─'.repeat(40));

        try {
            // CREATE
            const endereco = new Endereco('Rua Principal', 'Centro', 'São Paulo', 'SP', 'Brasil', '01000-000');
            const titular = new Cliente('Maria Santos', 'Maria', new Date('1985-05-15'), endereco);
            
            titular.adicionarTelefone(new Telefone('11', '98765-4321'));
            titular.adicionarDocumento(new Documento('12345678901', TipoDocumento.CPF, new Date()));
            
            // Debug: Verificar documento antes de adicionar
            console.log(`   🔍 Documento adicionado: ${titular.Documentos[0].Numero}`);
            
            this.armazem.adicionarCliente(titular);

            // READ
            const titulares = this.armazem.obterTitulares();
            this.assert(titulares.length >= 1, 'Deve ter pelo menos 1 titular');
            
            // Debug: Mostrar todos os clientes no armazém
            console.log(`   🔍 Total de clientes no armazém: ${this.armazem.Clientes.length}`);
            console.log(`   🔍 Total de titulares: ${titulares.length}`);
            
            const titularEncontrado = this.armazem.buscarClientePorDocumento('12345678901');
            
            // Debug adicional
            if (!titularEncontrado) {
                console.log('   🔍 Cliente não encontrado, listando todos os documentos:');
                this.armazem.Clientes.forEach((cliente, index) => {
                    console.log(`     ${index + 1}. ${cliente.Nome}`);
                    cliente.Documentos.forEach(doc => {
                        console.log(`        - ${doc.Tipo}: ${doc.Numero}`);
                    });
                });
            }
            
            this.assert(titularEncontrado !== undefined, 'Deve encontrar titular por documento');
            this.assert(titularEncontrado?.Nome === 'Maria Santos', `Deve encontrar titular correto. Encontrado: ${titularEncontrado?.Nome}`);

            // UPDATE
            titularEncontrado?.definirNome('Maria Santos Silva');
            this.assert(titularEncontrado?.Nome === 'Maria Santos Silva', 'Deve atualizar nome');

            // DELETE será testado em função específica

            console.log('✅ CRUD Titular funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro no CRUD Titular: ${error}`);
            this.testsFailed++;
        }
    }

    private testarCRUDDependente(): void {
        console.log('\n📋 TESTE 4: CRUD Dependente');
        console.log('─'.repeat(40));

        try {
            // Primeiro, garantir que temos um titular
            const titulares = this.armazem.obterTitulares();
            this.assert(titulares.length > 0, 'Deve existir pelo menos um titular para teste');
            
            const titular = titulares[0];

            // CREATE Dependente
            const dependente = new Cliente('João Santos', 'Joãozinho', new Date('2010-03-20'));
            dependente.adicionarDocumento(new Documento('98765432101', TipoDocumento.RG, new Date()));
            
            // Herdar dados do titular
            if (titular.Endereco) {
                dependente.definirEndereco(titular.Endereco.clonar());
            }
            titular.Telefones.forEach(tel => {
                dependente.adicionarTelefone(tel.clonar());
            });

            titular.adicionarDependente(dependente);
            this.armazem.adicionarCliente(dependente);

            // READ
            const dependentes = this.armazem.obterDependentes();
            this.assert(dependentes.length >= 1, 'Deve ter pelo menos 1 dependente');
            
            const dependenteEncontrado = this.armazem.buscarClientePorDocumento('98765432101');
            this.assert(dependenteEncontrado !== undefined, 'Deve encontrar dependente por documento');
            this.assert(dependenteEncontrado?.ehTitular() === false, 'Dependente não deve ser titular');
            this.assert(dependenteEncontrado?.Titular === titular, 'Dependente deve ter titular correto');

            // UPDATE
            dependenteEncontrado?.definirNome('João Santos Junior');
            this.assert(dependenteEncontrado?.Nome === 'João Santos Junior', 'Deve atualizar nome do dependente');

            console.log('✅ CRUD Dependente funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro no CRUD Dependente: ${error}`);
            this.testsFailed++;
        }
    }

    private testarRelacionamentoTitularDependente(): void {
        console.log('\n📋 TESTE 5: Relacionamento Titular-Dependente');
        console.log('─'.repeat(40));

        try {
            const titulares = this.armazem.obterTitulares();
            this.assert(titulares.length > 0, 'Deve existir titular para teste');
            
            const titular = titulares[0];
            const dependentesDoTitular = titular.Dependentes;

            this.assert(dependentesDoTitular.length > 0, 'Titular deve ter dependentes');
            
            const dependente = dependentesDoTitular[0];
            this.assert(dependente.Titular === titular, 'Dependente deve referenciar titular');
            this.assert(dependente.ehTitular() === false, 'Dependente não deve ser titular');

            // Testar herança de dados
            this.assert(dependente.Endereco?.Rua === titular.Endereco?.Rua, 'Dependente deve herdar endereço');
            this.assert(dependente.Telefones.length > 0, 'Dependente deve herdar telefones');

            console.log('✅ Relacionamento Titular-Dependente funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro no relacionamento: ${error}`);
            this.testsFailed++;
        }
    }

    private testarListagemEspecifica(): void {
        console.log('\n📋 TESTE 6: Listagem Dependentes por Titular');
        console.log('─'.repeat(40));

        try {
            const titulares = this.armazem.obterTitulares();
            this.assert(titulares.length > 0, 'Deve existir titular');
            
            const titular = titulares[0];
            const dependentesDoTitular = titular.Dependentes;
            
            // Verificar se a funcionalidade específica do PDF funciona
            this.assert(dependentesDoTitular.length > 0, 'Titular deve ter dependentes para teste');
            
            // Simular busca por documento do titular
            const titularEncontrado = this.armazem.buscarClientePorDocumento(titular.Documentos[0].Numero);
            this.assert(titularEncontrado === titular, 'Deve encontrar titular por documento');
            this.assert(titularEncontrado?.Dependentes.length === dependentesDoTitular.length, 'Deve retornar mesmo número de dependentes');

            console.log('✅ Listagem específica funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro na listagem específica: ${error}`);
            this.testsFailed++;
        }
    }

    private testarBuscaEspecifica(): void {
        console.log('\n📋 TESTE 7: Busca Titular por Dependente');
        console.log('─'.repeat(40));

        try {
            const dependentes = this.armazem.obterDependentes();
            this.assert(dependentes.length > 0, 'Deve existir dependente');
            
            const dependente = dependentes[0];
            const titularDoDependente = dependente.Titular;
            
            this.assert(titularDoDependente !== undefined, 'Dependente deve ter titular');
            
            // Simular busca por documento do dependente
            const dependenteEncontrado = this.armazem.buscarClientePorDocumento(dependente.Documentos[0].Numero);
            this.assert(dependenteEncontrado === dependente, 'Deve encontrar dependente por documento');
            this.assert(dependenteEncontrado?.Titular === titularDoDependente, 'Deve retornar titular correto');

            console.log('✅ Busca específica funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro na busca específica: ${error}`);
            this.testsFailed++;
        }
    }

    private testarEdicaoClientes(): void {
        console.log('\n📋 TESTE 8: Edição de Clientes');
        console.log('─'.repeat(40));

        try {
            const titulares = this.armazem.obterTitulares();
            const titular = titulares[0];
            
            // Testar edição de titular
            const nomeOriginal = titular.Nome;
            titular.definirNome('Nome Editado');
            this.assert(titular.Nome === 'Nome Editado', 'Deve editar nome do titular');
            
            // Testar edição de telefone
            if (titular.Telefones.length > 0) {
                const telefoneOriginal = titular.Telefones[0].Numero;
                titular.Telefones[0].definirNumero('11111-1111');
                this.assert(titular.Telefones[0].Numero === '11111-1111', 'Deve editar telefone');
            }

            // Testar edição de dependente
            const dependentes = this.armazem.obterDependentes();
            if (dependentes.length > 0) {
                const dependente = dependentes[0];
                dependente.definirNomeSocial('Apelido Novo');
                this.assert(dependente.NomeSocial === 'Apelido Novo', 'Deve editar nome social do dependente');
            }

            console.log('✅ Edição de clientes funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro na edição: ${error}`);
            this.testsFailed++;
        }
    }

    private testarExclusaoClientes(): void {
        console.log('\n📋 TESTE 9: Exclusão de Clientes');
        console.log('─'.repeat(40));

        try {
            // Criar cliente temporário para exclusão
            const clienteTemp = new Cliente('Temp Cliente', 'Temp', new Date());
            clienteTemp.adicionarDocumento(new Documento('TEMP123', TipoDocumento.RG, new Date()));
            this.armazem.adicionarCliente(clienteTemp);
            
            const clientesAntes = this.armazem.obterTitulares().length;
            
            // Excluir cliente
            this.armazem.removerCliente(clienteTemp);
            
            const clientesDepois = this.armazem.obterTitulares().length;
            this.assert(clientesDepois === clientesAntes - 1, 'Deve remover cliente');
            
            // Verificar se não consegue mais encontrar
            const clienteRemovido = this.armazem.buscarClientePorDocumento('TEMP123');
            this.assert(clienteRemovido === undefined, 'Cliente removido não deve ser encontrado');

            console.log('✅ Exclusão de clientes funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro na exclusão: ${error}`);
            this.testsFailed++;
        }
    }

    private testarValidacoes(): void {
        console.log('\n📋 TESTE 10: Validações e Edge Cases');
        console.log('─'.repeat(40));

        try {
            // Testar busca com documento inexistente
            const clienteInexistente = this.armazem.buscarClientePorDocumento('INEXISTENTE');
            this.assert(clienteInexistente === undefined, 'Busca por documento inexistente deve retornar undefined');
            
            // Testar clonagem de objetos
            const endereco = new Endereco('Rua', 'Bairro', 'Cidade', 'Estado', 'País', 'CEP');
            const enderecoClonado = endereco.clonar();
            this.assert(endereco !== enderecoClonado, 'Clonagem deve criar objeto diferente');
            this.assert(endereco.Rua === enderecoClonado.Rua, 'Clonagem deve copiar dados');

            const telefone = new Telefone('11', '99999-9999');
            const telefoneClonado = telefone.clonar();
            this.assert(telefone !== telefoneClonado, 'Clonagem de telefone deve criar objeto diferente');
            this.assert(telefone.DDD === telefoneClonado.DDD, 'Clonagem deve copiar DDD');

            // Testar formatação
            const cliente = new Cliente('Teste', 'Teste', new Date());
            const textoFormatado = this.formatador.formatar(cliente);
            this.assert(textoFormatado.includes('Teste'), 'Formatação deve incluir nome do cliente');
            this.assert(textoFormatado.includes('PERFIL DO CLIENTE'), 'Formatação deve incluir cabeçalho');

            console.log('✅ Validações funcionando corretamente');
            this.testsPassed++;
        } catch (error) {
            console.log(`❌ Erro nas validações: ${error}`);
            this.testsFailed++;
        }
    }

    private mostrarResultados(): void {
        console.log('\n' + '═'.repeat(60));
        console.log('📊 RELATÓRIO FINAL DOS TESTES');
        console.log('═'.repeat(60));
        
        const totalTestes = this.testsPassed + this.testsFailed;
        const percentualSucesso = totalTestes > 0 ? (this.testsPassed / totalTestes * 100).toFixed(1) : 0;
        
        console.log(`✅ Testes Aprovados: ${this.testsPassed}`);
        console.log(`❌ Testes Falharam: ${this.testsFailed}`);
        console.log(`📈 Taxa de Sucesso: ${percentualSucesso}%`);
        
        if (this.testsFailed === 0) {
            console.log('\n🎉 TODOS OS TESTES PASSARAM! SISTEMA FUNCIONANDO PERFEITAMENTE!');
            console.log('✅ Padrão Singleton implementado corretamente');
            console.log('✅ Padrão Strategy implementado corretamente');
            console.log('✅ CRUD completo funcionando');
            console.log('✅ Relacionamentos Titular-Dependente funcionando');
            console.log('✅ Requisitos do PDF atendidos');
        } else {
            console.log('\n⚠️  ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
        }
        
        console.log('═'.repeat(60));
    }

    private mostrarDadosCarregados(): void {
        console.log('\n📋 DADOS CARREGADOS NO SISTEMA:');
        console.log('─'.repeat(40));
        
        const titulares = this.armazem.obterTitulares();
        const dependentes = this.armazem.obterDependentes();
        
        console.log(`👥 Titulares: ${titulares.length}`);
        titulares.forEach((titular, index) => {
            console.log(`  ${index + 1}. ${titular.Nome} (${titular.Dependentes.length} dependentes)`);
        });
        
        console.log(`👶 Dependentes: ${dependentes.length}`);
        dependentes.forEach((dependente, index) => {
            console.log(`  ${index + 1}. ${dependente.Nome} (titular: ${dependente.Titular?.Nome})`);
        });
    }

    private assert(condition: boolean, message: string): void {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }
}
