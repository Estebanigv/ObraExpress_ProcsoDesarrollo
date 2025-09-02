// Script simple para debuggear Supabase
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lbjslbhglvanctbtoehi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxianNsYmhnbHZhbmN0YnRvZWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU1NzQzMSwiZXhwIjoyMDUxMTMzNDMxfQ.FnBTJqLHWTPYlr4nQVmYmG5YH6WP4a-DxNJa8ZlOE4mPY2Q'
);

async function debugSupabase() {
  console.log('🔍 Debugging Supabase...');
  
  // 1. Verificar estructura de la tabla (método alternativo)
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id')
      .limit(1);
    console.log('📊 Tabla productos:', error ? 'NO EXISTE' : 'EXISTE');
    if (error) console.log('   Error:', error.message);
  } catch (error) {
    console.log('❌ Error verificando tabla:', error.message);
  }
  
  // 2. Contar total de productos
  try {
    const { count } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true });
    console.log('📦 Total productos en Supabase:', count);
  } catch (error) {
    console.log('❌ Error contando productos:', error.message);
  }
  
  // 3. Ver algunos productos de ejemplo
  try {
    const { data } = await supabase
      .from('productos')
      .select('codigo, nombre, categoria, disponible_en_web, stock')
      .limit(5);
    console.log('🎯 Primeros 5 productos:');
    data?.forEach(p => {
      console.log(`  - ${p.codigo}: ${p.nombre} | Cat: ${p.categoria} | Web: ${p.disponible_en_web} | Stock: ${p.stock}`);
    });
  } catch (error) {
    console.log('❌ Error obteniendo productos ejemplo:', error.message);
  }
  
  // 4. Verificar productos con disponible_en_web = true
  try {
    const { count } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('disponible_en_web', true);
    console.log('🌐 Productos disponibles en web:', count);
  } catch (error) {
    console.log('❌ Error verificando productos web:', error.message);
  }
  
  // 5. Verificar por categorías específicas
  try {
    const { data } = await supabase
      .from('productos')
      .select('categoria, disponible_en_web, count(*)')
      .in('categoria', ['Policarbonato', 'Perfiles Alveolar']);
    console.log('📊 Productos por categoría:', data);
  } catch (error) {
    console.log('❌ Error verificando por categoría:', error.message);
  }
}

debugSupabase().catch(console.error);