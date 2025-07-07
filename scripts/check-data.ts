import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

try {
  const { supabase } = await import('../server/supabase');
  
  console.log('📊 Verificando dados no Supabase...\n');
  
  const { data: visitors, error: vError } = await supabase
    .from('visitors')
    .select('session_id, country, city, created_at')
    .order('created_at', { ascending: false });
    
  const { data: events, error: eError } = await supabase
    .from('facebook_events')
    .select('event_type, session_id, created_at')
    .order('created_at', { ascending: false });
  
  if (vError) console.error('Erro visitantes:', vError);
  if (eError) console.error('Erro eventos:', eError);
  
  console.log(`👤 Total visitantes: ${visitors?.length || 0}`);
  console.log(`📊 Total eventos: ${events?.length || 0}\n`);
  
  if (visitors && visitors.length > 0) {
    console.log('🔥 Últimos visitantes:');
    visitors.slice(0, 3).forEach((v, i) => {
      console.log(`${i+1}. ${v.session_id} - ${v.city}, ${v.country} (${new Date(v.created_at).toLocaleString()})`);
    });
  }
  
} catch (error) {
  console.error('❌ Erro:', error);
}