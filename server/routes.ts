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
import { VisitorDatabase, FacebookEventDatabase, DatabaseUtils } from './database-supabase';
import { sendEventToCAPI, testCAPIConnection, getCAPILogs, getCAPIStats, forwardFrontendEventToCAPI } from './facebook-capi';

// Armazenar visitantes temporariamente (em produção usar banco de dados)
const visitorsStorage: any[] = [];
const matchesStorage: any[] = [];

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
      
      // Salvar no banco de dados permanente
      await VisitorDatabase.save(dbVisitorData);
      
      // Manter também no storage temporário para compatibilidade
      visitorsStorage.push({
        ...visitorData,
        received_at: new Date().toISOString()
      });
      
      // Limpar visitantes antigos (mais de 24 horas)
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      const beforeCount = visitorsStorage.length;
      
      for (let i = visitorsStorage.length - 1; i >= 0; i--) {
        const visitor = visitorsStorage[i];
        const visitorTime = new Date(visitor.timestamp).getTime();
        if (visitorTime < cutoff) {
          visitorsStorage.splice(i, 1);
        }
      }
      
      if (visitorsStorage.length !== beforeCount) {
        console.log(`🧹 Limpeza: ${beforeCount - visitorsStorage.length} visitantes antigos removidos`);
      }
      
      res.json({ 
        success: true, 
        message: 'Visitatore salvato con successo',
        visitors_count: visitorsStorage.length
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
      console.log(`👤 ${visitorsStorage.length} visitantes para match`);
      
      const newMatches = [];
      
      // Tentar fazer match de cada venda
      for (const sale of sales.items) {
        if (!HotmartUtils.isValidSale(sale)) {
          continue;
        }
        
        console.log(`🔍 Tentando match para venda:`, {
          transaction: sale.transaction,
          buyer_city: sale.buyer?.address?.city,
          purchase_date: HotmartUtils.formatDate(sale.purchase_date)
        });
        
        let bestMatch = null;
        let bestScore = 0;
        
        // Comparar com todos os visitantes
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
              matched_at: new Date().toISOString()
            };
            bestScore = matchResult.confidence;
          }
        }
        
        if (bestMatch) {
          newMatches.push(bestMatch);
          matchesStorage.push(bestMatch);
          
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
        }
      }
      
      res.json({
        success: true,
        sales_count: sales.items.length,
        visitors_count: visitorsStorage.length,
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

  // 📊 Ver estatísticas
  app.get('/api/hotmart/stats', (req, res) => {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    
    const recentVisitors = visitorsStorage.filter(v => 
      new Date(v.timestamp).getTime() > last24h
    );
    
    const recentMatches = matchesStorage.filter(m => 
      new Date(m.matched_at).getTime() > last24h
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
      match_rate: visitorsStorage.length > 0 
        ? Math.round((matchesStorage.length / visitorsStorage.length) * 100) 
        : 0
    });
  });

  // 🧪 Testar autenticação Hotmart
  app.get('/api/hotmart/test-auth', async (req, res) => {
    try {
      console.log('🧪 Testando autenticação da Hotmart...');
      const token = await getHotmartToken();
      
      res.json({
        success: true,
        message: 'Autenticação funcionando!',
        token_preview: token.substring(0, 20) + '...'
      });
      
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno'
      });
    }
  });

  // 🗄️ BANCO DE DADOS: Estatísticas do banco
  app.get('/api/database/stats', async (req, res) => {
    try {
      const stats = await DatabaseUtils.getFullReport();
      res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 🗄️ BANCO DE DADOS: Receber evento do Facebook
  app.post('/api/database/facebook-event', async (req, res) => {
    try {
      const eventData = req.body;
      
      console.log('📊 Recebendo evento do Facebook:', {
        eventType: eventData.eventType,
        sessionId: eventData.sessionId,
        hasHashedParams: Boolean(eventData.customParameters?.zp)
      });
      
      // Salvar no banco de dados
      await FacebookEventDatabase.save(eventData);
      
      // 📱 ENVIAR PARA FACEBOOK CAPI
      try {
        console.log('📱 Enviando evento para Facebook CAPI...');
        const capiResult = await forwardFrontendEventToCAPI(eventData);
        
        if (capiResult.success) {
          console.log('✅ CAPI: Evento enviado com sucesso!', {
            logId: capiResult.logId,
            eventType: eventData.eventType
          });
        } else {
          console.warn('⚠️ CAPI: Falha ao enviar evento:', capiResult.error);
        }
      } catch (capiError) {
        console.error('❌ CAPI: Erro ao processar evento:', capiError);
      }
      
      res.json({ 
        success: true, 
        message: 'Evento do Facebook salvo com sucesso' 
      });
      
    } catch (error) {
      console.error('❌ Erro ao salvar evento do Facebook:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 🗄️ BANCO DE DADOS: Buscar visitante por ID
  app.get('/api/database/visitor/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await DatabaseUtils.getVisitorWithEvents(sessionId);
      
      if (!result.visitor) {
        return res.status(404).json({ 
          success: false, 
          error: 'Visitante não encontrado' 
        });
      }
      
      res.json({
        success: true,
        ...result
      });
      
    } catch (error) {
      console.error('❌ Erro ao buscar visitante:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 🗄️ BANCO DE DADOS: Exportar todos os dados
  app.get('/api/database/export', async (req, res) => {
    try {
      const exportData = await DatabaseUtils.exportAllData();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="chef-amelie-data-export.json"');
      res.json(exportData);
      
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 📱 FACEBOOK CAPI: Estatísticas e monitoramento
  app.get('/api/capi/stats', (req, res) => {
    try {
      const stats = getCAPIStats();
      res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas CAPI:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 📱 FACEBOOK CAPI: Logs de envios
  app.get('/api/capi/logs', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const logs = getCAPILogs(limit);
      
      res.json({
        success: true,
        logs,
        total: logs.length
      });
    } catch (error) {
      console.error('❌ Erro ao obter logs CAPI:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // 📱 FACEBOOK CAPI: Testar conexão
  app.post('/api/capi/test', async (req, res) => {
    try {
      console.log('🧪 Testando conexão Facebook CAPI...');
      const testResult = await testCAPIConnection();
      
      res.json({
        success: testResult.success,
        message: testResult.message,
        details: testResult.details
      });
    } catch (error) {
      console.error('❌ Erro ao testar CAPI:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao testar CAPI',
        error: error instanceof Error ? error.message : 'Erro interno' 
      });
    }
  });

  // 📱 FACEBOOK CAPI: Enviar evento manual
  app.post('/api/capi/send-event', async (req, res) => {
    try {
      const eventData = req.body;
      console.log('📱 Enviando evento manual para CAPI:', eventData);
      
      const result = await sendEventToCAPI(eventData);
      
      res.json(result);
    } catch (error) {
      console.error('❌ Erro ao enviar evento manual CAPI:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      });
    }
  });

  // 🔍 DEBUG: Ver dados dos visitantes
  app.get('/api/debug/visitors', (req, res) => {
    res.json({
      total_visitors: visitorsStorage.length,
      visitors: visitorsStorage.map(v => ({
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
          userAgent: v.visitor_data?.userAgent?.substring(0, 50) + '...'
        }
      }))
    });
  });

  // 🔍 DEBUG: Testar match manualmente
  app.post('/api/debug/test-match', (req, res) => {
    try {
      const { sale, visitorIndex } = req.body;
      
      if (visitorIndex >= visitorsStorage.length) {
        return res.status(400).json({
          error: 'Índice de visitante inválido',
          total_visitors: visitorsStorage.length
        });
      }
      
      const visitor = visitorsStorage[visitorIndex];
      const matchResult = matchSaleWithVisitor(sale, visitor.visitor_data);
      
      res.json({
        success: true,
        visitor: visitor,
        sale: sale,
        match_result: matchResult
      });
      
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno'
      });
    }
  });

  // 🎯 Receber webhook da Hotmart via N8N
  app.post('/api/hotmart/webhook', (req, res) => {
    try {
      console.log('🎯 Webhook da Hotmart recebido via N8N!');
      
      const webhookData = req.body;
      const saleData = webhookData.body?.data;
      
      if (!saleData) {
        return res.status(400).json({
          success: false,
          error: 'Dados da venda não encontrados no webhook'
        });
      }
      
      console.log('💰 Dados da venda:', {
        event: webhookData.body.event,
        transaction: saleData.purchase?.transaction,
        buyer_email: saleData.buyer?.email,
        buyer_city: saleData.buyer?.address?.city,
        order_date: new Date(saleData.purchase?.order_date).toISOString(),
        status: saleData.purchase?.status,
        value: saleData.purchase?.price?.value
      });
      
      // Converter dados da Hotmart para formato compatível
      const hotmartSale = {
        transaction: saleData.purchase?.transaction,
        purchase_date: new Date(saleData.purchase?.order_date).toISOString(),
        status: {
          transaction_status: saleData.purchase?.status === 'CANCELED' ? 'CANCELED' : 'APPROVED'
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
          value: saleData.purchase?.price?.value * 100, // Converter para centavos
          currency_value: saleData.purchase?.price?.currency_value
        },
        product: {
          id: saleData.product?.id,
          name: saleData.product?.name
        }
      };
      
      console.log('🔍 Procurando match com visitantes...');
      console.log(`👤 ${visitorsStorage.length} visitantes disponíveis para match`);
      
      let bestMatch = null;
      let bestScore = 0;
      
      // Tentar match com todos os visitantes
      for (const visitor of visitorsStorage) {
        if (!HotmartUtils.isValidVisitor(visitor.visitor_data)) {
          continue;
        }
        
        const matchResult = matchSaleWithVisitor(hotmartSale, visitor.visitor_data);
        
        console.log(`🎯 Match tentativa:`, {
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
            matched_at: new Date().toISOString(),
            webhook_data: webhookData.body
          };
          bestScore = matchResult.confidence;
        }
      }
      
      if (bestMatch) {
        matchesStorage.push(bestMatch);
        
        console.log('🎉 MATCH ENCONTRADO!', {
          confidence: bestMatch.matchResult.confidence,
          method: bestMatch.matchResult.method,
          time_diff: bestMatch.matchResult.details.time_diff_minutes,
          visitor_session: bestMatch.visitor.external_id
        });
        
        // Preparar dados para CAPI se for venda aprovada
        if (hotmartSale.status.transaction_status === 'APPROVED') {
          const capiData = prepareCAPIData(bestMatch);
          console.log('📱 Dados CAPI preparados:', {
            event_name: capiData.data[0].event_name,
            value: capiData.data[0].custom_data.value
          });
        }
        
        res.json({
          success: true,
          message: 'Webhook processado e match encontrado!',
          match: {
            confidence: bestMatch.matchResult.confidence,
            method: bestMatch.matchResult.method,
            time_diff_minutes: bestMatch.matchResult.details.time_diff_minutes,
            sale_status: hotmartSale.status.transaction_status
          }
        });
      } else {
        console.log('❌ Nenhum match encontrado para esta venda');
        
        res.json({
          success: true,
          message: 'Webhook processado, mas nenhum match encontrado',
          sale_info: {
            transaction: hotmartSale.transaction,
            buyer_city: hotmartSale.buyer?.address?.city,
            order_date: hotmartSale.purchase_date,
            status: hotmartSale.status.transaction_status
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno'
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
