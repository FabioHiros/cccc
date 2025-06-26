// src/types/index.ts - UPDATED FOR BACKEND COMPATIBILITY

// Backend response interfaces (what the API returns)
export interface Cliente {
  id: string;
  fullName: string;
  displayName: string;
  birthDate: string;
  registrationDate: string;
  primaryGuestId?: string;
  addressId?: string;
  
  // Related data
  documents?: Documentation[];
  contacts?: ContactInfo[];
  address?: Address;
  primaryGuest?: Cliente;
  companions?: Cliente[];
  stays?: Estadia[];
  
  // Legacy field mappings for compatibility
  nome?: string;
  nomeSocial?: string;
  dataNascimento?: string;
  dataCadastro?: string;
  documentos?: Documento[];
  telefones?: Telefone[];
  endereco?: Endereco;
  titular?: Cliente;
  dependentes?: Cliente[];
  estadias?: Estadia[];
  titularId?: string;
  enderecoId?: string;
}

export interface Documentation {
  id: string;
  category: string;
  identifier: string;
  issuedDate: string;
  guestId: string;
}

export interface ContactInfo {
  id: string;
  areaCode: string;
  number: string;
  guestId: string;
}

export interface Address {
  id: string;
  street: string;
  district: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

export interface Acomodacao {
  id: string;
  designation: string;
  singleBeds: number;
  doubleBeds: number;
  bathrooms: number;
  hasAirControl: boolean;
  parkingSpaces: number;
  
  // Legacy field mappings for compatibility
  nomeAcomodacao?: string;
  camaSolteiro?: number;
  camaCasal?: number;
  suite?: number;
  climatizacao?: boolean;
  garagem?: number;
}

export interface Estadia {
  id: string;
  arrivalDate: string;
  departDate: string;
  primaryId: string;
  roomId: string;
  primaryGuest?: Cliente;
  room?: Acomodacao;
  
  // Legacy field mappings for compatibility
  checkIn?: string;
  checkOut?: string;
  titularId?: string;
  acomodacaoId?: string;
  titular?: Cliente;
  acomodacao?: Acomodacao;
}

// Legacy interfaces for backward compatibility
export interface Documento {
  id: string;
  numero: string;
  tipo: string;
  dataExpedicao: string;
  clienteId: string;
}

export interface Telefone {
  id: string;
  ddd: string;
  numero: string;
  clienteId: string;
}

export interface Endereco {
  id: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  codigoPostal: string;
}

// Input types for creating/updating (what we send to the API)
export interface CreateTitularInput {
  fullName: string;
  displayName: string;
  birthDate: string;
  address: {
    street: string;
    district: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  contact: {
    areaCode: string;
    number: string;
  };
  document: {
    category: 'CPF' | 'RG' | 'Passaporte';
    identifier: string;
    issuedDate: string;
  };
}

export interface CreateDependenteInput {
  nome: string;
  nomeSocial: string;
  dataNascimento: string;
  documento: {
    tipo: 'CPF' | 'RG' | 'Passaporte';
    numero: string;
    dataExpedicao: string;
  };
}

export interface CreateAcomodacaoInput {
  nomeAcomodacao: string;
  camaSolteiro: number;
  camaCasal: number;
  suite: number;
  climatizacao: boolean;
  garagem: number;
}

export interface CreateEstadiaInput {
  titularId: string;
  acomodacaoId: string;
  checkIn: string;
  checkOut: string;
}

export interface UpdateClienteInput {
  fullName?: string;
  displayName?: string;
  birthDate?: string;
}

export interface UpdateEnderecoInput {
  street?: string;
  district?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  
  // Legacy field support
  rua?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  codigoPostal?: string;
}

export interface UpdateAcomodacaoInput {
  nomeAcomodacao?: string;
  camaSolteiro?: number;
  camaCasal?: number;
  suite?: number;
  climatizacao?: boolean;
  garagem?: number;
}

export interface UpdateEstadiaInput {
  acomodacaoId?: string;
  checkIn?: string;
  checkOut?: string;
}