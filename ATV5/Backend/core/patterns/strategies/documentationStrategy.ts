import { PrismaClient } from '@prisma/client';

export interface IDocumentationStrategy {
  processDocument(data: {
    identifier: string;
    issuedDate: Date;
    guestId: string;
  }): Promise<any>;
}

export class NationalIdStrategy implements IDocumentationStrategy {
  private database: PrismaClient;

  constructor(database: PrismaClient) {
    this.database = database;
  }

  async processDocument(data: {
    identifier: string;
    issuedDate: Date;
    guestId: string;
  }) {
    return this.database.documentation.create({
      data: {
        identifier: data.identifier,
        category: 'CPF',
        issuedDate: data.issuedDate,
        guestId: data.guestId,
      },
    });
  }
}

export class StateIdStrategy implements IDocumentationStrategy {
  private database: PrismaClient;

  constructor(database: PrismaClient) {
    this.database = database;
  }

  async processDocument(data: {
    identifier: string;
    issuedDate: Date;
    guestId: string;
  }) {
    return this.database.documentation.create({
      data: {
        identifier: data.identifier,
        category: 'RG',
        issuedDate: data.issuedDate,
        guestId: data.guestId,
      },
    });
  }
}

export class InternationalIdStrategy implements IDocumentationStrategy {
  private database: PrismaClient;

  constructor(database: PrismaClient) {
    this.database = database;
  }

  async processDocument(data: {
    identifier: string;
    issuedDate: Date;
    guestId: string;
  }) {
    return this.database.documentation.create({
      data: {
        identifier: data.identifier,
        category: 'Passaporte',
        issuedDate: data.issuedDate,
        guestId: data.guestId,
      },
    });
  }
}

export class DocumentationProcessor {
  private strategy: IDocumentationStrategy;

  constructor(strategy: IDocumentationStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: IDocumentationStrategy) {
    this.strategy = strategy;
  }

  async process(data: {
    identifier: string;
    issuedDate: Date;
    guestId: string;
  }) {
    return this.strategy.processDocument(data);
  }
}