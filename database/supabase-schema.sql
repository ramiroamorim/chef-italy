-- Schema para migração do sistema de armazenamento JSON para Supabase
-- Chef Amélie - Sistema de tracking de visitantes e eventos Facebook

-- Tabela para dados de visitantes
CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(45),
    country VARCHAR(100),
    country_code VARCHAR(2),
    city VARCHAR(100),
    region_name VARCHAR(100),
    zip VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    currency VARCHAR(3),
    isp VARCHAR(255),
    user_agent TEXT,
    page_url TEXT,
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para eventos do Facebook
CREATE TABLE IF NOT EXISTS facebook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('PageView', 'InitiateCheckout')),
    event_id VARCHAR(255) NOT NULL UNIQUE,
    session_id VARCHAR(255) NOT NULL,
    custom_parameters JSONB NOT NULL DEFAULT '{}',
    original_data JSONB NOT NULL DEFAULT '{}',
    formatted_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Chave estrangeira para relacionar com visitantes
    CONSTRAINT fk_facebook_events_session_id 
        FOREIGN KEY (session_id) 
        REFERENCES visitors(session_id) 
        ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_city ON visitors(city);

CREATE INDEX IF NOT EXISTS idx_facebook_events_session_id ON facebook_events(session_id);
CREATE INDEX IF NOT EXISTS idx_facebook_events_event_type ON facebook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_facebook_events_created_at ON facebook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_facebook_events_event_id ON facebook_events(event_id);

-- Comentários para documentação
COMMENT ON TABLE visitors IS 'Dados de visitantes coletados pelo sistema de tracking';
COMMENT ON TABLE facebook_events IS 'Eventos do Facebook Pixel enviados via CAPI';

COMMENT ON COLUMN visitors.session_id IS 'ID único da sessão do visitante';
COMMENT ON COLUMN visitors.ip IS 'Endereço IP do visitante';
COMMENT ON COLUMN visitors.country IS 'País do visitante';
COMMENT ON COLUMN visitors.country_code IS 'Código do país (ISO 3166-1)';
COMMENT ON COLUMN visitors.city IS 'Cidade do visitante';
COMMENT ON COLUMN visitors.region_name IS 'Estado/região do visitante';
COMMENT ON COLUMN visitors.zip IS 'CEP/código postal';
COMMENT ON COLUMN visitors.latitude IS 'Latitude da localização';
COMMENT ON COLUMN visitors.longitude IS 'Longitude da localização';
COMMENT ON COLUMN visitors.timezone IS 'Fuso horário';
COMMENT ON COLUMN visitors.currency IS 'Moeda local';
COMMENT ON COLUMN visitors.isp IS 'Provedor de internet';
COMMENT ON COLUMN visitors.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN visitors.page_url IS 'URL da página visitada';
COMMENT ON COLUMN visitors.referrer IS 'URL de referência';
COMMENT ON COLUMN visitors.utm_source IS 'Fonte UTM';
COMMENT ON COLUMN visitors.utm_medium IS 'Meio UTM';
COMMENT ON COLUMN visitors.utm_campaign IS 'Campanha UTM';
COMMENT ON COLUMN visitors.utm_content IS 'Conteúdo UTM';
COMMENT ON COLUMN visitors.utm_term IS 'Termo UTM';

COMMENT ON COLUMN facebook_events.event_type IS 'Tipo do evento (PageView ou InitiateCheckout)';
COMMENT ON COLUMN facebook_events.event_id IS 'ID único do evento';
COMMENT ON COLUMN facebook_events.session_id IS 'ID da sessão relacionada';
COMMENT ON COLUMN facebook_events.custom_parameters IS 'Parâmetros customizados do evento (JSON)';
COMMENT ON COLUMN facebook_events.original_data IS 'Dados originais antes da formatação (JSON)';
COMMENT ON COLUMN facebook_events.formatted_data IS 'Dados formatados para o Facebook (JSON)';

-- Política de Row Level Security (RLS)
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo via service role
CREATE POLICY "Allow service role full access to visitors" ON visitors
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to facebook_events" ON facebook_events
    FOR ALL USING (auth.role() = 'service_role');

-- Função para estatísticas de visitantes
CREATE OR REPLACE FUNCTION get_visitor_stats()
RETURNS TABLE (
    total_visitors BIGINT,
    unique_countries BIGINT,
    unique_cities BIGINT,
    most_recent_visit TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_visitors,
        COUNT(DISTINCT country)::BIGINT as unique_countries,
        COUNT(DISTINCT city)::BIGINT as unique_cities,
        MAX(created_at) as most_recent_visit
    FROM visitors
    WHERE country IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas de eventos
CREATE OR REPLACE FUNCTION get_event_stats()
RETURNS TABLE (
    total_events BIGINT,
    page_views BIGINT,
    initiate_checkouts BIGINT,
    unique_sessions BIGINT,
    most_recent_event TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_events,
        COUNT(CASE WHEN event_type = 'PageView' THEN 1 END)::BIGINT as page_views,
        COUNT(CASE WHEN event_type = 'InitiateCheckout' THEN 1 END)::BIGINT as initiate_checkouts,
        COUNT(DISTINCT session_id)::BIGINT as unique_sessions,
        MAX(created_at) as most_recent_event
    FROM facebook_events;
END;
$$ LANGUAGE plpgsql;

-- Função para obter visitante com eventos
CREATE OR REPLACE FUNCTION get_visitor_with_events(p_session_id VARCHAR(255))
RETURNS TABLE (
    visitor_data JSON,
    events_data JSON,
    has_events BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        row_to_json(v.*) as visitor_data,
        COALESCE(json_agg(fe.*) FILTER (WHERE fe.id IS NOT NULL), '[]'::json) as events_data,
        COUNT(fe.id) > 0 as has_events
    FROM visitors v
    LEFT JOIN facebook_events fe ON v.session_id = fe.session_id
    WHERE v.session_id = p_session_id
    GROUP BY v.id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar coluna updated_at se necessário
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE facebook_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facebook_events_updated_at ON facebook_events;
CREATE TRIGGER update_facebook_events_updated_at
    BEFORE UPDATE ON facebook_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Informações sobre as tabelas criadas
SELECT 
    'Schema criado com sucesso!' as message,
    COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('visitors', 'facebook_events');