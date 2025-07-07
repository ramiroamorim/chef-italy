import { supabase, DataConverter, SupabaseVisitorData, SupabaseFacebookEventData } from './supabase';

// Interfaces para compatibilidade com o código existente
interface VisitorData {
  sessionId: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  state?: string;          // Estado/Província
  city?: string;
  regionName?: string;
  zip?: string;
  postalCode?: string;     // Código postal alternativo
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  isp?: string;
  userAgent?: string;
  pageUrl?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  external_id?: string;
  fbp?: string;            // Facebook Browser ID
  fbc?: string;            // Facebook Click ID
  phone?: string;          // Telefone (hasheado)
  email?: string;          // Email (hasheado)
  firstName?: string;      // Nome (hasheado)
  lastName?: string;       // Sobrenome (hasheado)
  gender?: string;         // Gênero (hasheado)
  dateOfBirth?: string;    // Data de nascimento (hasheado)
  unix_timestamp?: number; // Timestamp Unix para CAPI
  timestamp: string;
}

interface FacebookEventData {
  eventType: 'PageView' | 'InitiateCheckout';
  eventId: string;
  sessionId: string;
  customParameters: {
    zp?: string;
    ct?: string;
    st?: string;
    country?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    external_id?: string;
    fbp?: string;
    fbc?: string;
    phone?: string;          // Telefone (hasheado)
    email?: string;          // Email (hasheado)
    fn?: string;             // Nome (hasheado)
    ln?: string;             // Sobrenome (hasheado)
    ge?: string;             // Gênero (hasheado)
    db?: string;             // Data de nascimento (hasheado)
    unix_timestamp?: number; // Timestamp Unix para CAPI
    [key: string]: any;
  };
  originalData: {
    zip?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;     // Código postal alternativo
    phone?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
  };
  formattedData?: {
    zip?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
  };
  unix_timestamp?: number; // Timestamp Unix para CAPI
  timestamp: string;
}

// Funções específicas para visitantes com Supabase
export const VisitorDatabase = {
  // Salvar dados de um visitante
  save: async (visitorData: VisitorData): Promise<void> => {
    try {
      console.log('👤 Salvando dados do visitante no Supabase:', {
        sessionId: visitorData.sessionId,
        country: visitorData.country,
        city: visitorData.city,
        ip: visitorData.ip?.substring(0, 8) + '...'
      });

      const supabaseData = DataConverter.visitorToSupabase(visitorData);
      
      const { data, error } = await supabase
        .from('visitors')
        .upsert(supabaseData, { 
          onConflict: 'session_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Erro ao salvar visitante no Supabase:', error);
        throw error;
      }

      console.log('✅ Visitante salvo com sucesso no Supabase');
    } catch (error) {
      console.error('❌ Erro ao salvar visitante:', error);
      throw error;
    }
  },

  // Buscar visitante por sessionId
  findBySessionId: async (sessionId: string): Promise<VisitorData | null> => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrado
          return null;
        }
        console.error('❌ Erro ao buscar visitante:', error);
        throw error;
      }

      return data ? DataConverter.supabaseToVisitor(data) : null;
    } catch (error) {
      console.error('❌ Erro ao buscar visitante:', error);
      return null;
    }
  },

  // Listar todos os visitantes
  getAll: async (): Promise<VisitorData[]> => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar visitantes:', error);
        throw error;
      }

      return data ? data.map(DataConverter.supabaseToVisitor) : [];
    } catch (error) {
      console.error('❌ Erro ao buscar visitantes:', error);
      return [];
    }
  },

  // Estatísticas
  getStats: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_visitor_stats');

      if (error) {
        console.error('❌ Erro ao buscar estatísticas de visitantes:', error);
        throw error;
      }

      const stats = data && data.length > 0 ? data[0] : {
        total_visitors: 0,
        unique_countries: 0,
        unique_cities: 0,
        most_recent_visit: null
      };

      return {
        total: Number(stats.total_visitors),
        countries: Number(stats.unique_countries),
        cities: Number(stats.unique_cities),
        mostRecentVisit: stats.most_recent_visit
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        countries: 0,
        cities: 0,
        mostRecentVisit: null
      };
    }
  }
};

