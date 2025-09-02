import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 BUSCANDO SKU 100 Y REGISTROS SOSPECHOSOS...');
    
    // Buscar específicamente SKU 100
    const { data: sku100, error: error100 } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('codigo', '100');

    // Buscar SKUs que no sean códigos de 8+ dígitos (sospechosos)
    const { data: skusSospechosos, error: errorSosp } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, categoria, precio_neto, created_at')
      .not('codigo', 'rlike', '^[0-9]{8,}$')
      .limit(20);

    // Buscar registros con datos extraños
    const { data: registrosExtraños, error: errorExtra } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, categoria, precio_neto, created_at')
      .or('nombre.is.null,nombre.eq.,codigo.lt.1000')
      .limit(10);

    // Contar total de registros en tabla
    const { count: totalRegistros, error: errorCount } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sku100: {
        encontrado: sku100 && sku100.length > 0,
        datos: sku100 || [],
        error: error100?.message || null
      },
      skusSospechosos: {
        encontrados: skusSospechosos?.length || 0,
        datos: skusSospechosos || [],
        error: errorSosp?.message || null
      },
      registrosExtraños: {
        encontrados: registrosExtraños?.length || 0,
        datos: registrosExtraños || [],
        error: errorExtra?.message || null
      },
      totalRegistros: totalRegistros || 0,
      recomendacion: sku100 && sku100.length > 0 
        ? '🚨 SKU 100 encontrado - debe eliminarse'
        : '✅ SKU 100 no encontrado en Supabase'
    });

  } catch (error) {
    console.error('💥 Error buscando SKU 100:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error en búsqueda'
    });
  }
}