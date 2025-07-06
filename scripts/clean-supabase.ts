import { config } from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), '.env') });

console.log('🧹 Limpando banco Supabase para começar do zero...\n');

try {
  // Importar dinamicamente
  const { supabase } = await import('../server/supabase');
  
  console.log('🗑️ Excluindo todos os dados de teste...');
  
  // Limpar eventos primeiro (por causa da foreign key)
  const { error: eventsError } = await supabase
    .from('facebook_events')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo
  
  if (eventsError) {
    console.error('❌ Erro ao limpar eventos:', eventsError);
  } else {
    console.log('✅ Eventos Facebook limpos');
  }
  
  // Limpar visitantes
  const { error: visitorsError } = await supabase
    .from('visitors')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo
  
  if (visitorsError) {
    console.error('❌ Erro ao limpar visitantes:', visitorsError);
  } else {
    console.log('✅ Visitantes limpos');
  }
  
  // Verificar se está vazio
  const { data: visitors } = await supabase.from('visitors').select('id');
  const { data: events } = await supabase.from('facebook_events').select('id');
  
  console.log('\n📊 Estado atual:');
  console.log(`👤 Visitantes: ${visitors?.length || 0}`);
  console.log(`📊 Eventos: ${events?.length || 0}`);
  
  if ((visitors?.length || 0) === 0 && (events?.length || 0) === 0) {
    console.log('\n🎉 Banco Supabase limpo com sucesso!');
    console.log('🚀 Agora você pode fazer deploy e ter apenas dados reais!');
  }
  
} catch (error) {
  console.error('❌ Erro:', error);
}