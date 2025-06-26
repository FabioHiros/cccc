import ConstrutorAcomodacao from "../builders/ConstrutorAcomodacao";

export default abstract class Diretor<T> {
    protected construtor!: ConstrutorAcomodacao;
    public abstract construir(): T;
}