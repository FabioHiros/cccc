export class ColetorEntrada {
    private prompt = require('prompt-sync')();

    receberNumero(mensagem: string): number {
        const valor = this.prompt(`${mensagem} `);
        return new Number(valor).valueOf();
    }

    receberTexto(mensagem: string): string {
        return this.prompt(`${mensagem} `);
    }

    receberData(mensagem: string): Date {
        const texto = this.prompt(`${mensagem}, no padrão dd/MM/yyyy: `);
        const partes = texto.split('/');
        const ano = new Number(partes[2]);
        const mes = new Number(partes[1]);
        const dia = new Number(partes[0]);
        return new Date(ano.valueOf(), mes.valueOf() - 1, dia.valueOf());
    }
}