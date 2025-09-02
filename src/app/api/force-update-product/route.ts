import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { codigo, updates } = await request.json();
    
    if (!codigo || !updates) {
      return NextResponse.json({
        success: false,
        error: 'Código y datos de actualización requeridos'
      }, { status: 400 });
    }

    console.log(`🔄 Actualizando producto ${codigo} con:`, updates);

    // Actualizar en Supabase
    const { data, error } = await supabaseAdmin
      .from('productos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('codigo', codigo);

    if (error) {
      console.error('❌ Error actualizando producto:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ Producto ${codigo} actualizado exitosamente`);

    return NextResponse.json({
      success: true,
      message: `Producto ${codigo} actualizado`,
      data
    });

  } catch (error) {
    console.error('💥 Error en force-update-product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET para verificar datos actuales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    
    if (!codigo) {
      return NextResponse.json({
        success: false,
        error: 'Código requerido'
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}