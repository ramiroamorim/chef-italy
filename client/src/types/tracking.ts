// Tipos para dados de localização da API
export interface LocationData {
  ip?: string;
  continent?: string;
  continentCode?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  state?: string;  // Estado/Província
  city?: string;
  district?: string;
  zip?: string;
  postalCode?: string;  // Código postal alternativo
  latitude?: number;
  longitude?: number;
  timezone?: string;
  offset?: number;
  currency?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  source?: string;  // User Agent da API
  api_source?: string;
  api_key_used?: boolean;
  timestamp?: string;
  unix_timestamp?: number;  // Timestamp Unix para CAPI
}

// Tipos para dados completos do visitante
export interface VisitorData extends LocationData {
  sessionId: string;
  external_id?: string;  // UUID único do visitante (igual ao sessionId)
  fbp?: string;          // Facebook Browser ID (_fbp cookie)
  fbc?: string;          // Facebook Click ID
  api_used?: string;
  api_key_valid?: boolean;
  pageUrl: string;
  pageTitle: string;
  referrer?: string;
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  windowSize: string;
  pageLoadTime?: number;
  site: string;
  quiz_visitor: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  // Dados para Facebook Advanced Matching e CAPI
  phone?: string;        // Telefone (se disponível)
  email?: string;        // Email (se disponível)
  firstName?: string;    // Nome (se disponível)
  lastName?: string;     // Sobrenome (se disponível)
  gender?: string;       // Gênero (se disponível)
  dateOfBirth?: string;  // Data de nascimento (se disponível)
  unix_timestamp?: number;  // Timestamp Unix para CAPI
}

// Tipos para configuração da API
export interface ApiConfig {
  API_KEY: string;
  BASE_URL: string;
  FIELDS: string;
  FORCE_PRO: boolean;
}

// Tipos para histórico de visitas
export interface VisitHistory {
  timestamp?: string;
  sessionId: string;
  ip?: string;
  city?: string;
  country?: string;
  api_used?: string | null;
  page: string;
}

// Tipos para eventos de tracking
export interface TrackingEvent {
  eventName: string;
  eventData?: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

// Tipos para dados do Facebook Pixel
export interface FacebookPixelData {
  external_id: string;
  country?: string;
  st?: string;           // State/Province
  ct?: string;           // City
  zp?: string;           // Zip/Postal Code
  phone?: string;        // Phone number (hashed)
  email?: string;        // Email (hashed)
  fn?: string;           // First Name (hashed)
  ln?: string;           // Last Name (hashed)
  ge?: string;           // Gender (hashed)
  db?: string;           // Date of Birth (hashed)
  fbp?: string;          // Facebook Browser ID
  fbc?: string;          // Facebook Click ID
  client_ip_address?: string;
  client_user_agent?: string;
  unix_timestamp?: number;  // Unix timestamp for CAPI
}

// Enum para status da API
export enum ApiStatus {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  FALLBACK = 'fallback'
}

// Tipos para resposta da API
export interface ApiResponse {
  status: 'success' | 'fail';
  message?: string;
  query?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  district?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  offset?: number;
  currency?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  source?: string;  // User Agent da API
  continent?: string;
  continentCode?: string;
} 