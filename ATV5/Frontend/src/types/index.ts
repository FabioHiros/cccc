// src/types/index.ts - SIMPLIFIED FOR BACKEND COMPATIBILITY

// Backend response interfaces (what the API returns)
export interface Cliente {
  id: string;
  fullName: string;
  displayName: string;
  birthDate: string;
  registrationDate?: string;
  primaryGuestId?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Related data
  documents?: Documentation[];
  contacts?: ContactInfo[];
  address?: Address;
  companions?: Cliente[];
}

export interface Documentation {
  id: string;
  category: 'CPF' | 'RG' | 'Passaporte';
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
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Estadia {
  id: string;
  arrivalDate: string;
  departDate: string;
  primaryId: string;
  roomId: string;
  status?: string;
  totalAmount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Relations
  primary?: Cliente;
  room?: Acomodacao;
}

// Input types for creating/updating (what we send to the API)
export interface CreateTitularInput {
  fullName: string;
  displayName: string;
  birthDate: string;
  address?: {
    street: string;
    district: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  contact?: {
    areaCode: string;
    number: string;
  };
  document?: {
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
  address?: {
    street?: string;
    district?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  };
  contact?: {
    areaCode?: string;
    number?: string;
  };
  document?: {
    category?: 'CPF' | 'RG' | 'Passaporte';
    identifier?: string;
    issuedDate?: string;
  };
}

export interface UpdateEnderecoInput {
  street?: string;
  district?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  
  // Legacy field support for compatibility
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