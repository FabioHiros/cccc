import Acomodacao from "../entidades/Acomodacao";
import { NomeAcomodacao } from "../enums/TipoAcomodacao";
import Diretor from "../interfaces/diretor";
import ConstrutorAcomodacao from "../builders/ConstrutorAcomodacao";

export default class DiretorFamiliaSuper extends Diretor<Acomodacao> {
    constructor() {
        super();
        this.construtor = new ConstrutorAcomodacao();
    }

    construir(): Acomodacao {
        this.construtor.NomeAcomodacao = NomeAcomodacao.FAMILIA_SUPER;
        this.construtor.CamaSolteiro = 6;
        this.construtor.CamaCasal = 2;
        this.construtor.Suite = 3;
        this.construtor.Climatizacao = true;
        this.construtor.Garagem = 2;
        
        return this.construtor.construir();
    }
}
