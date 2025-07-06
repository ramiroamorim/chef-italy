import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Credenciais do Supabase não encontradas. Verifique as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY');
}

// Cliente Supabase com service role key para operações do servidor
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Tipos para as tabelas do Supabase
export interface SupabaseVisitorData {
  id?: string;
  session_id: string;
  ip?: string;
  country?: string;
  country_code?: string;
  city?: string;
  region_name?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  isp?: string;
  user_agent?: string;
  page_url?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  created_at?: string;
}

export interface SupabaseFacebookEventData {
  id?: string;
  event_type: 'PageView' | 'InitiateCheckout';
  event_id: string;
  session_id: string;
  custom_parameters: Record<string, any>;
  original_data: Record<string, any>;
  formatted_data?: Record<string, any>;
  created_at?: string;
}

// Funções utilitárias para conversão de dados
export const DataConverter = {
  // Converter dados de visitante para formato Supabase
  visitorToSupabase: (visitor: any): SupabaseVisitorData => ({
    session_id: visitor.sessionId,
    ip: visitor.ip,
    country: visitor.country,
    country_code: visitor.countryCode,
    city: visitor.city,
    region_name: visitor.regionName,
    zip: visitor.zip,
    latitude: visitor.latitude,
    longitude: visitor.longitude,
    timezone: visitor.timezone,
    currency: visitor.currency,
    isp: visitor.isp,
    user_agent: visitor.userAgent,
    page_url: visitor.pageUrl,
    referrer: visitor.referrer,
    utm_source: visitor.utm_source,
    utm_medium: visitor.utm_medium,
    utm_campaign: visitor.utm_campaign,
    utm_content: visitor.utm_content,
    utm_term: visitor.utm_term,
    created_at: visitor.timestamp
  }),

  // Converter dados de evento Facebook para formato Supabase
  facebookEventToSupabase: (event: any): SupabaseFacebookEventData => ({
    event_type: event.eventType,
    event_id: event.eventId,
    session_id: event.sessionId,
    custom_parameters: event.customParameters,
    original_data: event.originalData,
    formatted_data: event.formattedData,
    created_at: event.timestamp
  }),

  // Converter dados do Supabase para formato original
  supabaseToVisitor: (supabaseData: SupabaseVisitorData): any => ({
    sessionId: supabaseData.session_id,
    ip: supabaseData.ip,
    country: supabaseData.country,
    countryCode: supabaseData.country_code,
    city: supabaseData.city,
    regionName: supabaseData.region_name,
    zip: supabaseData.zip,
    latitude: supabaseData.latitude,
    longitude: supabaseData.longitude,
    timezone: supabaseData.timezone,
    currency: supabaseData.currency,
    isp: supabaseData.isp,
    userAgent: supabaseData.user_agent,
    pageUrl: supabaseData.page_url,
    referrer: supabaseData.referrer,
    utm_source: supabaseData.utm_source,
    utm_medium: supabaseData.utm_medium,
    utm_campaign: supabaseData.utm_campaign,
    utm_content: supabaseData.utm_content,
    utm_term: supabaseData.utm_term,
    timestamp: supabaseData.created_at
  }),

  supabaseToFacebookEvent: (supabaseData: SupabaseFacebookEventData): any => ({
    eventType: supabaseData.event_type,
    eventId: supabaseData.event_id,
    sessionId: supabaseData.session_id,
    customParameters: supabaseData.custom_parameters,
    originalData: supabaseData.original_data,
    formattedData: supabaseData.formatted_data,
    timestamp: supabaseData.created_at
  })
};

console.log('🗄️ Cliente Supabase inicializado');