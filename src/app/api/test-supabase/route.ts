import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  console.log('🔍 Testing Supabase connection and data...');
  
  const results = {
    connection: false,
    productCount: 0,
    firstProducts: [] as any[],
    error: null as string | null,
    timestamp: new Date().toISOString()
  };

  if (!supabaseAdmin) {
    results.error = 'Supabase admin client not configured';
    return NextResponse.json(results);
  }

  try {
    // Test 1: Count products
    const { count, error: countError } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      results.error = `Count error: ${countError.message}`;
      return NextResponse.json(results);
    }

    results.productCount = count || 0;
    results.connection = true;

    // Test 2: Get first 5 products
    const { data, error: dataError } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, stock, disponible_en_web')
      .limit(5)
      .order('codigo');
    
    if (dataError) {
      results.error = `Data error: ${dataError.message}`;
    } else {
      results.firstProducts = data || [];
    }

    console.log('✅ Supabase test results:', results);
    return NextResponse.json(results);

  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Supabase test error:', error);
    return NextResponse.json(results);
  }
}