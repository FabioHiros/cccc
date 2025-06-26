import Acomodacao from "../entidades/Acomodacao";
import { NomeAcomodacao } from "../enums/TipoAcomodacao";
import Diretor from "../interfaces/diretor";
import ConstrutorAcomodacao from "../builders/ConstrutorAcomodacao";

export default class DiretorCasalSimples extends Diretor<Acomodacao> {
    constructor() {
        super();
        this.construtor = new ConstrutorAcomodacao();
    }

    construir(): Acomodacao {
        this.construtor.NomeAcomodacao = NomeAcomodacao.CASAL_SIMPLES;
        this.construtor.CamaSolteiro = 0;
        this.construtor.CamaCasal = 1;
        this.construtor.Suite = 1;
        this.construtor.Climatizacao = true;
        this.construtor.Garagem = 1;
        
        return this.construtor.construir();
    }
}