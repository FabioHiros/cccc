import Acomodacao from "../entidades/Acomodacao";
import { NomeAcomodacao } from "../enums/TipoAcomodacao";
import Diretor from "../interfaces/diretor";
import ConstrutorAcomodacao from "../builders/ConstrutorAcomodacao";

export default class DiretorFamiliaMais extends Diretor<Acomodacao> {
    constructor() {
        super();
        this.construtor = new ConstrutorAcomodacao();
    }

    construir(): Acomodacao {
        this.construtor.NomeAcomodacao = NomeAcomodacao.FAMILIA_MAIS;
        this.construtor.CamaSolteiro = 5;
        this.construtor.CamaCasal = 1;
        this.construtor.Suite = 2;
        this.construtor.Climatizacao = true;
        this.construtor.Garagem = 2;
        
        return this.construtor.construir();
    }
}