// Funções específicas para eventos do Facebook com Supabase
export const FacebookEventDatabase = {
  // Salvar evento do Facebook
  save: async (eventData: FacebookEventData): Promise<void> => {
    try {
      console.log('📊 Salvando evento do Facebook no Supabase:', {
        eventType: eventData.eventType,
        sessionId: eventData.sessionId,
        hashedParams: Object.keys(eventData.customParameters).filter(key => 
          ['zp', 'ct', 'st', 'country'].includes(key)
        )
      });

      const supabaseData = DataConverter.facebookEventToSupabase(eventData);
      
      const { data, error } = await supabase
        .from('facebook_events')
        .upsert(supabaseData, { 
          onConflict: 'event_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Erro ao salvar evento no Supabase:', error);
        throw error;
      }

      console.log('✅ Evento salvo com sucesso no Supabase');
    } catch (error) {
      console.error('❌ Erro ao salvar evento:', error);
      throw error;
    }
  },

  // Buscar eventos por sessionId
  findBySessionId: async (sessionId: string): Promise<FacebookEventData[]> => {
    try {
      const { data, error } = await supabase
        .from('facebook_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        throw error;
      }

      return data ? data.map(DataConverter.supabaseToFacebookEvent) : [];
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return [];
    }
  },

  // Buscar eventos por tipo
  findByEventType: async (eventType: 'PageView' | 'InitiateCheckout'): Promise<FacebookEventData[]> => {
    try {
      const { data, error } = await supabase
        .from('facebook_events')
        .select('*')
        .eq('event_type', eventType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar eventos por tipo:', error);
        throw error;
      }

      return data ? data.map(DataConverter.supabaseToFacebookEvent) : [];
    } catch (error) {
      console.error('❌ Erro ao buscar eventos por tipo:', error);
      return [];
    }
  },

  // Listar todos os eventos
  getAll: async (): Promise<FacebookEventData[]> => {
    try {
      const { data, error } = await supabase
        .from('facebook_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        throw error;
      }

      return data ? data.map(DataConverter.supabaseToFacebookEvent) : [];
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return [];
    }
  },

  // Estatísticas
  getStats: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_event_stats');

      if (error) {
        console.error('❌ Erro ao buscar estatísticas de eventos:', error);
        throw error;
      }

      const stats = data && data.length > 0 ? data[0] : {
        total_events: 0,
        page_views: 0,
        initiate_checkouts: 0,
        unique_sessions: 0,
        most_recent_event: null
      };

      return {
        total: Number(stats.total_events),
        pageViews: Number(stats.page_views),
        initiateCheckouts: Number(stats.initiate_checkouts),
        uniqueSessions: Number(stats.unique_sessions),
        mostRecentEvent: stats.most_recent_event
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        pageViews: 0,
        initiateCheckouts: 0,
        uniqueSessions: 0,
        mostRecentEvent: null
      };
    }
  }
};

// Funções utilitárias para combinar dados
export const DatabaseUtils = {
  // Combinar dados de visitante com seus eventos
  getVisitorWithEvents: async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_visitor_with_events', { p_session_id: sessionId });

      if (error) {
        console.error('❌ Erro ao buscar visitante com eventos:', error);
        throw error;
      }

      const result = data && data.length > 0 ? data[0] : null;
      
      if (!result) {
        return {
          visitor: null,
          events: [],
          hasEvents: false
        };
      }

      return {
        visitor: result.visitor_data ? DataConverter.supabaseToVisitor(result.visitor_data) : null,
        events: Array.isArray(result.events_data) ? 
          result.events_data.map(DataConverter.supabaseToFacebookEvent) : [],
        hasEvents: result.has_events || false
      };
    } catch (error) {
      console.error('❌ Erro ao buscar visitante com eventos:', error);
      return {
        visitor: null,
        events: [],
        hasEvents: false
      };
    }
  },

  // Relatório completo
  getFullReport: async () => {
    try {
      const [visitorStats, eventStats] = await Promise.all([
        VisitorDatabase.getStats(),
        FacebookEventDatabase.getStats()
      ]);

      return {
        visitors: visitorStats,
        events: eventStats,
        conversion: {
          visitorsWithEvents: eventStats.uniqueSessions,
          conversionRate: visitorStats.total > 0 ? 
            (eventStats.uniqueSessions / visitorStats.total * 100).toFixed(2) + '%' : '0%'
        }
      };
    } catch (error) {
      console.error('❌ Erro ao gerar relatório completo:', error);
      return {
        visitors: { total: 0, countries: 0, cities: 0, mostRecentVisit: null },
        events: { total: 0, pageViews: 0, initiateCheckouts: 0, uniqueSessions: 0, mostRecentEvent: null },
        conversion: { visitorsWithEvents: 0, conversionRate: '0%' }
      };
    }
  },

  // Exportar todos os dados para backup
  exportAllData: async () => {
    try {
      const [visitors, facebookEvents] = await Promise.all([
        VisitorDatabase.getAll(),
        FacebookEventDatabase.getAll()
      ]);

      return {
        visitors,
        facebookEvents,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      return {
        visitors: [],
        facebookEvents: [],
        exportedAt: new Date().toISOString()
      };
    }
  },

  // Migrar dados do sistema de arquivos JSON para Supabase
  migrateFromJson: async (jsonVisitors: VisitorData[], jsonEvents: FacebookEventData[]) => {
    try {
      console.log('🔄 Iniciando migração de dados JSON para Supabase...');
      
      // Migrar visitantes
      let visitorsSuccess = 0;
      let visitorsError = 0;
      
      for (const visitor of jsonVisitors) {
        try {
          await VisitorDatabase.save(visitor);
          visitorsSuccess++;
        } catch (error) {
          visitorsError++;
          console.error('❌ Erro ao migrar visitante:', visitor.sessionId, error);
        }
      }

      // Migrar eventos do Facebook
      let eventsSuccess = 0;
      let eventsError = 0;
      
      for (const event of jsonEvents) {
        try {
          await FacebookEventDatabase.save(event);
          eventsSuccess++;
        } catch (error) {
          eventsError++;
          console.error('❌ Erro ao migrar evento:', event.eventId, error);
        }
      }

      const result = {
        visitors: {
          total: jsonVisitors.length,
          success: visitorsSuccess,
          errors: visitorsError
        },
        events: {
          total: jsonEvents.length,
          success: eventsSuccess,
          errors: eventsError
        },
        migratedAt: new Date().toISOString()
      };

      console.log('✅ Migração concluída:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      throw error;
    }
  }
};

// Teste de conexão com Supabase
export const testConnection = async () => {
  try {
    console.log('🔌 Testando conexão com Supabase...');
    
    const { data, error } = await supabase
      .from('visitors')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return false;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};

console.log('🗄️ Sistema de banco de dados Supabase inicializado');