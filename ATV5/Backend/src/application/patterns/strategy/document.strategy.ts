// src/application/patterns/strategy/document.strategy.ts
import { DocumentType } from '../../../core/enums/document-type.enum';

export interface DocumentValidationData {
  category: DocumentType;
  identifier: string;
  issuedDate: Date;
}

export interface IDocumentValidationStrategy {
  validate(data: DocumentValidationData): boolean;
  getValidationMessage(): string;
}

export class CPFValidationStrategy implements IDocumentValidationStrategy {
  validate(data: DocumentValidationData): boolean {
    if (data.category !== DocumentType.CPF) {
      return false;
    }

    // Remove non-numeric characters
    const cpf = data.identifier.replace(/\D/g, '');
    
    // Check if CPF has 11 digits
    if (cpf.length !== 11) {
      return false;
    }

    // Check for known invalid sequences
    const invalidCPFs = [
      '00000000000', '11111111111', '22222222222', '33333333333',
      '44444444444', '55555555555', '66666666666', '77777777777',
      '88888888888', '99999999999'
    ];

    if (invalidCPFs.includes(cpf)) {
      return false;
    }

    // Validate CPF check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;

    return parseInt(cpf.charAt(9)) === firstDigit && parseInt(cpf.charAt(10)) === secondDigit;
  }

  getValidationMessage(): string {
    return 'CPF must be valid with 11 digits';
  }
}

export class RGValidationStrategy implements IDocumentValidationStrategy {
  validate(data: DocumentValidationData): boolean {
    if (data.category !== DocumentType.RG) {
      return false;
    }

    // Remove non-alphanumeric characters
    const rg = data.identifier.replace(/[^a-zA-Z0-9]/g, '');
    
    // RG should have 7-9 characters
    return rg.length >= 7 && rg.length <= 9;
  }

  getValidationMessage(): string {
    return 'RG must have between 7 and 9 characters';
  }
}

export class PassportValidationStrategy implements IDocumentValidationStrategy {
  validate(data: DocumentValidationData): boolean {
    if (data.category !== DocumentType.PASSPORT) {
      return false;
    }

    // Remove non-alphanumeric characters
    const passport = data.identifier.replace(/[^a-zA-Z0-9]/g, '');
    
    // Passport should have 6-9 characters
    return passport.length >= 6 && passport.length <= 9;
  }

  getValidationMessage(): string {
    return 'Passport must have between 6 and 9 characters';
  }
}

export class DocumentValidationContext {
  private strategy: IDocumentValidationStrategy;

  constructor(strategy: IDocumentValidationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IDocumentValidationStrategy): void {
    this.strategy = strategy;
  }

  validate(data: DocumentValidationData): boolean {
    return this.strategy.validate(data);
  }

  getValidationMessage(): string {
    return this.strategy.getValidationMessage();
  }
}

export class DocumentValidationFactory {
  static createStrategy(documentType: DocumentType): IDocumentValidationStrategy {
    switch (documentType) {
      case DocumentType.CPF:
        return new CPFValidationStrategy();
      case DocumentType.RG:
        return new RGValidationStrategy();
      case DocumentType.PASSPORT:
        return new PassportValidationStrategy();
      default:
        throw new Error(`Unsupported document type: ${documentType}`);
    }
  }
}