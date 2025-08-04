// Configuração da API Hotmart
export const HOTMART_CONFIG = {
  CLIENT_ID: process.env.HOTMART_CLIENT_ID || "6410c2b2-7d06-4a5b-8930-00c99aecdd77",
  CLIENT_SECRET: process.env.HOTMART_CLIENT_SECRET || "1615bb17-6508-403a-9fec-d7b94736fd20",
  BASIC_TOKEN: process.env.HOTMART_BASIC_TOKEN || "Basic NjQxMGMyYjItN2QwNi00YTViLTg5MzAtMDBjOTlhZWNkZDc3OjE2MTViYjE3LTY1MDgtNDAzYS05ZmVjLWQ3Yjk0NzM2ZmQyMA==",
  // URLs da API
  AUTH_URL: "https://api-sec-vlc.hotmart.com/security/oauth/token",
  API_BASE_URL: "https://developers.hotmart.com/payments/api/v1",
  // Ambiente
  ENVIRONMENT: process.env.NODE_ENV || "production"
};

// Cache do token
let cachedToken: string | null = null;
let tokenExpireTime = 0;

export async function getHotmartToken(): Promise<string> {
  // Verificar se token ainda é válido
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  try {
    console.log("🔑 Obtendo novo token da Hotmart...");
    
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
      throw new Error(`Erro na autenticação: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    
    // Definir tempo de expiração (menos 1 minuto para segurança)
    tokenExpireTime = Date.now() + (data.expires_in * 1000) - 60000;
    
    console.log("✅ Token da Hotmart obtido com sucesso!");
    
    if (!cachedToken) {
      throw new Error("Token da Hotmart não foi retornado pela API");
    }
    
    return cachedToken;
  } catch (error) {
    console.error("❌ Erro ao obter token da Hotmart:", error);
    throw error;
  }
}

export async function getHotmartSales(params: any = {}) {
  try {
    const token = await getHotmartToken();
    
    const {
      startDate = Date.now() - (4 * 60 * 60 * 1000), // 4 horas atrás
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
    
    console.log("📊 Buscando vendas da Hotmart...");
    
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
    console.log(`✅ ${data.items?.length || 0} vendas encontradas`);
    
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar vendas da Hotmart:", error);
    throw error;
  }
}

export function matchSaleWithVisitor(sale: any, visitor: any) {
  const saleTime = new Date(sale.purchase_date);
  const visitorTime = new Date(visitor.timestamp);

  // Validar datas
  if (isNaN(saleTime.getTime()) || isNaN(visitorTime.getTime())) {
    console.error("❌ Datas inválidas:", {
      sale_purchase_date: sale.purchase_date,
      visitor_timestamp: visitor.timestamp,
      saleTime: saleTime.toString(),
      visitorTime: visitorTime.toString()
    });
    
    return {
      match: false,
      confidence: 0,
      method: "error-invalid-dates",
      details: { error: "Datas inválidas" }
    };
  }

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

  // Match temporal (dentro de 60 minutos)
  if (timeDiffMinutes <= 60) {
    score += 40;
    details.time_match = true;

    // Match por país
    const visitorCountry = visitor.country || visitor.countryCode;
    const saleCountry = sale.buyer?.address?.country;
    
    if (visitorCountry && saleCountry) {
      const normalizeCountry = (country: string) => {
        return country.toLowerCase().replace('brasil', 'brazil').replace('br', 'brazil');
      };
      
      if (normalizeCountry(visitorCountry) === normalizeCountry(saleCountry)) {
        score += 25;
        details.country_match = true;
      }
    }

    // Match por estado
    const visitorState = visitor.regionName || visitor.region;
    const saleState = sale.buyer?.address?.state;
    
    if (visitorState && saleState) {
      if (visitorState.toLowerCase().includes(saleState.toLowerCase()) || 
          saleState.toLowerCase().includes(visitorState.toLowerCase())) {
        score += 20;
        details.state_match = true;
      }
    }

    // Match por cidade
    const visitorCity = visitor.city;
    const saleCity = sale.buyer?.address?.city;
    
    if (visitorCity && saleCity) {
      if (visitorCity.toLowerCase() === saleCity.toLowerCase()) {
        score += 15;
        details.city_match = true;
      }
    }

    // Bonus por proximidade temporal
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

export function prepareCAPIData(matchData: any) {
  const { sale, visitor } = matchData;
  
  const hashEmail = (email: string) => {
    // TODO: Implementar hash SHA256 adequado
    return email;
  };

  return {
    data: [{
      event_name: "Purchase",
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
        currency: sale.price?.currency_value || "BRL",
        value: sale.price ? (sale.price.value / 100) : undefined, // Converter centavos
        content_ids: [sale.product?.id?.toString()],
        content_name: sale.product?.name
      }
    }]
  };
}

export const HotmartUtils = {
  // Validar se uma venda é válida para match
  isValidSale(sale: any): boolean {
    return !!(sale && 
      sale.purchase_date && 
      sale.status?.transaction_status === "APPROVED" && 
      sale.buyer?.address?.city && 
      sale.buyer?.address?.country);
  },

  // Validar se um visitante é válido para match  
  isValidVisitor(visitor: any): boolean {
    return !!(visitor && 
      visitor.timestamp && 
      visitor.city && 
      visitor.countryCode && 
      visitor.ip);
  },

  // Formatar data para log
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('pt-BR');
  }
};