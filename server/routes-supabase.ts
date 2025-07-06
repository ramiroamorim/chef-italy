import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { 
  getHotmartToken, 
  getHotmartSales, 
  matchSaleWithVisitor, 
  prepareCAPIData,
  HotmartUtils 
} from './config/hotmart';

// Importar as funções do Supabase em vez do sistema de arquivos
import { VisitorDatabase, FacebookEventDatabase, DatabaseUtils } from './database-supabase';
import { sendEventToCAPI, testCAPIConnection, getCAPILogs, getCAPIStats, forwardFrontendEventToCAPI } from './facebook-capi';

// Cache temporário para matches recentes (para evitar duplicação)
const recentMatches = new Map<string, Date>();

// Limpar matches antigos a cada 1 hora
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [key, date] of Array.from(recentMatches.entries())) {
    if (date < oneHourAgo) {
      recentMatches.delete(key);
    }
  }
}, 60 * 60 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 🎯 Receber dados de tracking de visitantes
  app.post('/api/tracking/visitor', async (req, res) => {
    try {
      const visitorData = req.body;
      
      console.log('👤 Novo visitante recebido:', {
        sessionId: visitorData.external_id,
        city: visitorData.visitor_data?.city,
        country: visitorData.visitor_data?.country,
        timestamp: visitorData.timestamp
      });
      
      // Estruturar dados para o banco
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
        timestamp: visitorData.timestamp || new Date().toISOString()
      };
      
      // Salvar no Supabase
      await VisitorDatabase.save(dbVisitorData);
      
      // Obter estatísticas atualizadas
      const stats = await VisitorDatabase.getStats();
      
      res.json({ 
        success: true, 
        message: 'Visitatore salvato con successo',
        visitors_count: stats.total
      });
      
    } catch (error) {
      console.error('❌ Erro ao salvar visitante:', error);
      res.status(500).json({ success: false, error: 'Errore interno' });
    }
  });

  // 🔍 Buscar vendas da Hotmart e fazer match
  app.get('/api/hotmart/check-sales', async (req, res) => {
    try {
      console.log('📊 Verificando vendas da Hotmart...');
      
      // Buscar vendas das últimas 4 horas
      const sales = await getHotmartSales({
        startDate: Date.now() - (4 * 60 * 60 * 1000),
        endDate: Date.now(),
        maxResults: 100
      });
      
      if (!sales.items || sales.items.length === 0) {
        return res.json({
          success: true,
          message: 'Nenhuma venda encontrada',
          sales_count: 0,
          matches_count: 0
        });
      }
      
      console.log(`💰 ${sales.items.length} vendas encontradas`);
      
      // Buscar visitantes das últimas 4 horas do Supabase
      const allVisitors = await VisitorDatabase.getAll();
      const recentVisitors = allVisitors.filter(visitor => {
        const visitorTime = new Date(visitor.timestamp).getTime();
        const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
        return visitorTime >= fourHoursAgo;
      });
      
      console.log(`👤 ${recentVisitors.length} visitantes recentes para match`);
      
      const newMatches = [];
      
      // Tentar fazer match de cada venda
      for (const sale of sales.items) {
        if (!HotmartUtils.isValidSale(sale)) {
          continue;
        }
        
        // Verificar se já fizemos match desta venda recentemente
        const saleKey = `${sale.transaction}_${sale.purchase_date}`;
        if (recentMatches.has(saleKey)) {
          console.log(`⏭️ Match já processado para venda ${sale.transaction}`);
          continue;
        }
        
        console.log(`🔍 Tentando match para venda:`, {
          transaction: sale.transaction,
          buyer_city: sale.buyer?.address?.city,
          purchase_date: HotmartUtils.formatDate(sale.purchase_date)
        });
        
        let bestMatch = null;
        let bestScore = 0;
        
        // Comparar com todos os visitantes recentes
        for (const visitor of recentVisitors) {
          if (!HotmartUtils.isValidVisitor(visitor)) {
            continue;
          }
          
          const matchResult = matchSaleWithVisitor(sale, visitor);
          
          if (matchResult.match && matchResult.confidence > bestScore) {
            bestMatch = {
              sale,
              visitor,
              matchResult,
              matched_at: new Date().toISOString()
            };
            bestScore = matchResult.confidence;
          }
        }
        
        if (bestMatch) {
          newMatches.push(bestMatch);
          
          // Marcar como processado
          recentMatches.set(saleKey, new Date());
          
          console.log(`✅ MATCH ENCONTRADO!`, {
            confidence: bestMatch.matchResult.confidence,
            method: bestMatch.matchResult.method,
            details: bestMatch.matchResult.details
          });
          
          // Preparar dados para CAPI
          const capiData = prepareCAPIData(bestMatch);
          console.log('📱 Dados preparados para CAPI:', {
            event_name: capiData.data[0].event_name,
            value: capiData.data[0].custom_data.value,
            currency: capiData.data[0].custom_data.currency
          });
          
          // Opcional: Enviar para Facebook CAPI automaticamente
          try {
            await sendEventToCAPI(capiData);
            console.log('📤 Evento enviado para Facebook CAPI com sucesso');
          } catch (capiError) {
            console.error('❌ Erro ao enviar para CAPI:', capiError);
          }
        }
      }
      
      res.json({
        success: true,
        sales_count: sales.items.length,
        visitors_count: recentVisitors.length,
        matches_count: newMatches.length,
        new_matches: newMatches.map(m => ({
          confidence: m.matchResult.confidence,
          method: m.matchResult.method,
          sale_id: m.sale.transaction,
          visitor_city: m.visitor.city,
          time_diff: m.matchResult.details.time_diff_minutes
        }))
      });
      
    } catch (error) {
      console.error('❌ Erro ao verificar vendas:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      });
    }
  });

  // 📊 Webhook da Hotmart para receber vendas em tempo real
  app.post('/api/webhook/hotmart', async (req, res) => {
    try {
      console.log('🎯 Webhook da Hotmart recebido');
      
      const eventData = req.body;
      
      // Validar estrutura básica do webhook
      if (!eventData || !eventData.data) {
        console.error('❌ Webhook inválido: estrutura incorreta');
        return res.status(400).json({ error: 'Invalid webhook structure' });
      }
      
      const sale = eventData.data;
      
      // Verificar se é uma venda aprovada
      if (sale.status?.transaction_status !== 'APPROVED') {
        console.log('⏭️ Venda não aprovada, ignorando:', sale.status?.transaction_status);
        return res.json({ success: true, message: 'Sale not approved, skipped' });
      }
      
      console.log('💰 Nova venda recebida via webhook:', {
        transaction: sale.transaction,
        buyer_city: sale.buyer?.address?.city,
        purchase_date: sale.purchase_date,
        product: sale.product?.name
      });
      
      // Buscar visitantes das últimas 2 horas (janela menor para webhook)
      const allVisitors = await VisitorDatabase.getAll();
      const recentVisitors = allVisitors.filter(visitor => {
        const visitorTime = new Date(visitor.timestamp).getTime();
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        return visitorTime >= twoHoursAgo;
      });
      
      console.log(`👤 ${recentVisitors.length} visitantes recentes para match de webhook`);
      
      let bestMatch = null;
      let bestScore = 0;
      
      // Tentar fazer match com visitantes recentes
      for (const visitor of recentVisitors) {
        if (!HotmartUtils.isValidVisitor(visitor)) {
          continue;
        }
        
        const matchResult = matchSaleWithVisitor(sale, visitor);
        
        if (matchResult.match && matchResult.confidence > bestScore) {
          bestMatch = {
            sale,
            visitor,
            matchResult,
            matched_at: new Date().toISOString(),
            source: 'webhook'
          };
          bestScore = matchResult.confidence;
        }
      }
      
      if (bestMatch) {
        console.log(`✅ MATCH WEBHOOK ENCONTRADO!`, {
          confidence: bestMatch.matchResult.confidence,
          method: bestMatch.matchResult.method,
          visitor_city: bestMatch.visitor.city,
          time_diff: bestMatch.matchResult.details.time_diff_minutes
        });
        
        // Preparar e enviar dados para CAPI imediatamente
        try {
          const capiData = prepareCAPIData(bestMatch);
          await sendEventToCAPI(capiData);
          console.log('📤 Evento de webhook enviado para Facebook CAPI');
          
          res.json({
            success: true,
            message: 'Match found and sent to CAPI',
            match: {
              confidence: bestMatch.matchResult.confidence,
              method: bestMatch.matchResult.method,
              capi_sent: true
            }
          });
        } catch (capiError) {
          console.error('❌ Erro ao enviar webhook para CAPI:', capiError);
          res.json({
            success: true,
            message: 'Match found but CAPI failed',
            match: {
              confidence: bestMatch.matchResult.confidence,
              method: bestMatch.matchResult.method,
              capi_sent: false,
              capi_error: capiError instanceof Error ? capiError.message : 'Unknown error'
            }
          });
        }
      } else {
        console.log('❌ Nenhum match encontrado para webhook');
        res.json({
          success: true,
          message: 'No match found',
          visitors_checked: recentVisitors.length
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar webhook da Hotmart:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal error' 
      });
    }
  });

  // 📊 Receber e salvar eventos do Facebook
  app.post('/api/facebook/events', async (req, res) => {
    try {
      const eventData = req.body;
      
      console.log('📊 Evento Facebook recebido:', {
        eventType: eventData.eventType,
        sessionId: eventData.sessionId,
        eventId: eventData.eventId
      });
      
      // Salvar no Supabase
      await FacebookEventDatabase.save(eventData);
      
      // Encaminhar para CAPI se necessário
      try {
        await forwardFrontendEventToCAPI(eventData);
      } catch (capiError) {
        console.error('❌ Erro ao encaminhar evento para CAPI:', capiError);
      }
      
      res.json({ success: true, message: 'Evento salvo com sucesso' });
      
    } catch (error) {
      console.error('❌ Erro ao salvar evento Facebook:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 📈 Estatísticas do sistema
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await DatabaseUtils.getFullReport();
      res.json(stats);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 🔍 Debug: Listar visitantes recentes
  app.get('/api/debug/visitors', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const allVisitors = await VisitorDatabase.getAll();
      const recentVisitors = allVisitors.slice(0, limit);
      
      res.json({
        total: allVisitors.length,
        recent: recentVisitors.map(v => ({
          sessionId: v.sessionId,
          city: v.city,
          country: v.country,
          timestamp: v.timestamp,
          ip: v.ip?.substring(0, 8) + '...'
        }))
      });
    } catch (error) {
      console.error('❌ Erro ao buscar visitantes:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 🔍 Debug: Listar eventos Facebook recentes
  app.get('/api/debug/facebook-events', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const allEvents = await FacebookEventDatabase.getAll();
      const recentEvents = allEvents.slice(0, limit);
      
      res.json({
        total: allEvents.length,
        recent: recentEvents.map(e => ({
          eventType: e.eventType,
          sessionId: e.sessionId,
          timestamp: e.timestamp,
          hasCustomParams: Object.keys(e.customParameters || {}).length > 0
        }))
      });
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 🔍 Debug: Buscar dados combinados por sessionId
  app.get('/api/debug/visitor/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const combined = await DatabaseUtils.getVisitorWithEvents(sessionId);
      res.json(combined);
    } catch (error) {
      console.error('❌ Erro ao buscar visitante:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 🧪 Testar Supabase
  app.get('/api/test/supabase', async (req, res) => {
    try {
      const { testConnection } = await import('./database-supabase');
      const isConnected = await testConnection();
      
      if (isConnected) {
        const stats = await DatabaseUtils.getFullReport();
        res.json({
          success: true,
          message: 'Supabase conectado com sucesso',
          stats
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Falha na conexão com Supabase'
        });
      }
    } catch (error) {
      console.error('❌ Erro no teste do Supabase:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno'
      });
    }
  });

  // Continue com as outras rotas existentes...
  // [Resto do código das rotas continua igual]

  const httpServer = createServer(app);
  return httpServer;
}