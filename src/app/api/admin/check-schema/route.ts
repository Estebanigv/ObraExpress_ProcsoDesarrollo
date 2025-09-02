import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Verificando esquema de tabla productos...');

    // Consultar las columnas de la tabla directamente desde information_schema
    const { data: columns, error } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'productos')
      .eq('table_schema', 'public');

    if (error) {
      console.error('❌ Error consultando esquema:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    // Intentar una consulta simple para ver si la tabla existe
    const { data: testQuery, error: testError } = await supabaseAdmin
      .rpc('exec', { 
        sql: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'productos\' AND table_schema = \'public\' ORDER BY ordinal_position;' 
      });

    if (testError) {
      console.error('❌ Error en consulta SQL directa:', testError);
    }

    // Intentar consultar la tabla directamente con SELECT básico
    let tableExists = false;
    let tableError = null;
    try {
      const { error: basicError } = await supabaseAdmin
        .from('productos')
        .select('count', { count: 'exact', head: true });
      
      if (!basicError) {
        tableExists = true;
      } else {
        tableError = basicError.message;
      }
    } catch (e) {
      tableError = e.message;
    }

    return NextResponse.json({
      success: true,
      schema: {
        columns: columns || [],
        totalColumns: columns?.length || 0,
        tableExists,
        tableError,
        sqlTest: testQuery
      }
    });

  } catch (error) {
    console.error('❌ Error verificando esquema:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}