import ConstrutorAcomodacao from "../builders/ConstrutorAcomodacao";
import Acomodacao from "../entidades/Acomodacao";
import { NomeAcomodacao } from "../enums/TipoAcomodacao";
import Diretor from "../interfaces/diretor";
import DiretorCasalSimples from "../diretores/DiretorCasalSimples";
import DiretorFamiliaSimples from "../diretores/DiretorFamiliaSimples";
import DiretorFamiliaMais from "../diretores/DiretorFamiliaMais";
import DiretorFamiliaSuper from "../diretores/DiretorFamiliaSuper";
import DiretorSolteiroSimples from "../diretores/DiretorSolteiroSimples";
import DiretorSolteiroMais from "../diretores/DiretorSolteiroMais";

export default class AcomodacaoFactory {
    private static construtor = new ConstrutorAcomodacao();

    private static getDiretor(tipo: NomeAcomodacao): Diretor<Acomodacao> {
        let diretor: Diretor<Acomodacao>;
        
        switch (tipo) {
            case NomeAcomodacao.CASAL_SIMPLES:
                diretor = new DiretorCasalSimples();
                break;
            case NomeAcomodacao.FAMILIA_SIMPLES:
                diretor = new DiretorFamiliaSimples();
                break;
            case NomeAcomodacao.FAMILIA_MAIS:
                diretor = new DiretorFamiliaMais();
                break;
            case NomeAcomodacao.FAMILIA_SUPER:
                diretor = new DiretorFamiliaSuper();
                break;
            case NomeAcomodacao.SOLTEIRO_SIMPLES:
                diretor = new DiretorSolteiroSimples();
                break;
            case NomeAcomodacao.SOLTEIRO_MAIS:
                diretor = new DiretorSolteiroMais();
                break;
            default:
                throw new Error(`Tipo de acomodação não reconhecido: ${tipo}`);
        }
        
        // Injeta o construtor na classe abstrata
        (diretor as any).construtor = this.construtor;
        return diretor;
    }

    static criarAcomodacao(tipo: NomeAcomodacao): Acomodacao {
        const diretor = this.getDiretor(tipo);
        return diretor.construir();
    }

    static criarTodas(): Acomodacao[] {
        return Object.values(NomeAcomodacao).map(tipo => this.criarAcomodacao(tipo));
    }
}