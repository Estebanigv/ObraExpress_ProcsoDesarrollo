import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando conexión con Supabase...');
    
    // Verificar conexión básica
    const { data, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error conectando con Supabase:', error);
      return NextResponse.json({
        success: false,
        error: `Error de Supabase: ${error.message}`,
        details: error
      }, { status: 500 });
    }

    // Analizar estructura de datos
    const sampleProduct = data?.[0];
    const availableColumns = sampleProduct ? Object.keys(sampleProduct) : [];
    
    console.log('✅ Conexión exitosa con Supabase');
    console.log('📊 Ejemplo de producto:', sampleProduct);
    console.log('📝 Columnas disponibles:', availableColumns);
    
    return NextResponse.json({
      success: true,
      message: 'Conexión con Supabase exitosa',
      stats: {
        totalProducts: data?.length || 0,
        availableColumns,
        sampleProducts: data?.slice(0, 3).map(p => ({
          codigo: p.codigo,
          nombre: p.nombre || 'Sin nombre',
          tipo: p.tipo || 'SIN TIPO',
          ancho: p.ancho || 'SIN ANCHO', 
          largo: p.largo || 'Sin largo',
          espesor: p.espesor || 'Sin espesor',
          stock: p.stock || 0,
          disponible_en_web: p.disponible_en_web
        })) || []
      }
    });

  } catch (error) {
    console.error('💥 Error crítico verificando Supabase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error crítico de conexión',
      details: error.message
    }, { status: 500 });
  }
}