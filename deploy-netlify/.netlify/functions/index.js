// server/index.ts
import dotenv from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/config/hotmart.ts
var HOTMART_CONFIG = {
  CLIENT_ID: "4ac7c9c9-ce89-4b24-b4f3-baa4ca406c08",
  CLIENT_SECRET: "5fefa952-71b8-4695-9705-ce711ca6fb28",
  BASIC_TOKEN: "Basic NGFjN2M5YzktY2U4OS00YjI0LWI0ZjMtYmFhNGNhNDA2YzA4OjVmZWZhOTUyLTcxYjgtNDY5NS05NzA1LWNlNzExY2E2ZmIyOA==",
  // URLs da API
  AUTH_URL: "https://api-sec-vlc.hotmart.com/security/oauth/token",
  API_BASE_URL: "https://developers.hotmart.com/payments/api/v1",
  // Ambiente
  ENVIRONMENT: "production"
};
var cachedToken = null;
var tokenExpireTime = 0;
async function getHotmartToken() {
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }
  try {
    console.log("\u{1F511} Obtendo novo token da Hotmart...");
    const response = await fetch(HOTMART_CONFIG.AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": HOTMART_CONFIG.BASIC_TOKEN
      },
      body: JSON.stringify({
        grant_type: "client_credentials"
      })
    });
    if (!response.ok) {
      throw new Error(`Erro na autentica\xE7\xE3o: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpireTime = Date.now() + data.expires_in * 1e3 - 6e4;
    console.log("\u2705 Token da Hotmart obtido com sucesso!");
    if (!cachedToken) {
      throw new Error("Token da Hotmart n\xE3o foi retornado pela API");
    }
    return cachedToken;
  } catch (error) {
    console.error("\u274C Erro ao obter token da Hotmart:", error);
    throw error;
  }
}
async function getHotmartSales(params = {}) {
  try {
    const token = await getHotmartToken();
    const {
      startDate = Date.now() - 4 * 60 * 60 * 1e3,
      // 4 horas atrás
      endDate = Date.now(),
      maxResults = 50,
      transactionStatus = "APPROVED"
    } = params;
    const queryParams = new URLSearchParams({
      start_date: startDate.toString(),
      end_date: endDate.toString(),
      max_results: maxResults.toString(),
      transaction_status: transactionStatus
    });
    const url = `${HOTMART_CONFIG.API_BASE_URL}/sales/history?${queryParams}`;
    console.log("\u{1F4CA} Buscando vendas da Hotmart...");
    console.log("\u{1F517} URL:", url.replace(/start_date=\d+/, "start_date=HIDDEN"));
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Erro ao buscar vendas: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`\u2705 ${data.items?.length || 0} vendas encontradas`);
    return data;
  } catch (error) {
    console.error("\u274C Erro ao buscar vendas da Hotmart:", error);
    throw error;
  }
}
function matchSaleWithVisitor(sale, visitor) {
  const saleTime = new Date(sale.purchase_date);
  const visitorTime = new Date(visitor.timestamp);
  if (isNaN(saleTime.getTime()) || isNaN(visitorTime.getTime())) {
    console.error("\u274C Datas inv\xE1lidas:", {
      sale_purchase_date: sale.purchase_date,
      visitor_timestamp: visitor.timestamp,
      saleTime: saleTime.toString(),
      visitorTime: visitorTime.toString()
    });
    return {
      match: false,
      confidence: 0,
      method: "error-invalid-dates",
      details: { error: "Datas inv\xE1lidas" }
    };
  }
  const timeDiff = Math.abs(saleTime.getTime() - visitorTime.getTime());
  const timeDiffMinutes = Math.round(timeDiff / 6e4);
  let score = 0;
  const details = {
    time_diff_minutes: timeDiffMinutes,
    sale_time: sale.purchase_date,
    visitor_time: visitor.timestamp,
    visitor_data: {
      ip: visitor.ip,
      city: visitor.city,
      country: visitor.country,
      state: visitor.regionName,
      zip: visitor.zip,
      isp: visitor.isp
    },
    sale_data: {
      buyer_name: sale.buyer?.name,
      buyer_email: sale.buyer?.email
    }
  };
  if (timeDiffMinutes <= 60) {
    score += 40;
    details.time_match = true;
    const visitorCountry = visitor.country || visitor.countryCode;
    const saleCountry = sale.buyer?.address?.country;
    if (visitorCountry && saleCountry) {
      const normalizeCountry = (country) => {
        return country.toLowerCase().replace("brasil", "brazil").replace("br", "brazil");
      };
      if (normalizeCountry(visitorCountry) === normalizeCountry(saleCountry)) {
        score += 25;
        details.country_match = true;
      }
    }
    const visitorState = visitor.regionName || visitor.region;
    const saleState = sale.buyer?.address?.state;
    if (visitorState && saleState) {
      if (visitorState.toLowerCase().includes(saleState.toLowerCase()) || saleState.toLowerCase().includes(visitorState.toLowerCase())) {
        score += 20;
        details.state_match = true;
      }
    }
    const visitorCity = visitor.city;
    const saleCity = sale.buyer?.address?.city;
    if (visitorCity && saleCity) {
      if (visitorCity.toLowerCase() === saleCity.toLowerCase()) {
        score += 15;
        details.city_match = true;
      }
    }
    if (timeDiffMinutes <= 5) {
      score += 15;
      details.time_proximity = "very_close";
    } else if (timeDiffMinutes <= 15) {
      score += 10;
      details.time_proximity = "close";
    } else if (timeDiffMinutes <= 30) {
      score += 5;
      details.time_proximity = "reasonable";
    }
  } else {
    details.time_match = false;
    details.time_window_exceeded = true;
  }
  const confidence = Math.min(score, 100);
  const match = confidence >= 60;
  return {
    match,
    confidence,
    method: "geo-api + time + location",
    details
  };
}
function prepareCAPIData(matchData) {
  const { sale, visitor } = matchData;
  const hashEmail = (email) => {
    return email;
  };
  return {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(new Date(sale.purchase_date).getTime() / 1e3),
      user_data: {
        // Dados do visitante (mais precisos para device)
        client_ip_address: visitor.ip,
        client_user_agent: visitor.userAgent,
        // Dados da venda (mais precisos para identidade)
        em: sale.buyer?.email ? hashEmail(sale.buyer.email) : void 0,
        ph: sale.buyer?.checkout_phone ? hashEmail(sale.buyer.checkout_phone) : void 0,
        // Dados de localização
        country: visitor.countryCode?.toLowerCase(),
        ct: visitor.city,
        st: visitor.regionName,
        zp: visitor.zip || sale.buyer?.address?.zip_code
      },
      custom_data: {
        currency: sale.price?.currency_value || "BRL",
        value: sale.price ? sale.price.value / 100 : void 0,
        // Converter centavos
        content_ids: [sale.product?.id?.toString()],
        content_name: sale.product?.name
      }
    }]
  };
}
var HotmartUtils = {
  // Validar se uma venda é válida para match
  isValidSale(sale) {
    return sale && sale.purchase_date && sale.status?.transaction_status === "APPROVED" && sale.buyer?.address?.city && sale.buyer?.address?.country;
  },
  // Validar se um visitante é válido para match  
  isValidVisitor(visitor) {
    return visitor && visitor.timestamp && visitor.city && visitor.countryCode && visitor.ip;
  },
  // Formatar data para log
  formatDate(date) {
    return new Date(date).toLocaleString("pt-BR");
  }
};

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config();
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Credenciais do Supabase n\xE3o encontradas. Verifique as vari\xE1veis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY");
}
var supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
var DataConverter = {
  // Converter dados de visitante para formato Supabase
  visitorToSupabase: (visitor) => ({
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
  facebookEventToSupabase: (event) => ({
    event_type: event.eventType,
    event_id: event.eventId,
    session_id: event.sessionId,
    custom_parameters: event.customParameters,
    original_data: event.originalData,
    formatted_data: event.formattedData,
    created_at: event.timestamp
  }),
  // Converter dados do Supabase para formato original
  supabaseToVisitor: (supabaseData) => ({
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
  supabaseToFacebookEvent: (supabaseData) => ({
    eventType: supabaseData.event_type,
    eventId: supabaseData.event_id,
    sessionId: supabaseData.session_id,
    customParameters: supabaseData.custom_parameters,
    originalData: supabaseData.original_data,
    formattedData: supabaseData.formatted_data,
    timestamp: supabaseData.created_at
  })
};
console.log("\u{1F5C4}\uFE0F Cliente Supabase inicializado");

// server/database-supabase.ts
var VisitorDatabase = {
  // Salvar dados de um visitante
  save: async (visitorData) => {
    try {
      console.log("\u{1F464} Salvando dados do visitante no Supabase:", {
        sessionId: visitorData.sessionId,
        country: visitorData.country,
        city: visitorData.city,
        ip: visitorData.ip?.substring(0, 8) + "..."
      });
      const supabaseData = DataConverter.visitorToSupabase(visitorData);
      const { data, error } = await supabase.from("visitors").upsert(supabaseData, {
        onConflict: "session_id",
        ignoreDuplicates: false
      });
      if (error) {
        console.error("\u274C Erro ao salvar visitante no Supabase:", error);
        throw error;
      }
      console.log("\u2705 Visitante salvo com sucesso no Supabase");
    } catch (error) {
      console.error("\u274C Erro ao salvar visitante:", error);
      throw error;
    }
  },
  // Buscar visitante por sessionId
  findBySessionId: async (sessionId) => {
    try {
      const { data, error } = await supabase.from("visitors").select("*").eq("session_id", sessionId).single();
      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("\u274C Erro ao buscar visitante:", error);
        throw error;
      }
      return data ? DataConverter.supabaseToVisitor(data) : null;
    } catch (error) {
      console.error("\u274C Erro ao buscar visitante:", error);
      return null;
    }
  },
  // Listar todos os visitantes
  getAll: async () => {
    try {
      const { data, error } = await supabase.from("visitors").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("\u274C Erro ao buscar visitantes:", error);
        throw error;
      }
      return data ? data.map(DataConverter.supabaseToVisitor) : [];
    } catch (error) {
      console.error("\u274C Erro ao buscar visitantes:", error);
      return [];
    }
  },
  // Estatísticas
  getStats: async () => {
    try {
      const { data, error } = await supabase.rpc("get_visitor_stats");
      if (error) {
        console.error("\u274C Erro ao buscar estat\xEDsticas de visitantes:", error);
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
      console.error("\u274C Erro ao buscar estat\xEDsticas:", error);
      return {
        total: 0,
        countries: 0,
        cities: 0,
        mostRecentVisit: null
      };
    }
  }
};
var FacebookEventDatabase = {
  // Salvar evento do Facebook
  save: async (eventData) => {
    try {
      console.log("\u{1F4CA} Salvando evento do Facebook no Supabase:", {
        eventType: eventData.eventType,
        sessionId: eventData.sessionId,
        hashedParams: Object.keys(eventData.customParameters).filter(
          (key) => ["zp", "ct", "st", "country"].includes(key)
        )
      });
      const supabaseData = DataConverter.facebookEventToSupabase(eventData);
      const { data, error } = await supabase.from("facebook_events").upsert(supabaseData, {
        onConflict: "event_id",
        ignoreDuplicates: false
      });
      if (error) {
        console.error("\u274C Erro ao salvar evento no Supabase:", error);
        throw error;
      }
      console.log("\u2705 Evento salvo com sucesso no Supabase");
    } catch (error) {
      console.error("\u274C Erro ao salvar evento:", error);
      throw error;
    }
  },
  // Buscar eventos por sessionId
  findBySessionId: async (sessionId) => {
    try {
      const { data, error } = await supabase.from("facebook_events").select("*").eq("session_id", sessionId).order("created_at", { ascending: false });
      if (error) {
        console.error("\u274C Erro ao buscar eventos:", error);
        throw error;
      }
      return data ? data.map(DataConverter.supabaseToFacebookEvent) : [];
    } catch (error) {
      console.error("\u274C Erro ao buscar eventos:", error);
      return [];
    }
  },
  // Buscar eventos por tipo
  findByEventType: async (eventType) => {
    try {
      const { data, error } = await supabase.from("facebook_events").select("*").eq("event_type", eventType).order("created_at", { ascending: false });
      if (error) {
        console.error("\u274C Erro ao buscar eventos por tipo:", error);
        throw error;
      }
      return data ? data.map(DataConverter.supabaseToFacebookEvent) : [];
    } catch (error) {
      console.error("\u274C Erro ao buscar eventos por tipo:", error);
      return [];
    }
  },
  // Listar todos os eventos
  getAll: async () => {
    try {
      const { data, error } = await supabase.from("facebook_events").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("\u274C Erro ao buscar eventos:", error);
        throw error;
      }
      return data ? data.map(DataConverter.supabaseToFacebookEvent) : [];
    } catch (error) {
      console.error("\u274C Erro ao buscar eventos:", error);
      return [];
    }
  },
  // Estatísticas
  getStats: async () => {
    try {
      const { data, error } = await supabase.rpc("get_event_stats");
      if (error) {
        console.error("\u274C Erro ao buscar estat\xEDsticas de eventos:", error);
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
      console.error("\u274C Erro ao buscar estat\xEDsticas:", error);
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
var DatabaseUtils = {
  // Combinar dados de visitante com seus eventos
  getVisitorWithEvents: async (sessionId) => {
    try {
      const { data, error } = await supabase.rpc("get_visitor_with_events", { p_session_id: sessionId });
      if (error) {
        console.error("\u274C Erro ao buscar visitante com eventos:", error);
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
        events: Array.isArray(result.events_data) ? result.events_data.map(DataConverter.supabaseToFacebookEvent) : [],
        hasEvents: result.has_events || false
      };
    } catch (error) {
      console.error("\u274C Erro ao buscar visitante com eventos:", error);
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
          conversionRate: visitorStats.total > 0 ? (eventStats.uniqueSessions / visitorStats.total * 100).toFixed(2) + "%" : "0%"
        }
      };
    } catch (error) {
      console.error("\u274C Erro ao gerar relat\xF3rio completo:", error);
      return {
        visitors: { total: 0, countries: 0, cities: 0, mostRecentVisit: null },
        events: { total: 0, pageViews: 0, initiateCheckouts: 0, uniqueSessions: 0, mostRecentEvent: null },
        conversion: { visitorsWithEvents: 0, conversionRate: "0%" }
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
        exportedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("\u274C Erro ao exportar dados:", error);
      return {
        visitors: [],
        facebookEvents: [],
        exportedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  },
  // Migrar dados do sistema de arquivos JSON para Supabase
  migrateFromJson: async (jsonVisitors, jsonEvents) => {
    try {
      console.log("\u{1F504} Iniciando migra\xE7\xE3o de dados JSON para Supabase...");
      let visitorsSuccess = 0;
      let visitorsError = 0;
      for (const visitor of jsonVisitors) {
        try {
          await VisitorDatabase.save(visitor);
          visitorsSuccess++;
        } catch (error) {
          visitorsError++;
          console.error("\u274C Erro ao migrar visitante:", visitor.sessionId, error);
        }
      }
      let eventsSuccess = 0;
      let eventsError = 0;
      for (const event of jsonEvents) {
        try {
          await FacebookEventDatabase.save(event);
          eventsSuccess++;
        } catch (error) {
          eventsError++;
          console.error("\u274C Erro ao migrar evento:", event.eventId, error);
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
        migratedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("\u2705 Migra\xE7\xE3o conclu\xEDda:", result);
      return result;
    } catch (error) {
      console.error("\u274C Erro na migra\xE7\xE3o:", error);
      throw error;
    }
  }
};
console.log("\u{1F5C4}\uFE0F Sistema de banco de dados Supabase inicializado");

// server/facebook-capi.ts
import * as crypto from "crypto";
function getFacebookCAPIConfig() {
  return {
    PIXEL_ID: "644431871463181",
    // Mesmo ID do pixel client-side
    ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE",
    // Configurar no .env
    API_VERSION: "v21.0",
    BASE_URL: "https://graph.facebook.com"
  };
}
console.log("\u{1F527} CAPI: Configura\xE7\xE3o inicial:", {
  hasAccessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
  tokenLength: process.env.FACEBOOK_ACCESS_TOKEN?.length || 0,
  tokenStart: process.env.FACEBOOK_ACCESS_TOKEN?.substring(0, 10) || "NONE",
  isValid: process.env.FACEBOOK_ACCESS_TOKEN !== "YOUR_ACCESS_TOKEN_HERE"
});
var capiLogs = [];
var MAX_LOGS = 100;
function hashData(data) {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}
function prepareUserData(rawData) {
  const userData = {};
  if (rawData.external_id) {
    userData.external_id = rawData.external_id;
  }
  if (rawData.client_ip_address) {
    userData.client_ip_address = rawData.client_ip_address;
  }
  if (rawData.client_user_agent) {
    userData.client_user_agent = rawData.client_user_agent;
  }
  if (rawData.country) {
    userData.country = rawData.country.toLowerCase();
  }
  if (rawData.st) {
    userData.st = rawData.st.toLowerCase();
  }
  if (rawData.ct) {
    userData.ct = rawData.ct.toLowerCase();
  }
  if (rawData.zp) {
    userData.zp = rawData.zp.replace(/[^0-9]/g, "");
  }
  if (rawData.fbp) {
    userData.fbp = rawData.fbp;
  }
  if (rawData.fbc) {
    userData.fbc = rawData.fbc;
  }
  if (rawData.email) {
    userData.em = hashData(rawData.email);
  }
  if (rawData.phone) {
    userData.ph = hashData(rawData.phone);
  }
  return userData;
}
async function sendEventToCAPI(eventData) {
  const logId = `capi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const config2 = getFacebookCAPIConfig();
  if (!config2.ACCESS_TOKEN || config2.ACCESS_TOKEN === "YOUR_ACCESS_TOKEN_HERE") {
    const logEntry = {
      logId,
      timestamp,
      status: "error",
      error: "Facebook Access Token n\xE3o configurado",
      eventData
    };
    capiLogs.push(logEntry);
    console.error("\u274C CAPI: Access Token n\xE3o configurado!");
    return {
      success: false,
      error: "Access Token n\xE3o configurado",
      logId
    };
  }
  try {
    const capiEvent = {
      event_name: eventData.event_name || "PageView",
      event_time: eventData.event_time || Math.floor(Date.now() / 1e3),
      event_id: eventData.event_id,
      user_data: prepareUserData(eventData.user_data || {}),
      custom_data: eventData.custom_data || {},
      action_source: "website"
    };
    const url = `${config2.BASE_URL}/${config2.API_VERSION}/${config2.PIXEL_ID}/events`;
    const payload = {
      data: [capiEvent],
      test_event_code: process.env.NODE_ENV === "development" ? "TEST12345" : void 0
    };
    console.log("\u{1F4F1} CAPI: Enviando evento para Facebook:", {
      event_name: capiEvent.event_name,
      user_data_fields: Object.keys(capiEvent.user_data),
      custom_data_fields: Object.keys(capiEvent.custom_data || {}),
      url: url.replace(config2.ACCESS_TOKEN, "HIDDEN"),
      test_mode: !!payload.test_event_code
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config2.ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    const responseData = await response.json();
    const logEntry = {
      logId,
      timestamp,
      status: response.ok ? "success" : "error",
      eventData: capiEvent,
      payload,
      response: responseData,
      statusCode: response.status,
      url: url.replace(config2.ACCESS_TOKEN, "HIDDEN")
    };
    capiLogs.push(logEntry);
    if (capiLogs.length > MAX_LOGS) {
      capiLogs.splice(0, capiLogs.length - MAX_LOGS);
    }
    if (response.ok) {
      console.log("\u2705 CAPI: Evento enviado com sucesso!", {
        events_received: responseData.events_received,
        fbtrace_id: responseData.fbtrace_id
      });
      return {
        success: true,
        response: responseData,
        logId
      };
    } else {
      console.error("\u274C CAPI: Erro ao enviar evento:", {
        status: response.status,
        error: responseData
      });
      return {
        success: false,
        error: responseData.error?.message || "Erro desconhecido",
        logId
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const logEntry = {
      logId,
      timestamp,
      status: "error",
      error: errorMessage,
      eventData
    };
    capiLogs.push(logEntry);
    console.error("\u274C CAPI: Erro na requisi\xE7\xE3o:", error);
    return {
      success: false,
      error: errorMessage,
      logId
    };
  }
}
async function testCAPIConnection() {
  try {
    const testEvent = await sendEventToCAPI({
      event_name: "PageView",
      event_time: Math.floor(Date.now() / 1e3),
      user_data: {
        external_id: "test-user-" + Date.now(),
        client_ip_address: "127.0.0.1",
        client_user_agent: "Mozilla/5.0 (Test) Chrome/100.0.0.0",
        country: "br",
        ct: "sao paulo",
        st: "sp",
        zp: "01000"
      },
      custom_data: {
        content_name: "CAPI Test Event",
        currency: "BRL",
        value: 1
      }
    });
    return {
      success: testEvent.success,
      message: testEvent.success ? "Conex\xE3o CAPI funcionando!" : "Erro na conex\xE3o CAPI",
      details: testEvent
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao testar CAPI",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
function getCAPILogs(limit = 20) {
  return capiLogs.slice(-limit).reverse();
}
function getCAPIStats() {
  const config2 = getFacebookCAPIConfig();
  const totalEvents = capiLogs.length;
  const successfulEvents = capiLogs.filter((log2) => log2.status === "success").length;
  const failedEvents = totalEvents - successfulEvents;
  const successRate = totalEvents > 0 ? (successfulEvents / totalEvents * 100).toFixed(1) + "%" : "0%";
  const lastEventTime = capiLogs.length > 0 ? capiLogs[capiLogs.length - 1].timestamp : null;
  return {
    totalEvents,
    successfulEvents,
    failedEvents,
    successRate,
    lastEventTime,
    configStatus: {
      accessTokenConfigured: config2.ACCESS_TOKEN !== "YOUR_ACCESS_TOKEN_HERE" && !!config2.ACCESS_TOKEN,
      pixelId: config2.PIXEL_ID,
      apiVersion: config2.API_VERSION
    }
  };
}
async function forwardFrontendEventToCAPI(frontendEventData) {
  try {
    const { customParameters, originalData, formattedData, eventType, eventId, sessionId } = frontendEventData;
    const capiEventData = {
      event_name: eventType,
      // 'PageView' ou 'InitiateCheckout'
      event_time: Math.floor(new Date(frontendEventData.timestamp).getTime() / 1e3),
      event_id: eventId,
      user_data: {
        external_id: sessionId,
        client_ip_address: customParameters.client_ip_address,
        client_user_agent: customParameters.client_user_agent,
        fbp: customParameters.fbp,
        fbc: customParameters.fbc,
        // Usar dados formatados para Facebook
        country: formattedData?.country,
        st: formattedData?.state,
        ct: formattedData?.city,
        zp: formattedData?.zip
      },
      custom_data: {
        content_name: customParameters.content_name?.replace(/[\u200B-\u200D\uFEFF\u180E\u17B5\u2060\u061C]/g, ""),
        // Remover caracteres invisíveis
        content_category: customParameters.content_category?.replace(/[\u200B-\u200D\uFEFF\u180E\u17B5\u2060\u061C]/g, ""),
        content_type: customParameters.content_type?.replace(/[\u200B-\u200D\uFEFF\u180E\u17B5\u2060\u061C]/g, ""),
        currency: customParameters.currency,
        value: customParameters.value
      }
    };
    console.log("\u{1F504} CAPI: Encaminhando evento do frontend:", {
      eventType,
      sessionId,
      hasFormattedData: !!formattedData,
      formattedData
    });
    return await sendEventToCAPI(capiEventData);
  } catch (error) {
    console.error("\u274C CAPI: Erro ao encaminhar evento do frontend:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      logId: "forward_error_" + Date.now()
    };
  }
}

// server/routes.ts
var visitorsStorage = [];
var matchesStorage = [];
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.post("/api/tracking/visitor", async (req, res) => {
    try {
      const visitorData = req.body;
      console.log("\u{1F464} Novo visitante recebido:", {
        sessionId: visitorData.external_id,
        city: visitorData.visitor_data?.city,
        country: visitorData.visitor_data?.country,
        timestamp: visitorData.timestamp
      });
      const dbVisitorData = {
        sessionId: visitorData.external_id,
        ip: visitorData.visitor_data?.ip,
        country: visitorData.visitor_data?.country,
        countryCode: visitorData.visitor_data?.country_code,
        city: visitorData.visitor_data?.city,
        regionName: visitorData.visitor_data?.region,
        zip: visitorData.visitor_data?.zip,
        latitude: visitorData.visitor_data?.latitude,
        longitude: visitorData.visitor_data?.longitude,
        timezone: visitorData.visitor_data?.timezone,
        currency: visitorData.visitor_data?.currency,
        isp: visitorData.visitor_data?.isp,
        userAgent: visitorData.page_data?.user_agent,
        pageUrl: visitorData.page_data?.url,
        referrer: visitorData.page_data?.referrer,
        utm_source: visitorData.marketing_data?.utm_source,
        utm_medium: visitorData.marketing_data?.utm_medium,
        utm_campaign: visitorData.marketing_data?.utm_campaign,
        utm_content: visitorData.marketing_data?.utm_content,
        utm_term: visitorData.marketing_data?.utm_term,
        timestamp: visitorData.timestamp || (/* @__PURE__ */ new Date()).toISOString()
      };
      await VisitorDatabase.save(dbVisitorData);
      visitorsStorage.push({
        ...visitorData,
        received_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
      const beforeCount = visitorsStorage.length;
      for (let i = visitorsStorage.length - 1; i >= 0; i--) {
        const visitor = visitorsStorage[i];
        const visitorTime = new Date(visitor.timestamp).getTime();
        if (visitorTime < cutoff) {
          visitorsStorage.splice(i, 1);
        }
      }
      if (visitorsStorage.length !== beforeCount) {
        console.log(`\u{1F9F9} Limpeza: ${beforeCount - visitorsStorage.length} visitantes antigos removidos`);
      }
      res.json({
        success: true,
        message: "Visitatore salvato con successo",
        visitors_count: visitorsStorage.length
      });
    } catch (error) {
      console.error("\u274C Erro ao salvar visitante:", error);
      res.status(500).json({ success: false, error: "Errore interno" });
    }
  });
  app2.get("/api/hotmart/check-sales", async (req, res) => {
    try {
      console.log("\u{1F4CA} Verificando vendas da Hotmart...");
      const sales = await getHotmartSales({
        startDate: Date.now() - 4 * 60 * 60 * 1e3,
        endDate: Date.now(),
        maxResults: 100
      });
      if (!sales.items || sales.items.length === 0) {
        return res.json({
          success: true,
          message: "Nenhuma venda encontrada",
          sales_count: 0,
          matches_count: 0
        });
      }
      console.log(`\u{1F4B0} ${sales.items.length} vendas encontradas`);
      console.log(`\u{1F464} ${visitorsStorage.length} visitantes para match`);
      const newMatches = [];
      for (const sale of sales.items) {
        if (!HotmartUtils.isValidSale(sale)) {
          continue;
        }
        console.log(`\u{1F50D} Tentando match para venda:`, {
          transaction: sale.transaction,
          buyer_city: sale.buyer?.address?.city,
          purchase_date: HotmartUtils.formatDate(sale.purchase_date)
        });
        let bestMatch = null;
        let bestScore = 0;
        for (const visitor of visitorsStorage) {
          if (!HotmartUtils.isValidVisitor(visitor.visitor_data)) {
            continue;
          }
          const matchResult = matchSaleWithVisitor(sale, visitor.visitor_data);
          if (matchResult.match && matchResult.confidence > bestScore) {
            bestMatch = {
              sale,
              visitor: visitor.visitor_data,
              matchResult,
              matched_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            bestScore = matchResult.confidence;
          }
        }
        if (bestMatch) {
          newMatches.push(bestMatch);
          matchesStorage.push(bestMatch);
          console.log(`\u2705 MATCH ENCONTRADO!`, {
            confidence: bestMatch.matchResult.confidence,
            method: bestMatch.matchResult.method,
            details: bestMatch.matchResult.details
          });
          const capiData = prepareCAPIData(bestMatch);
          console.log("\u{1F4F1} Dados preparados para CAPI:", {
            event_name: capiData.data[0].event_name,
            value: capiData.data[0].custom_data.value,
            currency: capiData.data[0].custom_data.currency
          });
        }
      }
      res.json({
        success: true,
        sales_count: sales.items.length,
        visitors_count: visitorsStorage.length,
        matches_count: newMatches.length,
        new_matches: newMatches.map((m) => ({
          confidence: m.matchResult.confidence,
          method: m.matchResult.method,
          sale_id: m.sale.transaction,
          visitor_city: m.visitor.city,
          time_diff: m.matchResult.details.time_diff_minutes
        }))
      });
    } catch (error) {
      console.error("\u274C Erro ao verificar vendas:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro interno"
      });
    }
  });
  app2.get("/api/hotmart/stats", (req, res) => {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1e3;
    const recentVisitors = visitorsStorage.filter(
      (v) => new Date(v.timestamp).getTime() > last24h
    );
    const recentMatches = matchesStorage.filter(
      (m) => new Date(m.matched_at).getTime() > last24h
    );
    res.json({
      visitors: {
        total: visitorsStorage.length,
        last_24h: recentVisitors.length
      },
      matches: {
        total: matchesStorage.length,
        last_24h: recentMatches.length
      },
      match_rate: visitorsStorage.length > 0 ? Math.round(matchesStorage.length / visitorsStorage.length * 100) : 0
    });
  });
  app2.get("/api/hotmart/test-auth", async (req, res) => {
    try {
      console.log("\u{1F9EA} Testando autentica\xE7\xE3o da Hotmart...");
      const token = await getHotmartToken();
      res.json({
        success: true,
        message: "Autentica\xE7\xE3o funcionando!",
        token_preview: token.substring(0, 20) + "..."
      });
    } catch (error) {
      console.error("\u274C Erro na autentica\xE7\xE3o:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro interno"
      });
    }
  });
  app2.get("/api/database/stats", async (req, res) => {
    try {
      const stats = await DatabaseUtils.getFullReport();
      res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      console.error("\u274C Erro ao obter estat\xEDsticas:", error);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  });
  app2.post("/api/database/facebook-event", async (req, res) => {
    try {
      const eventData = req.body;
      console.log("\u{1F4CA} Recebendo evento do Facebook:", {
        eventType: eventData.eventType,
        sessionId: eventData.sessionId,
        hasHashedParams: Boolean(eventData.customParameters?.zp)
      });
      await FacebookEventDatabase.save(eventData);
      try {
        console.log("\u{1F4F1} Enviando evento para Facebook CAPI...");
        const capiResult = await forwardFrontendEventToCAPI(eventData);
        if (capiResult.success) {
          console.log("\u2705 CAPI: Evento enviado com sucesso!", {
            logId: capiResult.logId,
            eventType: eventData.eventType
          });
        } else {
          console.warn("\u26A0\uFE0F CAPI: Falha ao enviar evento:", capiResult.error);
        }
      } catch (capiError) {
        console.error("\u274C CAPI: Erro ao processar evento:", capiError);
      }
      res.json({
        success: true,
        message: "Evento do Facebook salvo com sucesso"
      });
    } catch (error) {
      console.error("\u274C Erro ao salvar evento do Facebook:", error);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  });
  app2.get("/api/database/visitor/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await DatabaseUtils.getVisitorWithEvents(sessionId);
      if (!result.visitor) {
        return res.status(404).json({
          success: false,
          error: "Visitante n\xE3o encontrado"
        });
      }
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error("\u274C Erro ao buscar visitante:", error);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  });
  app2.get("/api/database/export", async (req, res) => {
    try {
      const exportData = await DatabaseUtils.exportAllData();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", 'attachment; filename="chef-amelie-data-export.json"');
      res.json(exportData);
    } catch (error) {
      console.error("\u274C Erro ao exportar dados:", error);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  });
  app2.get("/api/capi/stats", (req, res) => {
    try {
      const stats = getCAPIStats();
      res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      console.error("\u274C Erro ao obter estat\xEDsticas CAPI:", error);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  });
  app2.get("/api/capi/logs", (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const logs = getCAPILogs(limit);
      res.json({
        success: true,
        logs,
        total: logs.length
      });
    } catch (error) {
      console.error("\u274C Erro ao obter logs CAPI:", error);
      res.status(500).json({ success: false, error: "Erro interno" });
    }
  });
  app2.post("/api/capi/test", async (req, res) => {
    try {
      console.log("\u{1F9EA} Testando conex\xE3o Facebook CAPI...");
      const testResult = await testCAPIConnection();
      res.json({
        success: testResult.success,
        message: testResult.message,
        details: testResult.details
      });
    } catch (error) {
      console.error("\u274C Erro ao testar CAPI:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao testar CAPI",
        error: error instanceof Error ? error.message : "Erro interno"
      });
    }
  });
  app2.post("/api/capi/send-event", async (req, res) => {
    try {
      const eventData = req.body;
      console.log("\u{1F4F1} Enviando evento manual para CAPI:", eventData);
      const result = await sendEventToCAPI(eventData);
      res.json(result);
    } catch (error) {
      console.error("\u274C Erro ao enviar evento manual CAPI:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro interno"
      });
    }
  });
  app2.get("/api/debug/visitors", (req, res) => {
    res.json({
      total_visitors: visitorsStorage.length,
      visitors: visitorsStorage.map((v) => ({
        external_id: v.external_id,
        timestamp: v.timestamp,
        visitor_data: {
          ip: v.visitor_data?.ip,
          city: v.visitor_data?.city,
          countryCode: v.visitor_data?.countryCode,
          country: v.visitor_data?.country,
          regionName: v.visitor_data?.regionName,
          zip: v.visitor_data?.zip,
          utm_source: v.visitor_data?.utm_source,
          userAgent: v.visitor_data?.userAgent?.substring(0, 50) + "..."
        }
      }))
    });
  });
  app2.post("/api/debug/test-match", (req, res) => {
    try {
      const { sale, visitorIndex } = req.body;
      if (visitorIndex >= visitorsStorage.length) {
        return res.status(400).json({
          error: "\xCDndice de visitante inv\xE1lido",
          total_visitors: visitorsStorage.length
        });
      }
      const visitor = visitorsStorage[visitorIndex];
      const matchResult = matchSaleWithVisitor(sale, visitor.visitor_data);
      res.json({
        success: true,
        visitor,
        sale,
        match_result: matchResult
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno"
      });
    }
  });
  app2.post("/api/hotmart/webhook", (req, res) => {
    try {
      console.log("\u{1F3AF} Webhook da Hotmart recebido via N8N!");
      const webhookData = req.body;
      const saleData = webhookData.body?.data;
      if (!saleData) {
        return res.status(400).json({
          success: false,
          error: "Dados da venda n\xE3o encontrados no webhook"
        });
      }
      console.log("\u{1F4B0} Dados da venda:", {
        event: webhookData.body.event,
        transaction: saleData.purchase?.transaction,
        buyer_email: saleData.buyer?.email,
        buyer_city: saleData.buyer?.address?.city,
        order_date: new Date(saleData.purchase?.order_date).toISOString(),
        status: saleData.purchase?.status,
        value: saleData.purchase?.price?.value
      });
      const hotmartSale = {
        transaction: saleData.purchase?.transaction,
        purchase_date: new Date(saleData.purchase?.order_date).toISOString(),
        status: {
          transaction_status: saleData.purchase?.status === "CANCELED" ? "CANCELED" : "APPROVED"
        },
        buyer: {
          email: saleData.buyer?.email,
          checkout_phone: saleData.buyer?.checkout_phone,
          address: {
            city: saleData.buyer?.address?.city,
            state: saleData.buyer?.address?.state,
            country: saleData.buyer?.address?.country,
            zip_code: saleData.buyer?.address?.zipcode
          }
        },
        price: {
          value: saleData.purchase?.price?.value * 100,
          // Converter para centavos
          currency_value: saleData.purchase?.price?.currency_value
        },
        product: {
          id: saleData.product?.id,
          name: saleData.product?.name
        }
      };
      console.log("\u{1F50D} Procurando match com visitantes...");
      console.log(`\u{1F464} ${visitorsStorage.length} visitantes dispon\xEDveis para match`);
      let bestMatch = null;
      let bestScore = 0;
      for (const visitor of visitorsStorage) {
        if (!HotmartUtils.isValidVisitor(visitor.visitor_data)) {
          continue;
        }
        const matchResult = matchSaleWithVisitor(hotmartSale, visitor.visitor_data);
        console.log(`\u{1F3AF} Match tentativa:`, {
          visitor_time: visitor.visitor_data.timestamp,
          sale_time: hotmartSale.purchase_date,
          confidence: matchResult.confidence,
          match: matchResult.match
        });
        if (matchResult.match && matchResult.confidence > bestScore) {
          bestMatch = {
            sale: hotmartSale,
            visitor: visitor.visitor_data,
            matchResult,
            matched_at: (/* @__PURE__ */ new Date()).toISOString(),
            webhook_data: webhookData.body
          };
          bestScore = matchResult.confidence;
        }
      }
      if (bestMatch) {
        matchesStorage.push(bestMatch);
        console.log("\u{1F389} MATCH ENCONTRADO!", {
          confidence: bestMatch.matchResult.confidence,
          method: bestMatch.matchResult.method,
          time_diff: bestMatch.matchResult.details.time_diff_minutes,
          visitor_session: bestMatch.visitor.external_id
        });
        if (hotmartSale.status.transaction_status === "APPROVED") {
          const capiData = prepareCAPIData(bestMatch);
          console.log("\u{1F4F1} Dados CAPI preparados:", {
            event_name: capiData.data[0].event_name,
            value: capiData.data[0].custom_data.value
          });
        }
        res.json({
          success: true,
          message: "Webhook processado e match encontrado!",
          match: {
            confidence: bestMatch.matchResult.confidence,
            method: bestMatch.matchResult.method,
            time_diff_minutes: bestMatch.matchResult.details.time_diff_minutes,
            sale_status: hotmartSale.status.transaction_status
          }
        });
      } else {
        console.log("\u274C Nenhum match encontrado para esta venda");
        res.json({
          success: true,
          message: "Webhook processado, mas nenhum match encontrado",
          sale_info: {
            transaction: hotmartSale.transaction,
            buyer_city: hotmartSale.buyer?.address?.city,
            order_date: hotmartSale.purchase_date,
            status: hotmartSale.status.transaction_status
          }
        });
      }
    } catch (error) {
      console.error("\u274C Erro ao processar webhook:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro interno"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/audio", express2.static("public/audio", {
  setHeaders: (res, path3) => {
    if (path3.endsWith(".mp4")) {
      res.set("Content-Type", "video/mp4");
    } else if (path3.endsWith(".mp3")) {
      res.set("Content-Type", "audio/mpeg");
    } else if (path3.endsWith(".wav")) {
      res.set("Content-Type", "audio/wav");
    }
    res.set("Accept-Ranges", "bytes");
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 3e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
