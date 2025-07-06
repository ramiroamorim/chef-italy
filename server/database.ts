import * as fs from 'fs';
import * as path from 'path';

// Caminhos para os arquivos de dados
const DATABASE_DIR = path.join(process.cwd(), 'database', 'collections');
const VISITORS_FILE = path.join(DATABASE_DIR, 'visitors.json');
const FACEBOOK_EVENTS_FILE = path.join(DATABASE_DIR, 'facebook_events.json');

// Interfaces para tipagem
interface VisitorData {
  sessionId: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  regionName?: string;
  zip?: string;
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
  timestamp: string;
}

interface FacebookEventData {
  eventType: 'PageView' | 'InitiateCheckout';
  eventId: string;
  sessionId: string;
  customParameters: {
    zp?: string; // SHA256 hash
    ct?: string; // SHA256 hash
    st?: string; // SHA256 hash
    country?: string; // SHA256 hash
    client_ip_address?: string;
    client_user_agent?: string;
    external_id?: string;
    fbp?: string;
    fbc?: string;
    [key: string]: any;
  };
  originalData: {
    zip?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  formattedData?: {
    zip?: string; // Formatado para Facebook (08550-000 → 08550)
    city?: string; // Formatado para Facebook (Poá → poa)
    state?: string; // Formatado para Facebook (São Paulo → sp)
    country?: string; // Formatado para Facebook (BR → br)
  };
  timestamp: string;
}

// Garantir que o diretório existe
function ensureDatabaseDir() {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    console.log('📁 Diretório de banco de dados criado:', DATABASE_DIR);
  }
}

// Ler dados de um arquivo JSON
function readJsonFile<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao ler arquivo:', filePath, error);
    return [];
  }
}

// Escrever dados em um arquivo JSON
function writeJsonFile<T>(filePath: string, data: T[]) {
  try {
    ensureDatabaseDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('💾 Dados salvos em:', filePath, `(${data.length} registros)`);
  } catch (error) {
    console.error('❌ Erro ao salvar arquivo:', filePath, error);
  }
}

// Adicionar um novo registro
function addRecord<T>(filePath: string, newRecord: T) {
  const data = readJsonFile<T>(filePath);
  data.push(newRecord);
  writeJsonFile(filePath, data);
}

// Funções específicas para visitantes
export const VisitorDatabase = {
  // Salvar dados de um visitante
  save: (visitorData: VisitorData) => {
    console.log('👤 Salvando dados do visitante:', {
      sessionId: visitorData.sessionId,
      country: visitorData.country,
      city: visitorData.city,
      ip: visitorData.ip?.substring(0, 8) + '...'
    });
    addRecord(VISITORS_FILE, visitorData);
  },

  // Buscar visitante por sessionId
  findBySessionId: (sessionId: string): VisitorData | null => {
    const visitors = readJsonFile<VisitorData>(VISITORS_FILE);
    return visitors.find(visitor => visitor.sessionId === sessionId) || null;
  },

  // Listar todos os visitantes
  getAll: (): VisitorData[] => {
    return readJsonFile<VisitorData>(VISITORS_FILE);
  },

  // Estatísticas
  getStats: () => {
    const visitors = readJsonFile<VisitorData>(VISITORS_FILE);
    const countries = [...new Set(visitors.map(v => v.country).filter(Boolean))];
    const cities = [...new Set(visitors.map(v => v.city).filter(Boolean))];
    
    return {
      total: visitors.length,
      countries: countries.length,
      cities: cities.length,
      mostRecentVisit: visitors.length > 0 ? visitors[visitors.length - 1].timestamp : null
    };
  }
};

// Funções específicas para eventos do Facebook
export const FacebookEventDatabase = {
  // Salvar evento do Facebook
  save: (eventData: FacebookEventData) => {
    console.log('📊 Salvando evento do Facebook:', {
      eventType: eventData.eventType,
      sessionId: eventData.sessionId,
      hashedParams: Object.keys(eventData.customParameters).filter(key => 
        ['zp', 'ct', 'st', 'country'].includes(key)
      )
    });
    addRecord(FACEBOOK_EVENTS_FILE, eventData);
  },

  // Buscar eventos por sessionId
  findBySessionId: (sessionId: string): FacebookEventData[] => {
    const events = readJsonFile<FacebookEventData>(FACEBOOK_EVENTS_FILE);
    return events.filter(event => event.sessionId === sessionId);
  },

  // Buscar eventos por tipo
  findByEventType: (eventType: 'PageView' | 'InitiateCheckout'): FacebookEventData[] => {
    const events = readJsonFile<FacebookEventData>(FACEBOOK_EVENTS_FILE);
    return events.filter(event => event.eventType === eventType);
  },

  // Listar todos os eventos
  getAll: (): FacebookEventData[] => {
    return readJsonFile<FacebookEventData>(FACEBOOK_EVENTS_FILE);
  },

  // Estatísticas
  getStats: () => {
    const events = readJsonFile<FacebookEventData>(FACEBOOK_EVENTS_FILE);
    const pageViews = events.filter(e => e.eventType === 'PageView').length;
    const initiateCheckouts = events.filter(e => e.eventType === 'InitiateCheckout').length;
    
    return {
      total: events.length,
      pageViews,
      initiateCheckouts,
      uniqueSessions: [...new Set(events.map(e => e.sessionId))].length,
      mostRecentEvent: events.length > 0 ? events[events.length - 1].timestamp : null
    };
  }
};

// Funções utilitárias para combinar dados
export const DatabaseUtils = {
  // Combinar dados de visitante com seus eventos
  getVisitorWithEvents: (sessionId: string) => {
    const visitor = VisitorDatabase.findBySessionId(sessionId);
    const events = FacebookEventDatabase.findBySessionId(sessionId);
    
    return {
      visitor,
      events,
      hasEvents: events.length > 0
    };
  },

  // Relatório completo
  getFullReport: () => {
    const visitorStats = VisitorDatabase.getStats();
    const eventStats = FacebookEventDatabase.getStats();
    
    return {
      visitors: visitorStats,
      events: eventStats,
      conversion: {
        visitorsWithEvents: eventStats.uniqueSessions,
        conversionRate: visitorStats.total > 0 ? 
          (eventStats.uniqueSessions / visitorStats.total * 100).toFixed(2) + '%' : '0%'
      }
    };
  },

  // Exportar todos os dados para backup
  exportAllData: () => {
    return {
      visitors: VisitorDatabase.getAll(),
      facebookEvents: FacebookEventDatabase.getAll(),
      exportedAt: new Date().toISOString()
    };
  }
};

// Inicializar banco ao importar o módulo
ensureDatabaseDir();

console.log('🗄️ Sistema de banco de dados inicializado');
console.log('📊 Estatísticas atuais:', DatabaseUtils.getFullReport());