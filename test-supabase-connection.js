// Test simple de conexión Supabase
const { createClient } = require('@supabase/supabase-js');

// Usar las credenciales correctas del .env.local
const supabaseUrl = 'https://lbjslbhglvanctbtoehi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxianNsYmhnbHZhbmN0YnRvZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDkzMjMsImV4cCI6MjA3MDg4NTMyM30.9vxxt0dikYY66U6ZoqBzDiq2LIdZPeoZHIsudq2lVn4';

console.log('🔍 Probando conexión a Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Probando consulta simple...');
    
    const { data, error, count } = await supabase
      .from('productos')
      .select('codigo, nombre, ancho', { count: 'exact' })
      .limit(3);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ Conexión exitosa!');
    console.log('📦 Total productos:', count);
    console.log('🎯 Primeros 3 productos:');
    data?.forEach(p => {
      console.log(`  - ${p.codigo}: ${p.nombre} | Ancho: ${p.ancho}`);
    });
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection();