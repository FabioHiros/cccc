import api from './axios';
import type {
    Cliente,
    Acomodacao,
    Estadia,
    CreateTitularInput,
    CreateDependenteInput,
    CreateAcomodacaoInput,
    CreateEstadiaInput,
    UpdateClienteInput,
    UpdateEnderecoInput,
    UpdateAcomodacaoInput,
    UpdateEstadiaInput,
    Documento,
    Telefone,
    Endereco
} from '../types';

// Cliente services with proper field mapping
export const clienteService = {
  getAllClientes: () => api.get<Cliente[]>('/guests'),
  
  getClienteById: (id: string) => api.get<Cliente>(`/guests/${id}`),
  
  getAllTitulares: () => api.get<Cliente[]>('/guests/primary'),
  
  getAllDependentes: () => api.get<Cliente[]>('/guests/companions'),
  
  getDependentesByTitularId: (titularId: string) => 
    api.get<Cliente[]>(`/guests/primary/${titularId}/companions`),
  
  // FIXED: Map frontend data to backend format for primary guest creation
  createTitular: (data: CreateTitularInput) => 
    api.post<Cliente>('/guests/primary', {
      fullName: data.fullName,
      displayName: data.displayName,
      birthDate: data.birthDate,
      address: data.address,
      contact: {
        areaCode: data.contact.areaCode,
        number: data.contact.number
      },
      document: {
        category: data.document.category,
        identifier: data.document.identifier,
        issuedDate: data.document.issuedDate
      }
    }),
  
  // FIXED: Map frontend data to backend format for companion creation
  createDependente: (titularId: string, data: CreateDependenteInput) => 
    api.post<Cliente>(`/guests/primary/${titularId}/companion`, {
      fullName: data.nome,
      displayName: data.nomeSocial,
      birthDate: data.dataNascimento,
      document: {
        category: data.documento.tipo,
        identifier: data.documento.numero,
        issuedDate: data.documento.dataExpedicao
      }
    }),
  
  // FIXED: Map frontend data to backend format for guest updates
  updateCliente: (id: string, data: UpdateClienteInput) => 
    api.put<Cliente>(`/guests/${id}`, {
      fullName: data.fullName,
      displayName: data.displayName,
      birthDate: data.birthDate
    }),
  
  // FIXED: Map frontend data to backend format for address updates
  updateClienteEndereco: (id: string, data: UpdateEnderecoInput) => 
    api.put<Endereco>(`/guests/${id}/address`, {
      street: data.street || data.rua,
      district: data.district || data.bairro,
      city: data.city || data.cidade,
      region: data.region || data.estado,
      country: data.country || data.pais,
      postalCode: data.postalCode || data.codigoPostal
    }),
  
  // FIXED: Map frontend data to backend format for document creation
  addDocumentoToCliente: (id: string, data: { category?: string, tipo?: 'CPF' | 'RG' | 'Passaporte', identifier?: string, numero?: string, issuedDate?: string, dataExpedicao?: string }) => 
    api.post<Documento>(`/guests/${id}/document`, {
      category: data.category || data.tipo,
      identifier: data.identifier || data.numero,
      issuedDate: data.issuedDate || data.dataExpedicao
    }),
  
  // FIXED: Map frontend data to backend format for contact creation
  addTelefoneToCliente: (id: string, data: { areaCode?: string, ddd?: string, number?: string, numero?: string }) => 
    api.post<Telefone>(`/guests/${id}/contact`, {
      areaCode: data.areaCode || data.ddd,
      number: data.number || data.numero
    }),
  
  deleteCliente: (id: string) => 
    api.delete(`/guests/${id}`)
};

// Acomodacao services with proper data mapping
export const acomodacaoService = {
  getAllAcomodacoes: () => 
    api.get<Acomodacao[]>('/rooms'),
  
  getAcomodacaoById: (id: string) => 
    api.get<Acomodacao>(`/rooms/${id}`),
  
  createDefaultAcomodacoes: () => 
    api.post<Acomodacao[]>('/rooms/standard'),
  
  // FIXED: Map frontend data to backend format
  createCustomAcomodacao: (data: CreateAcomodacaoInput) => 
    api.post<Acomodacao>('/rooms', {
      designation: data.nomeAcomodacao,
      singleBeds: data.camaSolteiro,
      doubleBeds: data.camaCasal,
      bathrooms: data.suite,
      hasAirControl: data.climatizacao,
      parkingSpaces: data.garagem
    }),
  
  // FIXED: Map frontend data to backend format
  updateAcomodacao: (id: string, data: UpdateAcomodacaoInput) => 
    api.put<Acomodacao>(`/rooms/${id}`, {
      designation: data.nomeAcomodacao,
      singleBeds: data.camaSolteiro,
      doubleBeds: data.camaCasal,
      bathrooms: data.suite,
      hasAirControl: data.climatizacao,
      parkingSpaces: data.garagem
    }),
  
  deleteAcomodacao: (id: string) => 
    api.delete(`/rooms/${id}`)
};

// Estadia services with proper data mapping
export const estadiaService = {
  getAllEstadias: () => 
    api.get<Estadia[]>('/bookings'),
  
  getEstadiaById: (id: string) => 
    api.get<Estadia>(`/bookings/${id}`),
  
  getEstadiasByTitularId: (titularId: string) => 
    api.get<Estadia[]>(`/bookings/primary/${titularId}`),
  
  // FIXED: Map frontend data to backend format
  createEstadia: (data: CreateEstadiaInput) => 
    api.post<Estadia>('/bookings', {
      primaryId: data.titularId,
      roomId: data.acomodacaoId,
      arrivalDate: data.checkIn,
      departDate: data.checkOut
    }),
  
  // FIXED: Map frontend data to backend format
  updateEstadia: (id: string, data: UpdateEstadiaInput) => 
    api.put<Estadia>(`/bookings/${id}`, {
      roomId: data.acomodacaoId,
      arrivalDate: data.checkIn,
      departDate: data.checkOut
    }),
  
  deleteEstadia: (id: string) => 
    api.delete(`/bookings/${id}`)
};