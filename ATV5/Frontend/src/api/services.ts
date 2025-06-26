// src/api/services.ts - UPDATED WITH PROPER UPDATE LOGIC
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
    UpdateEstadiaInput
} from '../types';

// Guest services - FIXED to match your backend API endpoints
export const clienteService = {
  // GET /api/v1/guests
  getAllClientes: () => api.get('/v1/guests'),
  
  // GET /api/v1/guests/:id
  getClienteById: (id: string) => api.get(`/v1/guests/${id}`),
  
  // GET /api/v1/guests/primary
  getAllTitulares: () => api.get('/v1/guests/primary'),
  
  // GET /api/v1/guests/companions
  getAllDependentes: () => api.get('/v1/guests/companions'),
  
  // GET /api/v1/guests/primary/:primaryId/companions
  getDependentesByTitularId: (titularId: string) => 
    api.get(`/v1/guests/primary/${titularId}/companions`),
  
  // POST /api/v1/guests - Create primary guest
  createTitular: (data: CreateTitularInput) => 
    api.post('/v1/guests', {
      fullName: data.fullName,
      displayName: data.displayName,
      birthDate: data.birthDate,
      address: data.address,
      contact: data.contact,
      document: data.document
    }),
  
  // POST /api/v1/guests - Create companion (with primaryGuestId)
  createDependente: (titularId: string, data: CreateDependenteInput) => 
    api.post('/v1/guests', {
      fullName: data.nome,
      displayName: data.nomeSocial,
      birthDate: data.dataNascimento,
      primaryGuestId: titularId, // This is the key field that was missing!
      document: {
        category: data.documento.tipo,
        identifier: data.documento.numero,
        issuedDate: data.documento.dataExpedicao
      }
    }),
  
  // PUT /api/v1/guests/:id - UPDATED: Now properly handles all guest data
  updateCliente: (id: string, data: UpdateClienteInput) => 
    api.put(`/v1/guests/${id}`, data),
  
  // Update address (handled via guest update)
  updateClienteEndereco: (id: string, data: UpdateEnderecoInput) => 
    api.put(`/v1/guests/${id}`, {
      address: {
        street: data.street || data.rua,
        district: data.district || data.bairro,
        city: data.city || data.cidade,
        region: data.region || data.estado,
        country: data.country || data.pais,
        postalCode: data.postalCode || data.codigoPostal
      }
    }),
  
  // Add document (handled via guest update)
  addDocumentoToCliente: (id: string, data: any) => 
    api.put(`/v1/guests/${id}`, {
      document: {
        category: data.category || data.tipo,
        identifier: data.identifier || data.numero,
        issuedDate: data.issuedDate || data.dataExpedicao
      }
    }),
  
  // Add contact (handled via guest update)
  addTelefoneToCliente: (id: string, data: any) => 
    api.put(`/v1/guests/${id}`, {
      contact: {
        areaCode: data.areaCode || data.ddd,
        number: data.number || data.numero
      }
    }),
  
  // DELETE /api/v1/guests/:id
  deleteCliente: (id: string) => 
    api.delete(`/v1/guests/${id}`)
};

// Room services - FIXED to match your backend API endpoints
export const acomodacaoService = {
  // GET /api/v1/rooms
  getAllAcomodacoes: () => 
    api.get('/v1/rooms'),
  
  // GET /api/v1/rooms/:id
  getAcomodacaoById: (id: string) => 
    api.get(`/v1/rooms/${id}`),
  
  // POST /api/v1/rooms/standard
  createDefaultAcomodacoes: () => 
    api.post('/v1/rooms/standard'),
  
  // POST /api/v1/rooms
  createCustomAcomodacao: (data: CreateAcomodacaoInput) => 
    api.post('/v1/rooms', {
      designation: data.nomeAcomodacao,
      singleBeds: data.camaSolteiro,
      doubleBeds: data.camaCasal,
      bathrooms: data.suite,
      hasAirControl: data.climatizacao,
      parkingSpaces: data.garagem
    }),
  
  // PUT /api/v1/rooms/:id
  updateAcomodacao: (id: string, data: UpdateAcomodacaoInput) => 
    api.put(`/v1/rooms/${id}`, {
      designation: data.nomeAcomodacao,
      singleBeds: data.camaSolteiro,
      doubleBeds: data.camaCasal,
      bathrooms: data.suite,
      hasAirControl: data.climatizacao,
      parkingSpaces: data.garagem
    }),
  
  // DELETE /api/v1/rooms/:id
  deleteAcomodacao: (id: string) => 
    api.delete(`/v1/rooms/${id}`)
};

// Booking services - FIXED to match your backend API endpoints
export const estadiaService = {
  // GET /api/v1/bookings
  getAllEstadias: () => 
    api.get('/v1/bookings'),
  
  // GET /api/v1/bookings/:id
  getEstadiaById: (id: string) => 
    api.get(`/v1/bookings/${id}`),
  
  // GET /api/v1/bookings/primary/:primaryId
  getEstadiasByTitularId: (titularId: string) => 
    api.get(`/v1/bookings/primary/${titularId}`),
  
  // POST /api/v1/bookings
  createEstadia: (data: CreateEstadiaInput) => 
    api.post('/v1/bookings', {
      primaryId: data.titularId,
      roomId: data.acomodacaoId,
      arrivalDate: data.checkIn,
      departDate: data.checkOut
    }),
  
  // PUT /api/v1/bookings/:id
  updateEstadia: (id: string, data: UpdateEstadiaInput) => 
    api.put(`/v1/bookings/${id}`, {
      roomId: data.acomodacaoId,
      arrivalDate: data.checkIn,
      departDate: data.checkOut
    }),
  
  // DELETE /api/v1/bookings/:id
  deleteEstadia: (id: string) => 
    api.delete(`/v1/bookings/${id}`)
};