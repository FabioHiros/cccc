import { TestData } from "./TestData";
import { TestRunner } from "./TestRunner";

console.clear();
console.log('🧪 INICIANDO TESTES DO SISTEMA ATLANTIS');
console.log('═'.repeat(60));

// Carregar dados de teste
const testData = new TestData();
testData.carregarDadosDeTest();
testData.mostrarEstatisticas();

// Executar testes
const testRunner = new TestRunner();
testRunner.executarTodosTestes();

console.log('\n🎯 TESTES CONCLUÍDOS!');
console.log('═'.repeat(60));