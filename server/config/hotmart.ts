/**
 * 🔑 Configuração da API Hotmart
 * Credenciais e funções para integração com a Hotmart
 */

// Credenciais da Hotmart
export const HOTMART_CONFIG = {
  CLIENT_ID: '6410c2b2-7d06-4a5b-8930-00c99aecdd77',
  CLIENT_SECRET: '1615bb17-6508-403a-9fec-d7b94736fd20',
  BASIC_TOKEN: 'Basic NjQxMGMyYjItN2QwNi00YTViLTg5MzAtMDBjOTlhZWNkZDc3OjE2MTViYjE3LTY1MDgtNDAzYS05ZmVjLWQ3Yjk0NzM2ZmQyMA==',
  
  // URLs da API
  AUTH_URL: 'https://api-sec-vlc.hotmart.com/security/oauth/token',
  API_BASE_URL: 'https://developers.hotmart.com/payments/api/v1',
  
  // Ambiente
  ENVIRONMENT: 'production' as 'production' | 'sandbox'
};

// Cache do token de autenticação
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 🔐 Obter token de acesso da Hotmart
 */
export async function getHotmartToken(): Promise<string> {
  // Verificar se token ainda é válido
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  try {
    console.log('🔑 Obtendo novo token da Hotmart...');
    
    const response = await fetch(HOTMART_CONFIG.AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': HOTMART_CONFIG.BASIC_TOKEN
      },
      body: JSON.stringify({
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na autenticação: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache do token
    cachedToken = data.access_token;
    tokenExpireTime = Date.now() + (data.expires_in * 1000) - 60000; // 1 min de margem
    
    console.log('✅ Token da Hotmart obtido com sucesso!');
    
    // Garantir que o token existe antes de retornar
    if (!cachedToken) {
      throw new Error('Token da Hotmart não foi retornado pela API');
    }
    
    return cachedToken;
    
  } catch (error) {
    console.error('❌ Erro ao obter token da Hotmart:', error);
    throw error;
  }
}

/**
 * 📊 Buscar vendas recentes da Hotmart
 */
export async function getHotmartSales(params: {
  startDate?: number;
  endDate?: number;
  maxResults?: number;
  transactionStatus?: string;
} = {}): Promise<any> {
  try {
    const token = await getHotmartToken();
    
    // Parâmetros padrão
    const {
      startDate = Date.now() - (4 * 60 * 60 * 1000), // 4 horas atrás
      endDate = Date.now(),
      maxResults = 50,
      transactionStatus = 'APPROVED'
    } = params;

    // Construir URL com parâmetros
    const queryParams = new URLSearchParams({
      start_date: startDate.toString(),
      end_date: endDate.toString(),
      max_results: maxResults.toString(),
      transaction_status: transactionStatus
    });

    const url = `${HOTMART_CONFIG.API_BASE_URL}/sales/history?${queryParams}`;
    
    console.log('📊 Buscando vendas da Hotmart...');
    console.log('🔗 URL:', url.replace(/start_date=\d+/, 'start_date=HIDDEN'));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar vendas: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.items?.length || 0} vendas encontradas`);
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro ao buscar vendas da Hotmart:', error);
    throw error;
  }
}

/**
 * 🎯 Fazer match entre venda e visitante
 */
export function matchSaleWithVisitor(sale: any, visitor: any): {
  match: boolean;
  confidence: number;
  method: string;
  details: any;
} {
  const saleTime = new Date(sale.purchase_date);
  const visitorTime = new Date(visitor.timestamp);
  
  // Verificar se as datas são válidas
  if (isNaN(saleTime.getTime()) || isNaN(visitorTime.getTime())) {
    console.error('❌ Datas inválidas:', {
      sale_purchase_date: sale.purchase_date,
      visitor_timestamp: visitor.timestamp,
      saleTime: saleTime.toString(),
      visitorTime: visitorTime.toString()
    });
    return {
      match: false,
      confidence: 0,
      method: 'error-invalid-dates',
      details: { error: 'Datas inválidas' }
    };
  }
  
  // Diferença de tempo em minutos
  const timeDiff = Math.abs(saleTime.getTime() - visitorTime.getTime());
  const timeDiffMinutes = Math.round(timeDiff / 60000);
  
  let score = 0;
  const details: any = {
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
  
  // Score baseado no tempo (máximo 60 minutos - mais flexível)
  if (timeDiffMinutes <= 60) {
    score += 40;
    details.time_match = true;
    
    // Bonus por país (usando dados da API de geolocalização)
    const visitorCountry = visitor.country || visitor.countryCode;
    const saleCountry = sale.buyer?.address?.country;
    
    if (visitorCountry && saleCountry) {
      // Normalizar nomes de países
      const normalizeCountry = (country: string) => {
        return country.toLowerCase()
          .replace('brasil', 'brazil')
          .replace('br', 'brazil');
      };
      
      if (normalizeCountry(visitorCountry) === normalizeCountry(saleCountry)) {
        score += 25;
        details.country_match = true;
      }
    }
    
    // Bonus por estado/região (dados da API)
    const visitorState = visitor.regionName || visitor.region;
    const saleState = sale.buyer?.address?.state;
    
    if (visitorState && saleState) {
      if (visitorState.toLowerCase().includes(saleState.toLowerCase()) || 
          saleState.toLowerCase().includes(visitorState.toLowerCase())) {
        score += 20;
        details.state_match = true;
      }
    }
    
    // Bonus por cidade (dados da API)
    const visitorCity = visitor.city;
    const saleCity = sale.buyer?.address?.city;
    
    if (visitorCity && saleCity) {
      if (visitorCity.toLowerCase() === saleCity.toLowerCase()) {
        score += 15;
        details.city_match = true;
      }
    }
    
    // Bonus por proximidade temporal (quanto mais próximo, maior o score)
    if (timeDiffMinutes <= 5) {
      score += 15; // Muito próximo
      details.time_proximity = 'very_close';
    } else if (timeDiffMinutes <= 15) {
      score += 10; // Próximo
      details.time_proximity = 'close';
    } else if (timeDiffMinutes <= 30) {
      score += 5; // Razoável
      details.time_proximity = 'reasonable';
    }
    
  } else {
    details.time_match = false;
    details.time_window_exceeded = true;
  }
  
  const confidence = Math.min(score, 100);
  const match = confidence >= 60; // Reduzido de 70 para 60
  
  return {
    match,
    confidence,
    method: 'geo-api + time + location',
    details
  };
}

/**
 * 📱 Preparar dados para Facebook CAPI
 */
export function prepareCAPIData(matchData: any): any {
  const { sale, visitor } = matchData;
  
  // Hash do email (SHA256)
  const hashEmail = (email: string) => {
    // Simplificado - em produção usar crypto real
    return email; // TODO: implementar hash SHA256
  };
  
  return {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(new Date(sale.purchase_date).getTime() / 1000),
      user_data: {
        // Dados do visitante (mais precisos para device)
        client_ip_address: visitor.ip,
        client_user_agent: visitor.userAgent,
        
        // Dados da venda (mais precisos para identidade)
        em: sale.buyer?.email ? hashEmail(sale.buyer.email) : undefined,
        ph: sale.buyer?.checkout_phone ? hashEmail(sale.buyer.checkout_phone) : undefined,
        
        // Dados de localização
        country: visitor.countryCode?.toLowerCase(),
        ct: visitor.city,
        st: visitor.regionName,
        zp: visitor.zip || sale.buyer?.address?.zip_code
      },
      custom_data: {
        currency: sale.price?.currency_value || 'BRL',
        value: sale.price ? (sale.price.value / 100) : undefined, // Converter centavos
        content_ids: [sale.product?.id?.toString()],
        content_name: sale.product?.name
      }
    }]
  };
}

/**
 * ⚙️ Funções de utilitário
 */
export const HotmartUtils = {
  
  // Validar se uma venda é válida para match
  isValidSale(sale: any): boolean {
    return (
      sale &&
      sale.purchase_date &&
      sale.status?.transaction_status === 'APPROVED' &&
      sale.buyer?.address?.city &&
      sale.buyer?.address?.country
    );
  },
  
  // Validar se um visitante é válido para match  
  isValidVisitor(visitor: any): boolean {
    return (
      visitor &&
      visitor.timestamp &&
      visitor.city &&
      visitor.countryCode &&
      visitor.ip
    );
  },
  
  // Formatar data para log
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('pt-BR');
  }
}; 