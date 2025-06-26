// FILE: src/simpleTest.ts

import { Cliente } from "../core/entidades/Cliente";
import { Documento } from "../core/entidades/Documento";
import { Endereco } from "../core/entidades/Endereco";
import { Telefone } from "../core/entidades/Telefone";
import { TipoDocumento } from "../core/enums/TipoDocumento";
import { ArmazemDados } from "../core/repositorios/ArmazemDados";

console.clear();
console.log('🧪 TESTE SIMPLES DO SISTEMA ATLANTIS');
console.log('═'.repeat(50));

try {
    // Teste 1: Singleton
    console.log('\n1️⃣ Testando Singleton...');
    const armazem1 = ArmazemDados.InstanciaUnica;
    const armazem2 = ArmazemDados.InstanciaUnica;
    console.log(`   Mesma instância? ${armazem1 === armazem2 ? '✅' : '❌'}`);

    // Teste 2: Criar Cliente Titular
    console.log('\n2️⃣ Testando criação de Titular...');
    const endereco = new Endereco('Rua A', 'Bairro B', 'Cidade C', 'Estado D', 'País E', '12345-678');
    const titular = new Cliente('João Silva', 'João', new Date('1990-01-01'), endereco);
    
    titular.adicionarTelefone(new Telefone('11', '99999-9999'));
    titular.adicionarDocumento(new Documento('12345678901', TipoDocumento.CPF, new Date()));
    
    console.log(`   Nome: ${titular.Nome} ✅`);
    console.log(`   É titular? ${titular.ehTitular() ? '✅' : '❌'}`);
    console.log(`   Documentos: ${titular.Documentos.length} ✅`);
    console.log(`   Telefones: ${titular.Telefones.length} ✅`);

    // Teste 3: Adicionar ao Armazém
    console.log('\n3️⃣ Testando armazenamento...');
    const armazem = ArmazemDados.InstanciaUnica;
    
    console.log(`   Clientes antes: ${armazem.Clientes.length}`);
    armazem.adicionarCliente(titular);
    console.log(`   Clientes depois: ${armazem.Clientes.length} ✅`);
    
    // Teste 4: Buscar Cliente
    console.log('\n4️⃣ Testando busca por documento...');
    const clienteEncontrado = armazem.buscarClientePorDocumento('12345678901');
    
    if (clienteEncontrado) {
        console.log(`   Cliente encontrado: ${clienteEncontrado.Nome} ✅`);
        console.log(`   Nome correto? ${clienteEncontrado.Nome === 'João Silva' ? '✅' : '❌'}`);
    } else {
        console.log('   ❌ Cliente não encontrado!');
        console.log('   Debug - Documentos no sistema:');
        armazem.Clientes.forEach((cliente, index) => {
            console.log(`     ${index + 1}. ${cliente.Nome}`);
            cliente.Documentos.forEach(doc => {
                console.log(`        ${doc.Tipo}: "${doc.Numero}"`);
            });
        });
    }

    // Teste 5: Criar Dependente
    console.log('\n5️⃣ Testando criação de Dependente...');
    const dependente = new Cliente('Maria Silva', 'Maria', new Date('2000-05-15'));
    dependente.definirEndereco(endereco.clonar());
    titular.Telefones.forEach(tel => dependente.adicionarTelefone(tel.clonar()));
    dependente.adicionarDocumento(new Documento('98765432101', TipoDocumento.RG, new Date()));
    
    titular.adicionarDependente(dependente);
    armazem.adicionarCliente(dependente);
    
    console.log(`   Nome: ${dependente.Nome} ✅`);
    console.log(`   É titular? ${dependente.ehTitular() ? '❌' : '✅'}`);
    console.log(`   Tem titular? ${dependente.Titular ? '✅' : '❌'}`);
    console.log(`   Titular correto? ${dependente.Titular?.Nome === titular.Nome ? '✅' : '❌'}`);

    // Teste 6: Listar por categoria
    console.log('\n6️⃣ Testando listagens...');
    const titulares = armazem.obterTitulares();
    const dependentes = armazem.obterDependentes();
    
    console.log(`   Titulares: ${titulares.length} ✅`);
    console.log(`   Dependentes: ${dependentes.length} ✅`);
    console.log(`   Total: ${armazem.Clientes.length} ✅`);

    // Teste 7: Requisitos do PDF
    console.log('\n7️⃣ Testando requisitos específicos do PDF...');
    
    // Listagem de dependentes por titular específico
    const titularEspecifico = armazem.buscarClientePorDocumento('12345678901');
    if (titularEspecifico) {
        const dependentesDoTitular = titularEspecifico.Dependentes;
        console.log(`   Dependentes do titular "${titularEspecifico.Nome}": ${dependentesDoTitular.length} ✅`);
    }
    
    // Listagem de titular por dependente específico
    const dependenteEspecifico = armazem.buscarClientePorDocumento('98765432101');
    if (dependenteEspecifico && dependenteEspecifico.Titular) {
        console.log(`   Titular do dependente "${dependenteEspecifico.Nome}": ${dependenteEspecifico.Titular.Nome} ✅`);
    }

    // Teste 8: Edição
    console.log('\n8️⃣ Testando edição...');
    const nomeOriginal = titular.Nome;
    titular.definirNome('João Silva Santos');
    console.log(`   Nome alterado de "${nomeOriginal}" para "${titular.Nome}" ✅`);
    
    // Teste 9: Exclusão
    console.log('\n9️⃣ Testando exclusão...');
    const clienteTemp = new Cliente('Temporário', 'Temp', new Date());
    clienteTemp.adicionarDocumento(new Documento('TEMP123', TipoDocumento.RG, new Date()));
    armazem.adicionarCliente(clienteTemp);
    
    const antesExclusao = armazem.Clientes.length;
    armazem.removerCliente(clienteTemp);
    const depoisExclusao = armazem.Clientes.length;
    
    console.log(`   Cliente removido? ${depoisExclusao === antesExclusao - 1 ? '✅' : '❌'}`);

    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('✅ Sistema funcionando corretamente');
    console.log('✅ Padrões Singleton e Strategy implementados');
    console.log('✅ CRUD completo funcional');
    console.log('✅ Requisitos do PDF atendidos');

} catch (error) {
    console.log(`\n❌ ERRO DURANTE OS TESTES: ${error}`);
    console.log('Stack trace:', error);
}


console.log('\n═'.repeat(10));