import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 DEBUG: Consultando Supabase directamente...');
    
    // Consultar productos con filtro específico
    const { data: allProducts, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .order('codigo');
    
    if (error) {
      console.error('❌ Error Supabase:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }
    
    console.log(`📊 SUPABASE: ${allProducts?.length || 0} productos encontrados`);
    
    // Agrupar por categoría para diagnóstico
    const porCategoria = allProducts?.reduce((acc: any, prod: any) => {
      const cat = prod.categoria || 'Sin Categoria';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(prod);
      return acc;
    }, {});
    
    // Filtrar solo Perfiles Alveolar para diagnóstico específico (ambos nombres posibles)
    const perfilesAlveolar = allProducts?.filter(p => 
      p.categoria === 'Perfiles Alveolar' || p.categoria === 'Perfiles'
    ) || [];
    
    console.log('🔍 PERFILES ALVEOLAR encontrados:');
    perfilesAlveolar.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.codigo} - ${p.nombre} - ${p.categoria}`);
    });
    
    return NextResponse.json({
      success: true,
      totalProductos: allProducts?.length || 0,
      categorias: Object.keys(porCategoria || {}),
      porCategoria: Object.keys(porCategoria || {}).reduce((acc: any, cat) => {
        acc[cat] = porCategoria[cat].length;
        return acc;
      }, {}),
      perfilesAlveolar: perfilesAlveolar.map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        precio_neto: p.precio_neto,
        stock: p.stock
      })),
      primeros5: allProducts?.slice(0, 5).map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        precio_neto: p.precio_neto
      })) || []
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}