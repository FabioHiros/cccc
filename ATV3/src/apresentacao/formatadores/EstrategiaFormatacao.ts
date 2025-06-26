import { Cliente } from '../../core/entidades/Cliente';

export interface EstrategiaFormatacao {
    formatar(cliente: Cliente): string;
}