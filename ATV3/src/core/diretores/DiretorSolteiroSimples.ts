import Acomodacao from "../entidades/Acomodacao";
import { NomeAcomodacao } from "../enums/TipoAcomodacao";
import Diretor from "../interfaces/diretor";
import ConstrutorAcomodacao from "../builders/ConstrutorAcomodacao";

export default class DiretorSolteiroSimples extends Diretor<Acomodacao> {
    constructor() {
        super();
        this.construtor = new ConstrutorAcomodacao();
    }

    construir(): Acomodacao {
        this.construtor.NomeAcomodacao = NomeAcomodacao.SOLTEIRO_SIMPLES;
        this.construtor.CamaSolteiro = 1;
        this.construtor.CamaCasal = 0;
        this.construtor.Suite = 1;
        this.construtor.Climatizacao = true;
        this.construtor.Garagem = 0;
        
        return this.construtor.construir();
    }
}
